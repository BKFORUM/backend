import { RequestUser } from '@common/types';
import { NotificationService } from '@modules/notification';
import { Injectable } from '@nestjs/common';
import { Prisma, ReplyComment } from '@prisma/client';
import { PrismaService } from 'src/database/services';
import { MessageEvent } from 'src/gateway/enum';
import { CreateCommentDto, GetCommentDto } from './dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private dbContext: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async updateComment(id: string, userId: string, dto: UpdateCommentDto) {
    await this.dbContext.comment.update({ where: { id, userId }, data: dto });
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    await this.dbContext.comment.delete({ where: { id, userId } });
  }

  async getReplyComments(
    commentId: string,
    dto: GetCommentDto,
    user: RequestUser,
  ): Promise<ReplyComment[]> {
    const comment = await this.dbContext.comment.findUniqueOrThrow({
      where: { id: commentId },
      include: { post: true },
    });
    // const isInForum = await this.dbContext.user.findUnique({
    //   where: {
    //     id: user.id,
    //     forums: {
    //       some: {
    //         id: comment.post.forumId,
    //       },
    //     },
    //   },
    //   include: { forums: true },
    // });

    // if (!isInForum) {
    //   throw new BadRequestException('The user is not in the forum');
    // }

    const replyComments = await this.dbContext.replyComment.findMany({
      where: { commentId },
      skip: dto.skip,
      take: dto.take,
      orderBy: {
        createdAt: Prisma.SortOrder.asc,
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

    return replyComments;
  }

  async replyComment(
    commentId: string,
    reqUser: RequestUser,
    dto: CreateCommentDto,
  ): Promise<ReplyComment> {
    const comment = await this.dbContext.comment.findUniqueOrThrow({
      where: { id: commentId },
      include: { post: true },
    });

    // const isInForum = await this.dbContext.user.findUnique({
    //   where: {
    //     id: reqUser.id,
    //     forums: {
    //       some: {
    //         id: comment.post.forumId,
    //       },
    //     },
    //   },
    //   include: { forums: true },
    // });

    // if (!isInForum) {
    //   throw new BadRequestException('The user is not in the forum');
    // }

    const replyComment = await this.dbContext.replyComment.create({
      data: {
        content: dto.content,
        commentId,
        userId: reqUser.id,
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
      },
    });

    if (replyComment.userId !== comment.userId) {
      await this.notificationService.notifyNotification(
        replyComment.user,
        comment.userId,
        MessageEvent.REPLY_COMMENT_CREATED,
        {
          content: 'đã trả lời bình luận của bạn',
          modelId: comment.postId,
          modelName: 'post',
          receiverId: comment.userId,
        },
      );
    }

    return replyComment;
  }

  async deleteReplyComment(
    commentId: string,
    replyId: string,
    userId: string,
  ): Promise<void> {
    await this.dbContext.replyComment.delete({
      where: { id: replyId, commentId, userId },
    });
  }

  async updateReplyComment(
    commentId: string,
    replyId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<void> {
    await this.dbContext.replyComment.update({
      where: { id: replyId, commentId, userId },
      data: {
        content: dto.content,
      },
    });
  }
}
