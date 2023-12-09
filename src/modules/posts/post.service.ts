import { RequestUser } from '@common/types';
import { UserRole } from '@common/types/enum';
import { GetCommentDto } from '@modules/comments/dto';
import { CreateCommentDto } from '@modules/comments/dto/create-comment.dto';
import { CommentResponse } from '@modules/comments/interfaces';
import { NotificationService } from '@modules/notification/notification.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GroupUserType, Like, Prisma, ResourceStatus } from '@prisma/client';
import { isEmpty } from 'class-validator';
import { differenceBy, first } from 'lodash';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { MessageEvent } from 'src/gateway/enum';
import { PaginatedResult, Pagination } from 'src/providers';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponse } from './interfaces/post-response.interface';
import { selectUser } from '@modules/user/utils';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    private dbContext: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async getAllPosts(
    query: GetAllPostsDto,
    user: RequestUser,
  ): Promise<PaginatedResult<PostResponse>> {
    const { search, skip, take, order, status } = query;
    const whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [
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

    let orderBy: Prisma.PostOrderByWithRelationInput = getOrderBy({
      defaultValue: 'createdAt',
      order,
    });

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
          likes: {
            include: {
              user: selectUser,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
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

    const postResponse = posts.map((post) => {
      return {
        ...post,
        likedAt: post.likes.filter((like) => like.userId === user.id)[0]
          ?.createdAt,
      };
    });

    return Pagination.of({ take, skip }, total, postResponse);
  }

  async getPostsOfUser(id: string, query: GetAllPostsDto) {
    const { search, skip, take, order, status } = query;
    const whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [
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

    let orderBy: Prisma.PostOrderByWithRelationInput = getOrderBy({
      defaultValue: 'updatedAt',
      order,
    });

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
          createdAt: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          likes: {
            include: {
              user: selectUser,
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

    const postResponse = posts.map((post) => {
      return {
        ...post,
        likedAt: post.likes.filter((like) => like.userId === id)[0]?.createdAt,
      };
    });

    return Pagination.of({ take, skip }, total, postResponse);
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

  async patchPostStatus(
    id: string,
    { id: userId, fullName }: RequestUser,
    status: ResourceStatus,
  ) {
    const post = await this.dbContext.post.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        userId: true,
        forum: {
          select: {
            modId: true,
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
        },
        documents: true,
      },
    });

    const isAbleUpdate = userId === post.forum.modId;

    if (!isAbleUpdate) {
      throw new BadRequestException('You do not have permission');
    }

    const postUpdated = await this.dbContext.post.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    if (postUpdated.status === ResourceStatus.ACTIVE) {
      await this.notificationService.notifyNotification(
        post.forum.moderator,
        post.userId,
        MessageEvent.REQUEST_POST_APPROVED,
        {
          content: `đã phê duyệt bài đăng của bạn`,
          modelId: post.id,
          modelName: 'post',
          receiverId: post.userId,
        },
      );
    }
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
        status: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return {
      ...post,
      likedAt: post.likes.length ? first(post.likes).createdAt : null,
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
      include: {
        user: true,
        forum: true,
      },
    });

    if (post.status === ResourceStatus.PENDING) {
      await this.notificationService.notifyNotification(
        post.user,
        post.forum.modId,
        MessageEvent.REQUEST_POST_CREATED,
        {
          content: `đã đăng bài viết vào forum`,
          modelId: post.id,
          modelName: 'post',
          receiverId: post.forum.modId,
        },
      );
    }

    this.logger.log('Created a post record', { post });
  }

  async createComment(
    id: string,
    user: RequestUser,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    const comment = await this.dbContext.comment.create({
      data: {
        postId: id,
        userId: user.id,
        content: dto.content,
      },
      include: {
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
        post: true,
      },
    });

    const postOwnerId = comment.post.userId;
    const commentOwnerId = user.id;

    if (postOwnerId !== commentOwnerId) {
      await this.notificationService.notifyNotification(
        comment.user,
        comment.post.userId,
        MessageEvent.COMMENT_CREATED,
        {
          content: `đã đăng một bình luận vào bài viết của bạn`,
          modelId: comment.postId,
          modelName: 'post',
          receiverId: comment.post.userId,
        },
      );
    }

    return comment;
  }

  async getComments(postId: string, dto: GetCommentDto) {
    const [comments, totalRecords] = await Promise.all([
      this.dbContext.comment.findMany({
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
          _count: {
            select: {
              replyComments: true,
            },
          },
        },
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      }),
      this.dbContext.comment.count({ where: { postId } }),
    ]);

    return {
      totalRecords,
      data: comments,
    };
  }

  async likePost(postId: string, user: RequestUser): Promise<Like> {
    const haveAlreadyLiked = await this.dbContext.like.findUnique({
      where: {
        userId_postId: {
          postId,
          userId: user.id,
        },
      },
    });
    if (haveAlreadyLiked) {
      throw new BadRequestException('This user have already liked this post');
    }

    const like = await this.dbContext.like.create({
      data: {
        postId,
        userId: user.id,
      },
      include: {
        user: true,
        post: true,
      },
    });

    const postOwnerId = like.post.userId;
    const likeOwnerId = user.id;

    if (postOwnerId !== likeOwnerId) {
      await this.notificationService.notifyNotification(
        like.user,
        postOwnerId,
        MessageEvent.LIKE_CREATED,
        {
          content: `đã thích một bài viết của bạn`,
          modelId: like.postId,
          modelName: 'post',
          receiverId: postOwnerId,
        },
      );
    }

    return like;
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const like = await this.dbContext.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    if (!like) {
      throw new BadRequestException('You have not liked this post');
    }
    await this.dbContext.like.delete({
      where: { userId_postId: { postId, userId } },
    });
  }
}
