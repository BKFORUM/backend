import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { CreateEventDto } from './dto/create-event.dto';
import { RequestUser, UserRole } from '@common/types';
import { EventStatus, EventType, Prisma, ResourceStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { toLocalTime, toUtcTime } from '@common/decorator/date.decorator';
import { GetEventDto } from './dto/get-events.dto';
import { getOrderBy, searchByMode } from '@common/utils';
import { Pagination } from 'src/providers';

@Injectable()
export class EventService {
  constructor(private readonly dbContext: PrismaService) {}

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
          status: this.getUpdateStatus(event.startAt, event.createdAt),
        },
      });
    });

    await Promise.all(updateEventsAsync);
  }

  async updateEvent() {}
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
  async subscribeEvent() {}
}
