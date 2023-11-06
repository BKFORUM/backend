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
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(+id);
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
}
