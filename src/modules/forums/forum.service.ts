import { RequestUser, UserRole } from '@common/types';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import { TopicService } from '@modules/topic';
import { UserService } from '@modules/user';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef
} from '@nestjs/common';
import {
  Forum,
  ForumType,
  GroupUserType,
  Prisma,
  ResourceStatus,
  UserToForum,
} from '@prisma/client';
import { difference } from 'lodash';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import {
  AddUsersToForumDto,
  CreateForumDto,
  GetAllForumsDto,
  UpdateForumDto,
} from './dto';
import { ForumResponse } from './interfaces';

@Injectable()
export class ForumService {
  constructor(
    private readonly dbContext: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly topicService: TopicService,
  ) {}

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

    let orderBy: Prisma.ForumOrderByWithRelationInput = {};

    const mappedOrderType = {
      moderator: 'moderator.fullName',
      totalUsers: 'users._count',
    };

    if (order) {
      orderBy = getOrderBy<Forum>({
        defaultValue: 'createdAt',
        order,
        mappedOrder: mappedOrderType,
      });
    }

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
      }),
    ]);

    return Pagination.of(
      { take, skip },
      total,
      forums.map((forum) => {
        return {
          ...forum,
          topics: forum.topics.map(({ topic }) => topic),
        };
      }),
    );
  }

  async createForum(body: CreateForumDto, user: RequestUser) {
    const { moderatorId, name, type, topicIds, userIds } = body;
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
        users: {
          create: {
            userType: GroupUserType.MODERATOR,
            userId: moderatorId,
          },
          createMany: userCreateMany,
        },
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

  selectUser = {
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
  };

  async getForumById(id: string) {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: { id },
      select: {
        name: true,
        moderator: this.selectUser,
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
          select: {
            id: true,
            user: this.selectUser,
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
          select: {
            user: this.selectUser,
          },
        },
      },
    });

    return forum;
  }

  async updateForum(forumId: string, dto: UpdateForumDto): Promise<void> {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: { id: forumId },
      include: {
        topics: true,
      },
    });
    const topicForumIds = forum.topics.map((topic) => topic.topicId);

    await Promise.all([
      this.updateTopics(forumId, topicForumIds, dto.topicIds),
      this.updateName(forumId, dto.name),
      this.updateType(forumId, dto.type),
      this.updateStatus(forumId, dto.status),
    ]);
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
  ): Promise<void> {
    const forum = await this.dbContext.forum.findUniqueOrThrow({
      where: { id: forumId },
    });

    if (forum.status === ResourceStatus.PENDING) {
      throw new BadRequestException(
        'This forum is pending and needs to be approved to add users',
      );
    }

    await this.userService.validateUserIds(dto.userIds);

    const userToForum = await this.dbContext.userToForum.findFirst({
      where: {
        forumId,
        AND: {
          userId: {
            in: dto.userIds,
          },
        },
      },
    });

    if (userToForum) {
      throw new BadRequestException(
        `The user with id:${userToForum.userId} belongs to another forum`,
      );
    }

    const data: UserToForum[] = dto.userIds.map((userId) => {
      return {
        forumId: forumId,
        userId,
        userType: GroupUserType.MEMBER,
      };
    });

    await this.dbContext.userToForum.createMany({
      data,
    });
  }

  async getPostsOfForum(
    id: string,
    { skip, take, order, search }: GetAllPostsDto,
  ) {
    const whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [
      {
        forumId: id,
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
        },
      }),
    ]);

    return Pagination.of({ take, skip }, total, posts);
  }

  getForumsOfUser(userId: string): Promise<ForumResponse[]> {
    return this.dbContext.forum.findMany({ where: { users: { every: { userId } } }, select: {
      id: true,
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
    }, orderBy: {
      type: 'desc'
    } });
  }
}
