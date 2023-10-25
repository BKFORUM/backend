import { ReqUser } from '@common/decorator/request-user.dto';
import { RequestUser, UUIDParam } from '@common/types';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator';
import { UserRole } from 'src/common/types/enum';
import { AccessTokenGuard } from 'src/guard';
import { PaginatedResult } from 'src/providers';
import {
  AddUsersToForumDto,
  CreateForumDto,
  GetAllForumsDto,
  UpdateForumDto,
} from './dto';
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
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllForums(
    @Query() query: GetAllForumsDto,
    @ReqUser() user: RequestUser,
  ): Promise<PaginatedResult<ForumResponse>> {
    return await this.forumService.getAllForums(query, user);
  }

  @ApiOperation({
    description: 'Create a forum',
  })
  @ApiResponse({ status: HttpStatus.CREATED })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createForum(
    @Body() body: CreateForumDto,
    @ReqUser() user: RequestUser,
  ): Promise<void> {
    return await this.forumService.createForum(body, user);
  }

  @ApiOperation({
    description: 'Update a forum',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  updateForum(
    @Param() { id }: UUIDParam,
    @Body() dto: UpdateForumDto,
  ): Promise<void> {
    return this.forumService.updateForum(id, dto);
  }

  @ApiOperation({
    description: 'Delete a forum',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteForum(@Param() { id }: UUIDParam): Promise<void> {
    return this.forumService.deleteForum(id);
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
