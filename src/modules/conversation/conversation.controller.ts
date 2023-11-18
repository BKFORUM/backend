import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  Put,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { ReqUser } from '@common/decorator/request-user.decorator';
import { RequestUser, UUIDParam } from '@common/types';
import { GetConversationDto } from './dto/get-conversation.dto';
import { CreateMessageDto } from '@modules/message/dto/create-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import {
  ConversationUserRequestBody,
  ConversationUserRequestParam,
} from './dto/conversation-user.dto';
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@ApiTags('Conversation')
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({
    description: 'Create a new group conversation',
  })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createConversationDto: CreateConversationDto,
    @ReqUser() user: RequestUser,
  ) {
    return this.conversationService.create(createConversationDto, user);
  }

  @ApiOperation({
    description: 'Get all conversations of the user',
  })
  @Get()
  getAll(@ReqUser() user: RequestUser, @Query() query: GetConversationDto) {
    return this.conversationService.getAllConversations(user, query);
  }

  @Get(':id')
  findOne(
    @Param() { id }: UUIDParam,
    @Query() query: GetMessageDto,
    @ReqUser() user: RequestUser,
  ) {
    return this.conversationService.getAllMessagesOfConversation(
      id,
      user,
      query,
    );
  }

  @Post(':id/message')
  createMessage(
    @Param() { id }: UUIDParam,
    @Body() body: CreateMessageDto,
    @ReqUser() user: RequestUser,
  ) {
    return this.conversationService.createMessage(id, body, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }

  @ApiOperation({
    description: 'Get member of conversations',
  })
  @Get(':id/users')
  getMembers(@Param() { id }: UUIDParam) {
    return this.conversationService.getMemberOfConversations(id);
  }

  @ApiOperation({
    description: 'Delete a user from a conversation',
  })
  @Delete(':conversationId/users/:userId')
  deleteUserFromConversation(
    @Param() { conversationId, userId }: ConversationUserRequestParam,
    @ReqUser() user: RequestUser,
  ) {
    return this.conversationService.deleteMemberOfConversation(
      userId,
      conversationId,
      user,
    );
  }

  @ApiOperation({
    description: 'Update user info in conversation',
  })
  @Put(':conversationId/users/:userId')
  updateUserInfo(
    @Param() { conversationId, userId }: ConversationUserRequestParam,
    @ReqUser() user: RequestUser,
    @Body() body: ConversationUserRequestBody,
  ) {
    return this.conversationService.updateUserInfo(
      conversationId,
      userId,
      user,
      body,
    );
  }
}
