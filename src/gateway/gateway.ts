import { UUIDParam, AuthenticatedSocket } from '@common/types';
import { CreateMessageDto } from '@modules/message/dto/create-message.dto';
import { MessageService } from '@modules/message/message.service';
import {
  Logger,
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
import { GatewaySessionManager } from './gateway.session';
import { WSAuthMiddleware } from 'src/middleware';
import { AuthService } from '@modules/auth';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateMessageResponse } from '@modules/conversation/dto/create-message.response';
import { MessageEvent } from './enum';
import { GetConversationPayload } from '@modules/conversation/interface/get-conversation.payload';

@WebSocketGateway({
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
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventGateway.name);
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
    this.logger.log(`WS ${EventGateway.name} init`);
  }

  @SubscribeMessage('onMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: CreateMessageDto,
  ) {}

  @SubscribeMessage('onConversationJoin')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() { id }: UUIDParam,
  ) {
    const socket = this.sessions.getUserSocket(client.user.id);
    socket.join(id);
  }

  @SubscribeMessage('onConversationLeave')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() { id }: UUIDParam,
  ) {
    const socket = this.sessions.getUserSocket(client.user.id);
    socket.leave(id);
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

  @OnEvent(MessageEvent.MESSAGE_CREATED)
  handleMessageCreateEvent(payload: CreateMessageResponse) {
    const { conversationId } = payload;

    this.server.to(conversationId).emit('onMessage', payload);
  }

  @OnEvent(MessageEvent.CONVERSATION_CREATED)
  handleConversationCreateEvent(payload: GetConversationPayload) {
    const { users, id } = payload;
    users.forEach(({ userId }) => {
      const socket = this.sessions.getUserSocket(userId);
      if (socket) socket.join(id);
    });
  }
}
