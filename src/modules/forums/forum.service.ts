import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { GetAllForumsDto } from './dto';
import { ForumResponse } from './interfaces';

@Injectable()
export class ForumService {
  constructor(private readonly dbContext: PrismaService) {}

  async getAllForums({
    skip,
    take,
    order,
    search,
  }: GetAllForumsDto): Promise<PaginatedResult<ForumResponse>> {
    let whereConditions: Prisma.ForumWhereInput = {};
    if (search) {
      whereConditions = {
        OR: [
          {
            name: searchByMode(search),
          },
        ],
      };
    }

    let orderBy: Prisma.ForumOrderByWithRelationInput = {};

    if (order) {
      orderBy = getOrderBy('createdAt', order);
    }

    const [total, forums] = await Promise.all([
      this.dbContext.forum.count({
        where: whereConditions,
      }),
      this.dbContext.forum.findMany({
        where: whereConditions,
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
}
