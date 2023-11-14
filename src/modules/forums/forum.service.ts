import { NOT_MEMBER, RequestUser, UserRole } from '@common/types';
import { NotificationService } from '@modules/notification';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import { TopicService } from '@modules/topic';
import { UserService } from '@modules/user';
import { selectUser } from '@modules/user/utils';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Forum,
  ForumType,
  GroupUserType,
  Prisma,
  ResourceStatus,
} from '@prisma/client';
import { difference, first } from 'lodash';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { MessageEvent } from 'src/gateway/enum';
import { PaginatedResult, Pagination } from 'src/providers';
import {
  AddUsersToForumDto,
  CreateForumDto,
  GetAllForumsDto,
  UpdateForumDto,
} from './dto';
import { ForumRequestDto } from './dto/forum-request.dto';
import { ForumResponse } from './interfaces';

@Injectable()
export class ForumService {
  constructor(
    private readonly dbContext: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly topicService: TopicService,
    private readonly event: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) {}

  private readonly logger = new Logger(ForumService.name);

  async getAllForums(
    { skip, take, order, search, isPending }: GetAllForumsDto,
    user: RequestUser,
  ): Promise<PaginatedResult<ForumResponse>> {
    const whereConditions: Prisma.Enumerable<Prisma.ForumWhereInput> = [
      {
        status: isPending ? ResourceStatus.PENDING : ResourceStatus.ACTIVE,
      },
    ];

    if (search) {
      whereConditions.push({
        OR: [
          {
            name: searchByMode(search),
          },
        ],
      });
    }

    const mappedOrderType = {
      moderator: 'moderator.fullName',
      totalUsers: 'users._count',
    };

    let orderBy: Prisma.ForumOrderByWithRelationInput = getOrderBy<Forum>({
      defaultValue: 'createdAt',
      order,
      mappedOrder: mappedOrderType,
    });

    const [total, forums] = await Promise.all([
      this.dbContext.forum.count({
        where: {
          AND: whereConditions,
        },
      }),
      this.dbContext.forum.findMany({
        where: {
          AND: whereConditions,
        },
        skip,
        orderBy,
        take,
        select: {
          id: true,
          type: true,
          name: true,
          status: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          users: {
            select: {
              userId: true,
              status: true,
            },
          },
          moderator: {
            select: {
              id: true,
              fullName: true,
              gender: true,
              dateOfBirth: true,
              avatarUrl: true,
              faculty: {
                select: {
                  id: true,
                  name: true,
                },
              },
              type: true,
            },
          },
          topics: {
            select: {
              topic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              users: {
                where: {
                  status: ResourceStatus.ACTIVE,
                },
              },
              posts: {
                where: {
                  status: ResourceStatus.ACTIVE,
                },
              },
            },
          },
        },
      }),
    ]);

    return Pagination.of(
      { take, skip },
      total,
      forums.map((forum) => {
        return {
          ...forum,
          topics: forum.topics.map(({ topic }) => topic),
          yourStatus:
            forum.users.find(({ userId }) => user.id === userId)?.status ??
            NOT_MEMBER,
        };
      }),
    );
  }

