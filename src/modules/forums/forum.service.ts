import { RequestUser } from '@common/types';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Forum,
  GroupUserType,
  Prisma,
  ResourceStatus,
  UserToForum,
} from '@prisma/client';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { AddUsersToForumDto, GetAllForumsDto } from './dto';
import { ForumResponse } from './interfaces';

@Injectable()
export class ForumService {
  constructor(private readonly dbContext: PrismaService) {}

  async getAllForums(
    { skip, take, order, search, isPending }: GetAllForumsDto,
    user: RequestUser,
  ): Promise<PaginatedResult<ForumResponse>> {
    const whereConditions: Prisma.Enumerable<Prisma.ForumWhereInput> = [
      {
        status: {
          not: ResourceStatus.DELETED,
        },
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

    if (isPending) {
      whereConditions.push({
        status: ResourceStatus.PENDING,
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
          createdAt: true,
          updatedAt: true,
          moderator: {
            select: {
              id: true,
              fullName: true,
            },
          },
          type: true,
          name: true,
          status: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
      }),
    ]);

    return Pagination.of({ take, skip }, total, forums);
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

    const user = await this.dbContext.user.findFirst({
      where: {
        id: {
          in: dto.userIds,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`One of user not found`);
    }

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
        OR: [
          {
            title: searchByMode(search),
          },
          {
            content: searchByMode(search),
          },
        ],
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

          title: true,
          content: true,
          status: true,
        },
      }),
    ]);

    return Pagination.of({ take, skip }, total, posts);
  }
}
