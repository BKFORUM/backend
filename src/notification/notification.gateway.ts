import { RequestUser, UUIDParam, AuthenticatedSocket } from '@common/types';
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
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketExceptionsFilter } from 'src/filters/web-socket.filter';
import { WsJwtGuard } from 'src/guard/ws.guard';
import { GatewaySessionManager } from './notification.session';
import { WSAuthMiddleware } from 'src/middleware';
import { AuthService } from '@modules/auth';

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
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messageService: MessageService,
    private readonly sessions: GatewaySessionManager,
    private readonly authService: AuthService,
  ) {}
  handleConnection(client: AuthenticatedSocket) {
    this.sessions.setUserSocket(client.user.id, client);
  }
  handleDisconnect(client: AuthenticatedSocket) {
    this.sessions.removeUserSocket(client.user.id);
  }

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    const middle = WSAuthMiddleware(this.authService);
    server.use(middle);
    console.log(`WS ${NotificationGateway.name} init`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: CreateMessageDto,
  ) {
    const message = await this.messageService.create(body, client.user.id);
    this.server.emit('messageReceived', message);
  }

  @SubscribeMessage('delMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() { id }: UUIDParam,
  ) {
    const message = await this.messageService.delete(client.user, id);
    this.server.emit('messageDeleted', message);
  }

  @SubscribeMessage('tag')
  handleTag(client: any, payload: any): string {
    return 'Hello go';
  }
}
