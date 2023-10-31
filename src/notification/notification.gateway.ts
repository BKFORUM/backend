import { CreateMessageDto } from '@modules/message/dto/create-message.dto';
import { MessageService } from '@modules/message/message.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Server } from 'http';
import { WebsocketExceptionsFilter } from 'src/filters/web-socket.filter';

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
export class NotificationGateway {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;
  @SubscribeMessage('message')
  async handleMessage(@MessageBody() body: CreateMessageDto) {
    const message = await this.messageService.create(body);
    this.server.emit('recMessage', message);
  }

  @SubscribeMessage('tag')
  handleTag(client: any, payload: any): string {
    return 'Hello go';
  }
}
