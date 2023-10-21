import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { CreatePostDto } from './dto/create-post.dto';
import { ReqUser } from '@common/decorator/request-user.dto';
import { RequestUser, UUIDParam } from '@common/types';
import { FilesInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FilesInterceptor('documents', 5))
  async createPosts(
    @Body() body: CreatePostDto,
    @ReqUser() user: RequestUser,
    @UploadedFiles() documents: Express.Multer.File[],
  ) {
    console.log(documents);
    return this.postService.createPost(body, user, documents);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param() { id }: UUIDParam) {
    return this.postService.getPostById(id);
  }
}
