import { ReqUser } from '@common/decorator/request-user.decorator';
import { RequestUser, UUIDParam } from '@common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ReplyComment } from '@prisma/client';
import { AccessTokenGuard } from 'src/guard';
import { CommentService } from './comment.service';
import { CreateCommentDto, GetCommentDto, ReplyCommentParam, UpdateCommentDto } from './dto';

@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'comments',
})
@ApiTags('Comment')
@UseGuards(AccessTokenGuard)
export class CommentController {
  constructor(private commentService: CommentService) {}

  @ApiOperation({
    description: 'Update a comment',
  })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateComment(
    @Param() { id }: UUIDParam,
    @ReqUser('id') userId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, userId, dto);
  }

  @ApiOperation({
    description: 'Delete a comment',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteForum(
    @Param() { id }: UUIDParam,
    @ReqUser('id') userId: string,
  ): Promise<void> {
    return this.commentService.deleteComment(id, userId);
  }

  @ApiOperation({
    description: 'Get reply comments',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id/replies')
  getReplyComments(
    @Param() { id }: UUIDParam,
    @Query() dto: GetCommentDto,
    @ReqUser() user: RequestUser,
  ): Promise<ReplyComment[]> {
    return this.commentService.getReplyComments(id, dto, user);
  }

  @ApiOperation({
    description: 'Reply a comment',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/replies')
  replyComment(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
    @Body() dto: CreateCommentDto,
  ): Promise<ReplyComment> {
    return this.commentService.replyComment(id, user, dto);
  }

  @ApiOperation({
    description: 'Delete a reply comment',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/replies/:replyId')
  deleteReplyComment(
    @Param() { id, replyId }: ReplyCommentParam,
    @ReqUser('id') userId: string,
  ): Promise<void> {
    return this.commentService.deleteReplyComment(id, replyId, userId);
  }

  @ApiOperation({
    description: 'Update a reply comment',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/replies/:replyId')
  updateReplyComment(
    @Param() { id, replyId }: ReplyCommentParam,
    @ReqUser('id') userId: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<void> {
    return this.commentService.updateReplyComment(id, replyId, userId, dto);
  }
}
