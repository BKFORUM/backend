import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { query } from 'express';
import { AccessTokenGuard } from 'src/guard';
import { GetUsersQueryDto } from './dto';
import { UserService } from './user.service';
@ApiTags('User')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    description: 'Get all users',
  })
  @Get()
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }
}
