import { Injectable } from '@nestjs/common';
import { Forum, Prisma, ResourceStatus } from '@prisma/client';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { GetAllForumsDto } from './dto';
import { ForumResponse } from './interfaces';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import { RequestUser } from '@common/types';

@Injectable()
export class ForumService {
  constructor(private readonly dbContext: PrismaService) {}

  async getAllForums(
    { skip, take, order, search, isPending }: GetAllForumsDto,
    user: RequestUser,
  ): Promise<PaginatedResult<ForumResponse>> {
    let whereConditions: Prisma.Enumerable<Prisma.ForumWhereInput> = [
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

  async getPostsOfForum(
    id: string,
    { skip, take, order, search }: GetAllPostsDto,
  ) {
    let whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [
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
