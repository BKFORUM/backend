import { ReqUser } from "@common/decorator/request-user.decorator";
import { UUIDParam } from "@common/types";
import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "src/guard";
import { CommentService } from "./comment.service";
import { UpdateCommentDto } from "./dto";

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
  updateComment(@Param() { id }: UUIDParam, @ReqUser('id') userId: string, @Body() dto: UpdateCommentDto) {
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
  deleteForum(@Param() { id }: UUIDParam, @ReqUser('id') userId: string): Promise<void> {
    return this.commentService.deleteComment(id, userId);
  }
}