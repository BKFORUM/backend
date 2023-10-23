import { RequestUser, UserRole } from '@common/types';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Forum,
  ForumType,
  GroupUserType,
  Prisma,
  ResourceStatus,
  UserToForum,
  UserType,
} from '@prisma/client';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { AddUsersToForumDto, CreateForumDto, GetAllForumsDto } from './dto';
import { ForumResponse } from './interfaces';
import { UserService } from '@modules/user';
import { TopicService } from '@modules/topic';

@Injectable()
export class ForumService {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly userService: UserService,
    private readonly topicService: TopicService,
  ) {}

  async getAllForums(
    { skip, take, order, search, isPending }: GetAllForumsDto,
    user: RequestUser,
  ): Promise<PaginatedResult<ForumResponse>> {
    console.log(isPending);
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
          data: userIds.map((userId) => ({
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
}
