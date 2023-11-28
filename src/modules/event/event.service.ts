import { toLocalTime, toUtcTime } from '@common/decorator/date.decorator';
import { RequestUser, UserRole } from '@common/types';
import { getOrderBy, searchByMode } from '@common/utils';
import {
  CreateCommentDto,
  GetCommentDto,
  UpdateCommentDto,
} from '@modules/comments/dto';
import { NotificationService } from '@modules/notification';
import { selectUser } from '@modules/user/utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EventStatus, EventType, Prisma, ResourceStatus } from '@prisma/client';
import { PrismaService } from 'src/database/services';
import { MessageEvent } from 'src/gateway/enum';
import { Pagination } from 'src/providers';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventDto } from './dto/get-events.dto';
import { getSubscribersDto } from './dto/get-subscribers.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { differenceBy } from 'lodash';

@Injectable()
export class EventService {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createEvent(body: CreateEventDto, user: RequestUser) {
    const {
      content,
      documents,
      endAt,
      startAt,
      type,
      forumId,
      displayName,
      location,
    } = body;

    if (type === EventType.FORUM) {
      const forum = await this.dbContext.forum.findUniqueOrThrow({
        where: {
          id: forumId,
        },
        select: {
          modId: true,
        },
      });

      if (forum.modId !== user.id) {
        throw new BadRequestException(
          'You cannot create the event for this forum',
        );
      }
    } else {
      if (!user.roles.includes(UserRole.ADMIN)) {
        throw new BadRequestException('You cannot create this event');
      }
    }

    const documentsCreate: Prisma.EventDocumentCreateWithoutEventInput[] =
      documents && documents.length > 0
        ? documents.map((document) => {
            return {
              fileName: document.fileName,
              fileUrl: document.fileUrl,
              user: {
                connect: {
                  id: user.id,
                },
              },
            };
          })
        : undefined;

    await this.dbContext.event.create({
      data: {
        location,
        content,
        startAt: toUtcTime(startAt),
        endAt: toUtcTime(endAt),
        type,
        status: EventStatus.UPCOMING,
        displayName,
        documents: {
          create: documentsCreate,
        },
      },
    });
  }

  private getUpdateStatus(startAt: Date, endAt: Date) {
    const now = toLocalTime(new Date());
    const endTime = toLocalTime(endAt);
    const startTime = toLocalTime(startAt);
    if (endTime < now) return EventStatus.DONE;
    if (endTime > now && startTime < now) return EventStatus.HAPPENING;
    return EventStatus.UPCOMING;
  }

  private async updateEventStatus() {
    const events = await this.dbContext.event.findMany({
      where: {
        status: {
          in: [EventStatus.UPCOMING, EventStatus.HAPPENING],
        },
      },
    });

    const updateEventsAsync = events.map(async (event) => {
      return this.dbContext.event.update({
        where: {
          id: event.id,
        },
        data: {
          status: this.getUpdateStatus(event.startAt, event.endAt),
        },
      });
    });

    await Promise.all(updateEventsAsync);
  }
  async getEvents(query: GetEventDto, user: RequestUser) {
    const { skip, take, forumIds, search, status, order, from, to } = query;
    await this.updateEventStatus();
    const andWhereConditions: Prisma.Enumerable<Prisma.EventWhereInput> = [];
    const viewConditions: Prisma.Enumerable<Prisma.EventWhereInput> = [
      {
        type: EventType.GENERAL,
      },
    ];
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    if (!isAdmin) {
      const forums = await this.dbContext.forum.findMany({
        where: {
          users: {
            some: {
              userId: user.id,
              status: ResourceStatus.ACTIVE,
            },
          },
        },
        select: {
          id: true,
        },
      });

      viewConditions.push({
        type: EventType.FORUM,
        forumId: {
          in: forums.map(({ id }) => id),
        },
      });
      andWhereConditions.push({ OR: viewConditions });
    }

    if (search) {
      andWhereConditions.push({
        OR: [
          {
            displayName: searchByMode(search),
          },
          {
            content: searchByMode(search),
          },
        ],
      });
    }
    if (forumIds) {
      andWhereConditions.push({
        forumId: {
          in: forumIds,
        },
      });
    }
    if (status) {
      andWhereConditions.push({
        status,
      });
    }
    if (from) {
      const fromTime = toUtcTime(new Date(from));
      const toTime = to ?? new Date();
      andWhereConditions.push({
        OR: [
          {
            startAt: { lte: fromTime },
            endAt: { lte: toTime, gte: fromTime },
          },
          {
            startAt: {
              gte: fromTime,
              lte: toTime,
            },
            endAt: { lte: toTime },
          },
        ],
      });
    }

    const [events, total] = await Promise.all([
      this.dbContext.event.findMany({
        where: {
          AND: andWhereConditions,
        },
        include: {
          _count: {
            select: {
              comments: true,
              users: true,
            },
          },
        },
        skip,
        take,
        orderBy: getOrderBy({ order, defaultValue: 'createdAt' }),
      }),
      this.dbContext.event.count({
        where: {
          AND: andWhereConditions,
        },
      }),
    ]);

    return Pagination.of(
      { skip, take },
      total,
      events.map((event) => ({
        ...event,
        startAt: toLocalTime(event.startAt),
        endAt: toLocalTime(event.endAt),
      })),
    );
  }
  async getEventById(id: string) {
    const event = await this.dbContext.event.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return event;
  }

