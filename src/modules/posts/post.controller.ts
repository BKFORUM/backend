import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { CreatePostDto } from './dto/create-post.dto';
import { ReqUser } from '@common/decorator/request-user.dto';
import { RequestUser } from '@common/types';

@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'posts',
})
@UseGuards(AccessTokenGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(@Query() query: GetAllPostsDto) {
    return this.postService.getAllPosts(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPosts(@Body() body: CreatePostDto, @ReqUser() user: RequestUser) {
    return this.postService.createPost(body, user);
  }
}
