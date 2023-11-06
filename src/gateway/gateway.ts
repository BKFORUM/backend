import { AuthenticatedSocket, UUIDParam } from '@common/types';
import { AuthService } from '@modules/auth';
import { GetConversationPayload, GetMessageResponse } from '@modules/conversation/interface/get-conversation.payload';
import { MessageService } from '@modules/message/message.service';
import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Like, Notification } from '@prisma/client';
import { Server } from 'socket.io';
import { WebsocketExceptionsFilter } from 'src/filters/web-socket.filter';
import { WsJwtGuard } from 'src/guard/ws.guard';
import { WSAuthMiddleware } from 'src/middleware';
import { MessageEvent } from './enum';
import { GatewaySessionManager } from './gateway.session';

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
    this.sessions.setUserSocket(this.getSessionId(client), client);
  }
  handleDisconnect(client: AuthenticatedSocket) {
    this.sessions.removeUserSocket(this.getSessionId(client));
  }

  getSessionId({ user }: AuthenticatedSocket) {
    return `${user.id}_${user.session}`;
  }

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    const middle = WSAuthMiddleware(this.authService);
    server.use(middle);
    this.logger.log(`WS ${EventGateway.name} init`);
  }

  @SubscribeMessage('onMessage')
  async handleMessage(@ConnectedSocket() client: AuthenticatedSocket) {
    console.log(client.user);
  }

  @SubscribeMessage('onConversationJoin')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() { id }: UUIDParam,
  ) {
    const socket = this.sessions.getUserSocket(this.getSessionId(client));
    this.logger.log(`${client.user.id} joined conversation ${id}`);
    socket.join(id);
  }

  @SubscribeMessage('onConversationLeave')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() { id }: UUIDParam,
  ) {
    const socket = this.sessions.getUserSocket(this.getSessionId(client));
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
  handleMessageCreateEvent(payload: GetMessageResponse) {
    const { conversationId } = payload;
    this.logger.log(`Message in ${conversationId}`);
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

  @OnEvent(MessageEvent.COMMENT_CREATED)
  handleCommentCreateEvent(payload: Notification, userId: string) {
    const authorSocket = this.sessions.getUserSocket(userId);

    if (authorSocket) authorSocket.emit('onCommentCreated', payload);
  }

  @OnEvent(MessageEvent.LIKE_CREATED)
  handleLikeCreateEvent(payload: Like, userId: string) {
    const authorSocket = this.sessions.getUserSocket(userId);

    if (authorSocket) authorSocket.emit('onLikeCreated', payload);
  }
}
