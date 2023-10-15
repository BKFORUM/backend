import { ReqUser } from '@common/decorator/request-user.dto';
import { RequestUser, UUIDParam } from '@common/types';
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
import { AddUsersToForumDto, GetAllForumsDto } from './dto';
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
  addUsersToForum(
    @Body() dto: AddUsersToForumDto,
    @Param() { id }: UUIDParam,
  ): Promise<void> {
    return this.forumService.addUsersToForum(id, dto);
  }

  @ApiOperation({
    description: 'Get all posts of a forum',
  })
  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsOfForum(
    @Param() { id }: UUIDParam,
    @Query() query: GetAllPostsDto,
  ) {
    return await this.forumService.getPostsOfForum(id, query);
  }
}
