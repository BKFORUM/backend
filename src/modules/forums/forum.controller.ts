import { ReqUser } from '@common/decorator/request-user.dto';
import { RequestUser } from '@common/types';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator';
import { UserRole } from 'src/common/types/enum';
import { AccessTokenGuard } from 'src/guard';
import { PaginatedResult } from 'src/providers';
import { GetAllForumsDto, ImportUsersToForumDto } from './dto';
import { ForumQueryParam } from './dto/forum.param';
import { ForumService } from './forum.service';
import { ForumResponse } from './interfaces';

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
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllForums(
    @Query() query: GetAllForumsDto,
    @ReqUser() user: RequestUser,
  ): Promise<PaginatedResult<ForumResponse>> {
    return await this.forumService.getAllForums(query, user);
  }

  @ApiOperation({
    description: 'Import users to forum',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/users')
  importUsersToForum(
    @Body() dto: ImportUsersToForumDto,
    @Param('id') forumId: string,
  ): Promise<void> {
    return this.forumService.importUsersToForum(forumId, dto);
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
