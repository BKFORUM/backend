import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  OmitType,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { ReqUser } from '@common/decorator/request-user.decorator';
import { MAX_FILE_SIZE, RequestUser, UUIDParam, UserRole } from '@common/types';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from '@common/decorator';
import { PostService } from '@modules/posts';
import { GetAllPostsDto } from '@modules/posts/dto/get-all-posts.dto';
import { GetAllForumsDto } from '@modules/forums/dto';
import { ForumService } from '@modules/forums';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Readable } from 'stream';

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
  async getAllUsers(
    @Query() query: GetUsersQueryDto,
    @ReqUser() user: RequestUser,
  ) {
    return this.userService.getAllUsers(query, user);
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
    @ReqUser() user: RequestUser,
  ) {
    return this.postService.getPostsOfUser(id, query, user);
  }

  @ApiOperation({
    description: 'Get forums of user by userId',
  })
  @Get(':id/forums')
  @HttpCode(HttpStatus.OK)
  async getForumsOfUser(@Param() { id }: UUIDParam) {
    return this.forumService.getForumsOfUser(id);
  }

  @ApiOperation({
    description: 'Reset password of a user',
  })
  @Roles(UserRole.ADMIN)
  @Put(':id/reset-password')
  async resetPassword(@Param() { id }: UUIDParam) {
    return this.userService.resetPassword(id);
  }

  @Post('import')
  @ApiOperation({
    description: 'Import CSV contacts file ',
  })
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
        if (
          file.mimetype !==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          callback(
            new UnsupportedMediaTypeException(
              `Invalid file type. Please upload a CSV file.`,
            ),
            false,
          );
        }

        callback(null, true);
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    }),
  )
  async importUsers(@UploadedFile() file: Express.Multer.File): Promise<void> {
    return this.userService.importUsers(file);
  }
}