  async getIsValidUser(
    user: RequestUser,
    forum?: {
      modId: string;
    },
  ) {
    if (forum) {
      return forum.modId === user.id;
    }
    return user.roles.includes(UserRole.ADMIN);
  }

  async deleteEvent(id: string, user: RequestUser) {
    const event = await this.dbContext.event.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        forum: true,
      },
    });

    const canDeleteEvent = this.getIsValidUser(user, event.forum);

    if (!canDeleteEvent) {
      throw new ForbiddenException('You cannot delete this event');
    }

    await this.dbContext.event.delete({
      where: { id },
    });
  }

  async cancelEvent(id: string, user: RequestUser) {
    const event = await this.dbContext.event.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        forum: true,
      },
    });
    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('This event is already cancelled');
    }

    const canCancelEvent = this.getIsValidUser(user, event.forum);
    if (!canCancelEvent) {
      throw new ForbiddenException('You cannot cancel this event');
    }

    await this.dbContext.event.update({
      where: { id },
      data: {
        status: EventStatus.CANCELLED,
      },
    });
  }

  async updateEvent(id: string, user: RequestUser, body: UpdateEventDto) {
    const { content, displayName, documents, endAt, location, startAt } = body;
    const event = await this.dbContext.event.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        forum: true,
        documents: true,
      },
    });
    if (event.status !== EventStatus.UPCOMING) {
      throw new BadRequestException('You cannot edit this event');
    }

    const canUpdateEvent = this.getIsValidUser(user, event.forum);
    if (!canUpdateEvent) {
      throw new ForbiddenException('You cannot edit this event');
    }

    const newDocuments = differenceBy(documents, event.documents, 'fileUrl');
    const oldDocuments = differenceBy(event.documents, documents, 'fileUrl');

    const deleteDocuments = oldDocuments.length
      ? {
          id: {
            in: oldDocuments.map(({ id }) => id),
          },
        }
      : undefined;

    const createDocuments = newDocuments.length
      ? {
          data: newDocuments.map(({ fileName, fileUrl }) => ({
            fileName,
            fileUrl,
            userId: user.id,
          })),
        }
      : undefined;
    await this.dbContext.event.update({
      where: {
        id,
      },
      data: {
        content,
        displayName,
        location,
        startAt: toUtcTime(startAt),
        endAt: toUtcTime(endAt),
        documents: {
          deleteMany: deleteDocuments,
          createMany: createDocuments,
        },
      },
    });
  }
  async subscribeEvent(id: string, user: RequestUser) {
    const event = await this.dbContext.event.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        forum: {
          include: {
            users: true,
          },
        },
        users: true,
      },
    });

    const doneStatuses: EventStatus[] = [
      EventStatus.DONE,
      EventStatus.CANCELLED,
    ];
    if (doneStatuses.includes(event.status)) {
      throw new BadRequestException(
        'The event is already ended or has been cancelled',
      );
    }

    if (event.forum) {
      const userIsInForum = event.forum.users.some(
        ({ userId, status }) =>
          userId === user.id && status === ResourceStatus.ACTIVE,
      );

      if (!userIsInForum) {
        throw new ForbiddenException('You do not belong to this forum');
      }
    }

    const userInEvent = event.users.some(({ userId }) => userId === user.id);
    if (userInEvent) {
      throw new BadRequestException(
        'You have already subscribed to this event',
      );
    }

    await this.dbContext.userToEvent.create({
      data: {
        eventId: id,
        userId: user.id,
      },
    });
  }

  async unsubscribeEvent(id: string, user: RequestUser) {
    const event = await this.dbContext.event.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        forum: {
          include: {
            users: true,
          },
        },
        users: true,
      },
    });

    const doneStatuses: EventStatus[] = [
      EventStatus.DONE,
      EventStatus.CANCELLED,
    ];
    if (doneStatuses.includes(event.status)) {
      throw new BadRequestException(
        'The event is already ended or has been cancelled',
      );
    }

    if (event.forum) {
      const userIsInForum = event.forum.users.some(
        ({ userId, status }) =>
          userId === user.id && status === ResourceStatus.ACTIVE,
      );

      if (!userIsInForum) {
        throw new ForbiddenException('You do not belong to this forum');
      }
    }

    const userInEvent = event.users.some(({ userId }) => userId === user.id);
    if (!userInEvent) {
      throw new BadRequestException(
        'You have already subscribed to this event',
      );
    }

    await this.dbContext.userToEvent.delete({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: id,
        },
      },
    });
  }

  async getSubscribers(id: string, query: getSubscribersDto) {
    const { skip, search, take } = query;

    const andWhereConditions: Prisma.Enumerable<Prisma.UserToEventWhereInput> =
      [
        {
          eventId: id,
        },
      ];

    if (search) {
      andWhereConditions.push({
        user: {
          OR: [
            {
              fullName: searchByMode(search),
            },
            {
              email: searchByMode(search),
            },
          ],
        },
      });
    }
    const [subscribers, total] = await Promise.all([
      this.dbContext.userToEvent.findMany({
        where: {
          AND: andWhereConditions,
        },
        skip,
        take,
        include: {
          user: selectUser,
        },
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      }),
      this.dbContext.userToEvent.count({
        where: {
          AND: andWhereConditions,
        },
      }),
    ]);

    return Pagination.of(
      { skip, take },
      total,
      subscribers.map((s) => ({
        id: s.userId,
        ...s.user,
      })),
    );
  }

  async createEventComment(
    eventId: string,
    user: RequestUser,
    dto: CreateCommentDto,
  ) {
    const eventComment = await this.dbContext.eventComment.create({
      data: {
        eventId,
        userId: user.id,
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            fullName: true,
            email: true,
            dateOfBirth: true,
            gender: true,
            phoneNumber: true,
            address: true,
            avatarUrl: true,
            type: true,
            facultyId: true,
          },
        },
        event: true,
      },
    });

    const postOwnerId = eventComment.event.userId;
    const commentOwnerId = user.id;

    // if (postOwnerId !== commentOwnerId) {
    //   await this.notificationService.notifyNotification(
    //     eventComment.user,
    //     eventComment.event.userId,
    //     MessageEvent.EVENT_COMMENT_CREATED,
    //     {
    //       content: `đã đăng một bình luận vào sự kiện của bạn`,
    //       modelId: eventComment.eventId,
    //       modelName: 'event',
    //       receiverId: eventComment.event.userId,
    //     },
    //   );
    // }

    return eventComment;
  }

  async getEventComments(eventId: string, dto: GetCommentDto) {
    const [eventComments, totalRecords] = await Promise.all([
      this.dbContext.eventComment.findMany({
        where: {
          eventId,
        },
        skip: dto.skip,
        take: dto.take,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              address: true,
              avatarUrl: true,
              dateOfBirth: true,
              email: true,
              gender: true,
            },
          },
        },
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      }),
      this.dbContext.eventComment.count({ where: { eventId } }),
    ]);

    return {
      totalRecords,
      data: eventComments,
    };
  }

  async updateEventComment(
    eventId: string,
    userId: string,
    eventCommentId: string,
    dto: UpdateCommentDto,
  ) {
    await this.dbContext.eventComment.update({
      where: { id: eventCommentId, userId, eventId },
      data: dto,
    });
  }

  async deleteEventComment(
    eventId: string,
    userId: string,
    eventCommentId: string,
  ) {
    await this.dbContext.eventComment.delete({
      where: { id: eventCommentId, userId, eventId },
    });
  }
}