  async createForum(body: CreateForumDto, user: RequestUser) {
    const { moderatorId, name, type, topicIds, userIds, avatarUrl } = body;
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isHomeRoom = type === ForumType.HOMEROOM;
    const isAbleCreateForumType = (isAdmin && isHomeRoom) || !isHomeRoom;

    if (!isAbleCreateForumType) {
      throw new BadRequestException(
        'You do not have the permission to create this type of forum',
      );
    }

    await this.userService.findById(moderatorId);

    if (userIds && userIds.length > 0) {
      if (userIds.includes(moderatorId)) {
        throw new BadRequestException(
          'You cannot include moderator in the member list',
        );
      }
      await this.userService.validateUserIds(userIds);
    }

    if (topicIds && topicIds.length > 0) {
      await this.topicService.validateTopicIds(topicIds);
    }

    const userCreateMany = userIds
      ? {
          data: userIds
            .filter((userId) => userId !== moderatorId)
            .map((userId) => ({
              userType: GroupUserType.MEMBER,
              userId,
            })),
          skipDuplicates: true,
        }
      : undefined;

    const allUserIds = userIds ? [...userIds, moderatorId] : [moderatorId];

    const topicCreateMany = topicIds
      ? topicIds.map((topicId) => ({
          topicId,
        }))
      : undefined;

    await this.dbContext.forum.create({
      data: {
        name,
        modId: moderatorId,
        status: isAdmin ? ResourceStatus.ACTIVE : ResourceStatus.PENDING,
        type,
        avatarUrl,
        users: {
          create: {
            userType: GroupUserType.MODERATOR,
            userId: moderatorId,
          },
          createMany: userCreateMany,
        },
        conversation: isAdmin
          ? {
              create: {
                displayName: name,
                avatarUrl: avatarUrl,
                users: {
                  createMany: {
                    data: allUserIds.map((userId) => ({
                      userId,
                    })),
                  },
                },
              },
            }
          : undefined,
        topics: !isHomeRoom
          ? {
              createMany: {
                data: topicCreateMany,
              },
            }
          : undefined,
      },
    });
  }

  async getForumById(id: string) {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        avatarUrl: true,
        name: true,
        moderator: selectUser,
        topics: {
          select: {
            topic: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        posts: {
          where: {
            status: ResourceStatus.ACTIVE,
          },
          select: {
            id: true,
            user: selectUser,
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
            createdAt: true,
          },
        },
        users: {
          where: {
            status: ResourceStatus.ACTIVE,
          },
          select: {
            user: selectUser,
          },
        },
      },
    });

