import { RequestUser } from '@common/types';
import { UserRole } from '@common/types/enum';
import { GetCommentDto } from '@modules/comments/dto';
import { CreateCommentDto } from '@modules/comments/dto/create-comment.dto';
import { CommentResponse } from '@modules/comments/interfaces';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GroupUserType, Prisma, ResourceStatus } from '@prisma/client';
import { isEmpty } from 'class-validator';
import { differenceBy } from 'lodash';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponse } from './interfaces/post-response.interface';

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
            some: {
              userId: user.id,
              status: ResourceStatus.ACTIVE,
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
              id: true,
              name: true,
              modId: true,
              avatarUrl: true,
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
              id: true,
              avatarUrl: true,
              modId: true,
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

  async updatePost(
    id: string,
    { id: userId }: RequestUser,
    body: UpdatePostDto,
  ) {
    const { content, documents } = body;
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
        documents: true,
      },
    });

    const isAleUpdate = userId === post.userId;

    if (!isAleUpdate) {
      throw new BadRequestException('You cannot delete this post');
    }

    const newDocuments = differenceBy(documents, post.documents, 'fileUrl');
    const oldDocuments = differenceBy(post.documents, documents, 'fileUrl');

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
            userId,
          })),
        }
      : undefined;
    await this.dbContext.post.update({
      where: {
        id,
      },
      data: {
        content,
        documents: {
          deleteMany: deleteDocuments,
          createMany: createDocuments,
        },
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
        forum: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            modId: true,
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
              fileUrl: document.fileUrl,
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

  createComment(
    id: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    return this.dbContext.comment.create({
      data: {
        postId: id,
        userId,
        content: dto.content,
      },
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
    });
  }

  getComments(postId: string, dto: GetCommentDto): Promise<CommentResponse[]> {
    return this.dbContext.comment.findMany({
      where: {
        postId,
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
        createdAt: Prisma.SortOrder.asc,
      },
    });
  }
}
