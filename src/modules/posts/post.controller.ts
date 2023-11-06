import { ReqUser } from '@common/decorator/request-user.decorator';
import { RequestUser, UUIDParam } from '@common/types';
import { GetCommentDto } from '@modules/comments/dto';
import { CreateCommentDto } from '@modules/comments/dto/create-comment.dto';
import { CommentResponse } from '@modules/comments/interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Like } from '@prisma/client';
import { AccessTokenGuard } from 'src/guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PatchPostRequestDto } from './dto/patch-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'posts',
})
@ApiTags('Post')
@UseGuards(AccessTokenGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(
    @Query() query: GetAllPostsDto,
    @ReqUser() user: RequestUser,
  ) {
    return this.postService.getAllPosts(query, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPosts(@Body() body: CreatePostDto, @ReqUser() user: RequestUser) {
    return this.postService.createPost(body, user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param() { id }: UUIDParam) {
    return this.postService.getPostById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() { id }: UUIDParam, @ReqUser() user: RequestUser) {
    return this.postService.deletePost(id, user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
    @Body() body: UpdatePostDto,
  ) {
    return this.postService.updatePost(id, user, body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async patchPostStatus(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
    @Body() body: PatchPostRequestDto,
  ) {
    return this.postService.patchPostStatus(id, user, body.status);
  }

  @ApiProperty({
    description: 'Create a comment in a post',
  })
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Param() { id }: UUIDParam,
    @Body() dto: CreateCommentDto,
    @ReqUser() user: RequestUser,
  ): Promise<CommentResponse> {
    return this.postService.createComment(id, user, dto);
  }

  @ApiProperty({
    description: 'Get comments in a post',
  })
  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  getComments(
    @Param() { id }: UUIDParam,
    @Query() dto: GetCommentDto,
  ): Promise<CommentResponse[]> {
    return this.postService.getComments(id, dto);
  }

  @ApiProperty({
    description: 'Like a post',
  })
  @Post(':id/likes')
  @HttpCode(HttpStatus.CREATED)
  likePost(@Param() { id }: UUIDParam, @ReqUser() user: RequestUser): Promise<Like> {
    console.log(user);
    return this.postService.likePost(id, user);
  }

  @ApiProperty({
    description: 'Unlike a post',
  })
  @Delete(':id/likes')
  @HttpCode(HttpStatus.CREATED)
  unlikePost(
    @Param() { id }: UUIDParam,
    @ReqUser('id') userId: string,
  ): Promise<void> {
    return this.postService.unlikePost(id, userId);
  }
}