    return forum;
  }

  async updateForum(
    forumId: string,
    dto: UpdateForumDto,
    user: RequestUser,
  ): Promise<void> {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: { id: forumId },
      include: {
        topics: true,
      },
    });
    const isAbleEdit =
      user.roles.includes(UserRole.ADMIN) || user.id === forum.modId;

    if (!isAbleEdit) {
      throw new BadRequestException(
        'You do not have permission to update this forum',
      );
    }

    const topicForumIds = forum.topics.map((topic) => topic.topicId);

    await Promise.all([
      this.updateTopics(forumId, topicForumIds, dto.topicIds),
      this.updateName(forumId, dto.name),
      this.updateType(forumId, dto.type),
      this.updateStatus(forumId, dto.status),
      this.updateAvatar(forumId, dto.avatarUrl),
    ]);
  }

  async updateAvatar(forumId: string, avatarUrl: string) {
    if (avatarUrl) {
      await this.dbContext.forum.update({
        where: { id: forumId },
        data: {
          avatarUrl,
          conversation: {
            update: {
              avatarUrl,
            },
          },
        },
      });
    }
  }

  async updateTopics(
    forumId: string,
    topicForumIds: string[],
    topicIdsDto?: string[],
  ): Promise<void> {
    if (topicIdsDto) {
      const existedTopics = await this.dbContext.topic.findMany({
        where: {
          id: {
            in: topicIdsDto,
          },
        },
      });

      if (existedTopics.length !== topicIdsDto.length) {
        throw new NotFoundException('One or more topics not found');
      }

      const newTopicIdsDto = difference(topicIdsDto, topicForumIds);
      const oldTopicIdsDto = difference(topicForumIds, topicIdsDto);
      const createTopics = newTopicIdsDto.map((topicId) => ({
        forumId,
        topicId,
      }));

      await Promise.all([
        this.dbContext.forumToTopic.createMany({
          data: createTopics,
        }),
        this.dbContext.forumToTopic.deleteMany({
          where: {
            forumId,
            topicId: {
              in: oldTopicIdsDto,
            },
          },
        }),
      ]);
    }
  }

  async updateName(forumId: string, name?: string): Promise<void> {
    if (name) {
      await this.dbContext.forum.update({
        where: { id: forumId },
        data: {
          name,
          conversation: {
            update: {
              displayName: name,
            },
          },
        },
      });
    }
  }

  async updateType(forumId: string, type?: ForumType): Promise<void> {
    if (type) {
      await this.dbContext.forum.update({
        where: { id: forumId },
        data: {
          type,
        },
      });
    }
  }

  async updateStatus(forumId: string, status?: ResourceStatus): Promise<void> {
    if (status) {
      await this.dbContext.forum.update({
        where: { id: forumId },
        data: {
          status,
        },
      });
    }
  }

  async deleteForum(id: string): Promise<void> {
    await this.dbContext.forum.findUniqueOrThrow({ where: { id } });
    await this.dbContext.forum.delete({ where: { id } });
  }

  async addUsersToForum(
    forumId: string,
    dto: AddUsersToForumDto,
    user: RequestUser,
  ): Promise<void> {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: { id: forumId },
      select: {
        status: true,
        modId: true,
        conversation: {
          select: {
            id: true,
          },
        },
      },
    });

    if (forum.status === ResourceStatus.PENDING) {
      throw new BadRequestException(
        'This forum is pending and needs to be approved to add users',
      );
    }

    const isAbleAddUsers =
      user.id === forum.modId || user.roles.includes(UserRole.ADMIN);

    if (!isAbleAddUsers) {
      throw new ForbiddenException();
    }

    const users = await this.userService.validateUserIds(dto.userIds);

    const userToForum = await this.dbContext.userToForum.findMany({
      where: {
        forumId,
        AND: {
          userId: {
            in: dto.userIds,
          },
        },
      },
    });

    if (userToForum.length > 0) {
      throw new BadRequestException(`One of the user is already in the forum`);
    }

    const data = dto.userIds.map((userId) => {
      return {
        forumId: forumId,
        userId,
        userType: GroupUserType.MEMBER,
      };
    });

    await this.dbContext.$transaction(async (trx) => {
      await Promise.all([
        trx.userToForum.createMany({
          data,
        }),

        await trx.conversation.update({
          where: {
            forumId,
          },
          data: {
            users: {
              createMany: {
                data: dto.userIds.map((userId) => ({
                  userId,
                })),
                skipDuplicates: true,
              },
            },
          },
        }),
      ]);

      this.event.emit(MessageEvent.CONVERSATION_JOINED, {
        users,
        conversationId: forum.conversation.id,
      });
    });
  }

  async getPostsOfForum(
    id: string,
    { skip, take, order, search, status }: GetAllPostsDto,
    userId: string,
  ) {
    const whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [
      {
        forumId: id,
        status,
      },
    ];
    if (search) {
      whereConditions.push({
        content: searchByMode(search),
      });
    }

    let orderBy: Prisma.ForumOrderByWithRelationInput = {};

    if (order) {
      orderBy = getOrderBy<Forum>({
        defaultValue: 'createdAt',
        order,
      });
    }

    const [total, posts] = await Promise.all([
      this.dbContext.post.count({
        where: {
          AND: whereConditions,
        },
      }),
      this.dbContext.post.findMany({
        where: {
          AND: whereConditions,
        },
        skip,
        orderBy,
        take,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          content: true,
          status: true,
          documents: true,
          forum: {
            select: {
              id: true,
              name: true,
              modId: true,
              avatarUrl: true,
            },
          },
          likes: {
            where: { userId },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          user: {
            select: {
              id: true,
              avatarUrl: true,
              fullName: true,
              email: true,
              gender: true,
            },
          },
        },
      }),
    ]);

    const postResponse = posts.map((post) => {
      return {
        ...post,
        likedAt: post.likes.length ? first(post.likes).createdAt : null,
      };
    });

    return Pagination.of({ take, skip }, total, postResponse);
  }

  async createForumRequest(id: string, user: RequestUser) {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: { id },
      include: {
        users: true,
      },
    });
    const forumMember = forum.users.some(({ userId }) => userId === user.id);

    if (forumMember) {
      throw new BadRequestException('You are already member of this forum');
    }

    const request = await this.dbContext.userToForum.create({
      data: {
        userType: GroupUserType.MEMBER,
        forumId: id,
        status: ResourceStatus.PENDING,
        userId: user.id,
      },
      select: {
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
      },
    });

    await this.notificationService.notifyNotification(
      request.user,
      forum.modId,
      MessageEvent.REQUEST_FORUM_CREATED,
      {
        content: `${user.fullName} đã yêu cầu vào forum của bạn`,
        modelId: forum.id,
        modelName: 'forum',
        receiverId: forum.modId,
      },
    );

    await this.logger.log('Created a forum request', { request });
  }

  async getForumRequests(id: string, user: RequestUser) {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        modId: true,
      },
    });
    if (user.id !== forum.modId) {
      throw new BadRequestException('You do not have permission to view this');
    }
    const userToForums = this.dbContext.userToForum.findMany({
      where: {
        forumId: id,
        status: ResourceStatus.PENDING,
      },
      select: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
          },
        },

        userType: true,
      },
      orderBy: {
        createdAt: Prisma.SortOrder.asc,
      },
    });

    return userToForums;
  }

  async patchForumRequests(
    forumId: string,
    { userId, status }: ForumRequestDto,
    user: RequestUser,
  ) {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: {
        id: forumId,
      },
      select: {
        modId: true,
        conversation: {
          select: { id: true },
        },
        users: true,
        name: true,
        avatarUrl: true,
        moderator: {
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
      },
    });

    if (user.id !== forum.modId) {
      throw new BadRequestException('You do not have permission to view this');
    }

    const request = await this.dbContext.userToForum.findUniqueOrThrow({
      where: {
        userId_forumId: {
          userId,
          forumId,
        },
      },
      select: {
        status: true,
        user: selectUser,
      },
    });

    if (!request || request.status === status) {
      throw new BadRequestException('The request is invalid');
    }

    if (status === ResourceStatus.DELETED) {
      await this.dbContext.$transaction(async (trx) => {
        await Promise.all([
          trx.userToForum.delete({
            where: {
              userId_forumId: {
                userId,
                forumId,
              },
            },
          }),
          forum.conversation
            ? trx.userToConversation.delete({
                where: {
                  conversationId_userId: {
                    conversationId: forum.conversation.id,
                    userId,
                  },
                },
              })
            : undefined,
        ]);
      });

      return;
    }

    const forumActiveUsers = forum.users.filter(
      (user) => user.status === ResourceStatus.ACTIVE,
    );

    await this.dbContext.userToForum.update({
      where: {
        userId_forumId: {
          userId,
          forumId,
        },
      },
      data: {
        status,
        forum: {
          update: {
            conversation: {
              create: {
                displayName: forum.name,
                avatarUrl: forum.avatarUrl,
                users: {
                  createMany: {
                    data: forumActiveUsers.map(({ userId }) => ({
                      userId,
                    })),
                  },
                },
              },
            },
          },
        },
      },
    });

    await this.notificationService.notifyNotification(
      forum.moderator,
      userId,
      MessageEvent.REQUEST_FORUM_APPROVED,
      {
        content: `${user.fullName} đã chấp nhận yêu cầu vào forum của bạn`,
        modelId: forumId,
        modelName: 'forum',
        receiverId: forum.modId,
      },
    );

    this.logger.log('Patch forum request successfully', { request });
  }

  getForumsOfUser(userId: string): Promise<ForumResponse[]> {
    return this.dbContext.forum.findMany({
      where: {
        users: { some: { userId, status: ResourceStatus.ACTIVE } },
        status: ResourceStatus.ACTIVE,
      },
      select: {
        id: true,
        avatarUrl: true,
        type: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        moderator: {
          select: {
            id: true,
            fullName: true,
            gender: true,
            dateOfBirth: true,
            avatarUrl: true,
            faculty: {
              select: {
                id: true,
                name: true,
              },
            },
            type: true,
          },
        },
        topics: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        type: 'desc',
      },
    });
  }

  async exitForum(forumId: string, user: RequestUser) {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: {
        id: forumId,
      },
      select: {
        users: true,
        status: true,
      },
    });

    const isInForum = forum.users.some(
      ({ userId, status }) =>
        userId === user.id && status === ResourceStatus.ACTIVE,
    );

    if (!isInForum) {
      throw new BadRequestException('You are not in this forum');
    }

    await this.dbContext.userToForum.delete({
      where: {
        userId_forumId: {
          userId: user.id,
          forumId,
        },
      },
    });

    this.logger.log(`${user.id} left forum ${forumId}`);
  }
}
