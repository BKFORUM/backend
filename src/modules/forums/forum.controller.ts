import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator';
import { UserRole } from 'src/common/types/enum';
import { PaginatedResult } from 'src/providers';
import { GetAllForumsDto } from './dto';
import { ForumService } from './forum.service';
import { ForumResponse } from './interfaces';
import { AccessTokenGuard } from 'src/guard';
import { ForumQueryParam } from './dto/forum.param';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import { query } from 'express';
import { ReqUser } from '@common/decorator/request-user.dto';
import { RequestUser } from '@common/types';

@ApiBearerAuth()
@ApiTags('Forum')
@Controller({
  version: '1',
  path: 'forums',
})
@UseGuards(AccessTokenGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @ApiOperation({
    description: 'Get all forums only by ADMIN',
  })
  @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllForums(
    @Query() query: GetAllForumsDto,
    @ReqUser() user: RequestUser,
  ): Promise<PaginatedResult<ForumResponse>> {
    return await this.forumService.getAllForums(query, user);
  }

  @ApiOperation({
    description: 'Get all posts of a forum',
  })
  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsOfForum(
    @Param() { id }: ForumQueryParam,
    @Query() query: GetAllPostsDto,
  ) {
    return await this.forumService.getPostsOfForum(id, query);
  }
}
