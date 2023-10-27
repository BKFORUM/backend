import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PaginatedResult, Pagination } from 'src/providers';
import { GroupUserType, Prisma, ResourceStatus } from '@prisma/client';
import { searchByMode, getOrderBy } from 'src/common/utils/prisma';
import { PostResponse } from './interfaces/post-response.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { RequestUser } from '@common/types';
import { isEmpty } from 'class-validator';
import { UserRole } from '@common/types/enum';
import { CloudinaryService } from '@modules/cloudinary';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(private dbContext: PrismaService) {}

  async getAllPosts(
    query: GetAllPostsDto,
    user: RequestUser,
  ): Promise<PaginatedResult<PostResponse>> {
    const { search, skip, take, order, status } = query;
    let whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [
      { status },
    ];
    if (!user.roles.includes(UserRole.ADMIN)) {
      whereConditions.push({
        forum: {
          users: {
            every: {
              userId: user.id,
            },
          },
        },
      });
    }

    if (search) {
      whereConditions.push({
        content: searchByMode(search),
      });
    }

    let orderBy: Prisma.PostOrderByWithRelationInput = {};

    if (order) {
      orderBy = getOrderBy({ defaultValue: 'createdAt', order });
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
          forum: {
            select: {
              name: true,
            },
          },
          content: true,
          user: {
            select: {
              id: true,
              avatarUrl: true,
              fullName: true,
            },
          },
          documents: {
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
            },
          },
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return Pagination.of({ take, skip }, total, posts);
  }

  async getPostsOfUser(id: string, query: GetAllPostsDto) {
    const { search, skip, take, order, status } = query;
    let whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [
      {
        userId: id,
        status,
      },
    ];

    if (search) {
      whereConditions.push({
        content: searchByMode(search),
      });
    }

    let orderBy: Prisma.PostOrderByWithRelationInput = {};

    if (order) {
      orderBy = getOrderBy({ defaultValue: 'createdAt', order });
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
          forum: {
            select: {
              name: true,
            },
          },
          content: true,
          user: {
            select: {
              id: true,
              avatarUrl: true,
              fullName: true,
            },
          },
          documents: {
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
            },
          },
          status: true,
        },
      }),
    ]);

    return Pagination.of({ take, skip }, total, posts);
  }

  async deletePost(id: string, { id: userId, roles }: RequestUser) {
    const post = await this.dbContext.post.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        userId: true,
        forum: {
          select: {
            modId: true,
          },
        },
      },
    });

    const isAbleDelete =
      post.forum.modId === userId ||
      roles.includes(UserRole.ADMIN) ||
      userId === post.userId;

    if (!isAbleDelete) {
      throw new BadRequestException('You cannot delete this post');
    }
    await this.dbContext.post.update({
      where: {
        id,
      },
      data: {
        status: ResourceStatus.DELETED,
      },
    });

    this.logger.log('Delete a post record', { post });
  }

  async updatePost(id: string, { id: userId, roles }: RequestUser) {
    const post = await this.dbContext.post.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        userId: true,
        forum: {
          select: {
            modId: true,
          },
        },
      },
    });

    const isAbleDelete =
      post.forum.modId === userId ||
      roles.includes(UserRole.ADMIN) ||
      userId === post.userId;

    if (!isAbleDelete) {
      throw new BadRequestException('You cannot delete this post');
    }
    await this.dbContext.post.update({
      where: {
        id,
      },
      data: {
        status: ResourceStatus.DELETED,
      },
    });

    this.logger.log('Delete a post record', { post });
  }

  async getPostById(id: string) {
    const post = await this.dbContext.post.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
        documents: true,
        comments: true,
        likes: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      ...post,
      documents: post.documents.map((document) => ({
        id: document.id,
        fileName: document.fileName.split('_')[0],
        fileUrl: document.fileUrl,
      })),
    };
  }

  async createPost(body: CreatePostDto, { id }: RequestUser) {
    const { forumId, content, documents } = body;
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

    const documentsCreate: Prisma.PostDocumentCreateWithoutPostInput[] =
      documents && documents.length > 0
        ? documents.map((document) => {
            return {
              fileName: document.fileName,
              fileUrl: document.url,
              user: {
                connect: {
                  id,
                },
              },
            };
          })
        : undefined;

    const post = await this.dbContext.post.create({
      data: {
        content,
        forumId,
        userId: id,
        status:
          forumUser.userType === GroupUserType.MODERATOR
            ? ResourceStatus.ACTIVE
            : ResourceStatus.PENDING,
        documents: {
          create: documentsCreate,
        },
      },
    });

    this.logger.log('Created a post record', { post });
  }
}
