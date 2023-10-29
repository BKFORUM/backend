import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { ReqUser } from '@common/decorator/request-user.dto';
import { RequestUser, UUIDParam, UserRole } from '@common/types';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from '@common/decorator';
import { PostService } from '@modules/posts';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import { GetAllForumsDto } from '@modules/forums/dto';
import { ForumService } from '@modules/forums';
@ApiTags('User')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly forumService: ForumService,
  ) {}

  @ApiOperation({
    description: 'Get all users',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @ApiOperation({
    description: 'get current user',
  })
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@ReqUser() user: RequestUser) {
    return this.userService.findById(user.id);
  }

  @ApiOperation({
    description: 'get user by Id',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param() { id }: UUIDParam) {
    return this.userService.findById(id);
  }

  @ApiOperation({
    description: 'Create a user',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }

  @ApiOperation({
    description: 'Update a user',
  })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  async update(@Param() { id }: UUIDParam, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(id, user);
  }

  @ApiOperation({
    description: 'get posts of user by userId',
  })
  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostOfUser(
    @Param() { id }: UUIDParam,
    @Query() query: GetAllPostsDto,
  ) {
    return this.postService.getPostsOfUser(id, query);
  }

  @ApiOperation({
    description: 'Get forums of user by userId',
  })
  @Get(':id/forums')
  @HttpCode(HttpStatus.OK)
  async getForumsOfUser (
    @Param() { id }: UUIDParam,
    // @Query() query: GetAllForumsDto,
  ) {
    return this.forumService.getForumsOfUser(id);
  }
}
