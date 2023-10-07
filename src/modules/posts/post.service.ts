import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PaginatedResult, Pagination } from 'src/providers';
import { GroupUserType, Prisma, ResourceStatus } from '@prisma/client';
import { searchByMode, getOrderBy } from 'src/common/utils/prisma';
import { PostResponse } from './interfaces/post-response.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { RequestUser } from '@common/types';
import { isEmpty } from 'class-validator';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(private dbContext: PrismaService) {}

  async getAllPosts(
    query: GetAllPostsDto,
  ): Promise<PaginatedResult<PostResponse>> {
    const { search, skip, take, order } = query;
    let whereConditions: Prisma.PostWhereInput = {};
    if (search) {
      whereConditions = {
        OR: [
          {
            title: searchByMode(search),
          },
          {
            content: searchByMode(search),
          },
        ],
      };
    }

    let orderBy: Prisma.ForumOrderByWithRelationInput = {};

    if (order) {
      orderBy = getOrderBy({ defaultValue: 'createdAt', order });
    }

    const [total, posts] = await Promise.all([
      this.dbContext.post.count({
        where: whereConditions,
      }),
      this.dbContext.post.findMany({
        where: whereConditions,
        skip,
        orderBy,
        take,
        select: {
          id: true,
          forum: {
            select: {
              name: true,
            },
          },
          title: true,
          content: true,
          user: {
            select: {
              avatarUrl: true,
              fullName: true,
            },
          },
          status: true,
        },
      }),
    ]);

    return Pagination.of({ take, skip }, total, posts);
  }

  async createPost(body: CreatePostDto, { id }: RequestUser) {
    const { forumId, content, title } = body;
    const forum = await this.dbContext.forum.findUnique({
      where: { id: forumId },
      select: {
        id: true,
        users: {
          select: {
            userId: true,
            userType: true,
          },
        },
      },
    });

    if (isEmpty(forum)) {
      throw new BadRequestException('The forum does not exist');
    }

    const forumUser = forum.users.find((user) => user.userId === id);
    if (isEmpty(forumUser)) {
      throw new BadRequestException('The user is not in the forum');
    }

    const post = await this.dbContext.post.create({
      data: {
        content,
        title,
        forumId,
        userId: id,
        status:
          forumUser.userType === GroupUserType.MODERATOR
            ? ResourceStatus.ACTIVE
            : ResourceStatus.PENDING,
      },
    });

    this.logger.log('Created a post record', { post });
  }
}
