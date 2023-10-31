import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';

import { ReqUser } from '@common/decorator/request-user.decorator';
import { RequestUser, UUIDParam } from '@common/types';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { PatchFriendRequestDto } from './dto/patch-friend-request.dto';

@ApiTags('Friend')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOperation({
    description: 'Create a friend request',
  })
  @Post()
  create(@Body() { id }: CreateFriendDto, @ReqUser() user: RequestUser) {
    return this.friendsService.sendFriendRequests(user, id);
  }

  @ApiOperation({
    description: 'Get all friend request of a user',
  })
  @Get()
  getFriendRequests(@ReqUser() user: RequestUser) {
    return this.friendsService.getAllFriendsRequest(user);
  }

  @ApiOperation({
    description: 'Update friend request status',
  })
  @Patch(':id')
  update(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
    @Body() { status }: PatchFriendRequestDto,
  ) {
    return this.friendsService.patchFriendsRequest(id, user, status);
  }

  @ApiOperation({
    description: 'Get all friends of user',
  })
  @Get('me')
  getUserFriendList(@ReqUser() user: RequestUser) {
    return this.friendsService.getFriendList(user);
  }
}
