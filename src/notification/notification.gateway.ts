import { WebSocket } from '@common/types';
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
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Socket } from 'dgram';
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
export class NotificationGateway {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: CreateMessageDto,
  ) {
    const message = await this.messageService.create(body);
    this.server.emit('recMessage', message);
  }

  @SubscribeMessage('tag')
  handleTag(client: any, payload: any): string {
    return 'Hello go';
  }
}
