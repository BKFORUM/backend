import { ReqSocketUser } from '@common/decorator/request-user.decorator';
import { RequestUser, UUIDParam, WebSocket } from '@common/types';
import { CreateMessageDto } from '@modules/message/dto/create-message.dto';
import { MessageService } from '@modules/message/message.service';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'http';
import { WebsocketExceptionsFilter } from 'src/filters/web-socket.filter';
import { WsJwtGuard } from 'src/guard/ws.guard';

@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@UseFilters(WebsocketExceptionsFilter)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
)
@UseGuards(WsJwtGuard)
export class NotificationGateway {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  async handleMessage(
    @ReqSocketUser() user: RequestUser,
    @MessageBody() body: CreateMessageDto,
  ) {
    const message = await this.messageService.create(body, user.id);
    this.server.emit('messageReceived', message);
  }

  @SubscribeMessage('delMessage')
  async handleDeleteMessage(
    @ReqSocketUser() user: RequestUser,
    @MessageBody() { id }: UUIDParam,
  ) {
    const message = await this.messageService.delete(user, id);
    this.server.emit('messageDeleted', message);
  }

  @SubscribeMessage('tag')
  handleTag(client: any, payload: any): string {
    return 'Hello go';
  }
}
