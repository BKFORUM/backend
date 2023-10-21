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
  constructor(
    private dbContext: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAllPosts(
    query: GetAllPostsDto,
    user: RequestUser,
  ): Promise<PaginatedResult<PostResponse>> {
    const { search, skip, take, order } = query;
    let whereConditions: Prisma.Enumerable<Prisma.PostWhereInput> = [];
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
        title: true,
        content: true,
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

  async createPost(
    body: CreatePostDto,
    { id }: RequestUser,
    documents: Express.Multer.File[],
  ) {
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

    const uploadedDocuments =
      documents && (await this.cloudinaryService.uploadImages(documents));

    console.log(uploadedDocuments);

    const documentsCreate: Prisma.PostDocumentCreateWithoutPostInput[] =
      uploadedDocuments.length > 0
        ? uploadedDocuments.map((document) => {
            return {
              fileName: `${document.original_filename}_${uuid()}`,
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
        title,
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
