import { ReqUser } from '@common/decorator/request-user.decorator';
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
  Patch,
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
import { Roles } from '@common/decorator';
import { UserRole } from '@common/types/enum';
import { AccessTokenGuard } from 'src/guard';
import { PaginatedResult } from 'src/providers';
import {
  AddUsersToForumDto,
  CreateForumDto,
  GetAllForumsDto,
  GetForumResponse,
  UpdateForumDto,
} from './dto';
import { ForumService } from './forum.service';
import { ForumResponse } from './interfaces';
import { ForumRequestDto } from './dto/forum-request.dto';

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
    description: 'Get all forums',
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  updateForum(
    @Param() { id }: UUIDParam,
    @Body() dto: UpdateForumDto,
    @ReqUser() user: RequestUser,
  ): Promise<void> {
    return this.forumService.updateForum(id, dto, user);
  }

  @ApiOperation({
    description: 'Get Forum by id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getForumById(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
  ): Promise<GetForumResponse> {
    return this.forumService.getForumById(id, user);
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
    description: 'Add users to forum',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/users')
  addUsersToForum(
    @Body() dto: AddUsersToForumDto,
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
  ): Promise<void> {
    return this.forumService.addUsersToForum(id, dto, user);
  }

  @ApiOperation({
    description: 'Get all posts of a forum',
  })
  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsOfForum(
    @Param() { id }: UUIDParam,
    @Query() query: GetAllPostsDto,
    @ReqUser('id') userId: string,
  ) {
    return await this.forumService.getPostsOfForum(id, query, userId);
  }

  @ApiOperation({
    description: 'Create a request to join a forum',
  })
  @Post(':id/requests')
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
  ) {
    return this.forumService.createForumRequest(id, user);
  }

  @ApiOperation({
    description: 'Get all pending requests of a forum',
  })
  @Get(':id/requests')
  @HttpCode(HttpStatus.OK)
  async getRequests(@Param() { id }: UUIDParam, @ReqUser() user: RequestUser) {
    return this.forumService.getForumRequests(id, user);
  }

  @ApiOperation({
    description: 'Update requests status of a forum',
  })
  @Patch(':id/requests')
  @HttpCode(HttpStatus.NO_CONTENT)
  async patchRequest(
    @Param() { id }: UUIDParam,
    @Body() request: ForumRequestDto,
    @ReqUser() user: RequestUser,
  ) {
    return this.forumService.patchForumRequests(id, request, user);
  }

  @ApiOperation({
    description: 'Exit a forum',
  })
  @Patch(':id/exit')
  @HttpCode(HttpStatus.NO_CONTENT)
  async exitForum(
    @Param() { id }: UUIDParam,

    @ReqUser() user: RequestUser,
  ) {
    return this.forumService.exitForum(id, user);
  }
}
