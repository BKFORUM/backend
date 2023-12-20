import { AuthenticatedSocket, UUIDParam } from '@common/types';
import { AuthService } from '@modules/auth';
import {
  GetConversationPayload,
  GetMessageResponse,
} from '@modules/conversation/interface/get-conversation.payload';
import { MessageService } from '@modules/message/message.service';
import { UserResponse } from '@modules/user/interfaces';
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
import { isEmpty, omit } from 'lodash';
import { Server } from 'socket.io';
import { WebsocketExceptionsFilter } from 'src/filters/web-socket.filter';
import { WsJwtGuard } from 'src/guard/ws.guard';
import { WSAuthMiddleware } from 'src/middleware';
import { MessageEvent } from './enum';
import { GatewaySessionManager } from './gateway.session';
import { FriendsService } from '@modules/friends';
import { ReadMessageDto, UserDto } from './dto';
import { ConversationService } from '@modules/conversation/conversation.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
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
    private readonly friendService: FriendsService,
    private readonly conversationService: ConversationService,
  ) {}
  async handleConnection(client: AuthenticatedSocket) {
    const friends = await this.friendService.getFriendList(client.user);
    if (this.sessions.getSocketsByUserId(client.user.id).length === 0) {
      const onlineFriendSockets = this.getOnlineUsers(friends);
      console.log(onlineFriendSockets);
      onlineFriendSockets.forEach((socket) => {
        socket.emit('onFriendOnline', omit(client.user, 'roles', 'iat', 'exp'));
      });
    }
    this.sessions.setUserSocket(this.getSessionId(client), client);
  }

  getOnlineUsers(users: UserDto[]) {
    const userSockets = users
      .map((user) => this.sessions.getSocketsByUserId(user.id))
      .filter((sockets) => sockets.length > 0);
    return userSockets.flat();
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.sessions.removeUserSocket(this.getSessionId(client));
    const friends = await this.friendService.getFriendList(client.user);
    if (this.sessions.getSocketsByUserId(client.user.id).length === 0) {
      const onlineFriendSockets = this.getOnlineUsers(friends);
      onlineFriendSockets.forEach((socket) => {
        socket.emit(
          'onFriendOffline',
          omit(client.user, 'roles', 'iat', 'exp'),
        );
      });
    }
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

  @SubscribeMessage('onGetOnlineFriends')
  async handleGetOnlineFriends(@ConnectedSocket() client: AuthenticatedSocket) {
    const friends = await this.friendService.getFriendList(client.user);
    const onlineFriends = [];
    friends.forEach((friend) => {
      const sockets = this.sessions.getSocketsByUserId(friend.id);
      if (sockets.length > 0) {
        onlineFriends.push(friend);
      }
    });
    client.emit('onGetOnlineFriends', onlineFriends);
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

  @SubscribeMessage('onReadMessage')
  async handleReadMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: ReadMessageDto,
  ) {
    const { conversationId, messageId } = body;
    console.log(`${client.user.fullName} read a message ${messageId}`);
    return await this.conversationService.readMessage(
      messageId,
      conversationId,
      client.user.id,
    );
  }

  @OnEvent(MessageEvent.MESSAGE_CREATED)
  async handleMessageCreateEvent(payload: GetMessageResponse) {
    const { conversationId } = payload;
    this.logger.log(`Message in ${conversationId}`);
    const members = await this.conversationService.getMemberOfConversations(
      conversationId,
    );
    const users = members.map(({ user }) => user);
    const onlineUsers = this.getOnlineUsers(users);
    onlineUsers.forEach((socket) => socket.emit('onMessage', payload));
  }

  @OnEvent(MessageEvent.CONVERSATION_JOINED)
  handleConversationJoinedEvent(payload: {
    users: UserResponse[];
    conversationId: string;
  }) {
    const { users, conversationId } = payload;
    this.server.to(conversationId).emit('onAddUsersConversation', users);
  }

  @OnEvent(MessageEvent.CONVERSATION_LEFT)
  handleLeft(payload: { user: UserResponse; conversationId: string }) {
    const { user, conversationId } = payload;
    this.server.to(conversationId).emit('onUserLeaveConversation', user);
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
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onCommentCreated', payload);
      });
    }
  }

  @OnEvent(MessageEvent.LIKE_CREATED)
  handleLikeCreateEvent(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onLikeCreated', payload);
      });
    }
  }

  @OnEvent(MessageEvent.REQUEST_FORUM_CREATED)
  handleUserRequestForum(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onRequestForumCreated', payload);
      });
    }
  }

  @OnEvent(MessageEvent.REQUEST_FORUM_APPROVED)
  handleUserApprovedRequestForum(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onRequestForumApproved', payload);
      });
    }
  }

  @OnEvent(MessageEvent.REQUEST_POST_CREATED)
  handlePostRequestCreatedForum(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onPostRequestCreated', payload);
      });
    }
  }

  @OnEvent(MessageEvent.REQUEST_POST_APPROVED)
  handlePostRequestApprovedForum(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onPostRequestApproved', payload);
      });
    }
  }

  @OnEvent(MessageEvent.REQUEST_FRIEND_CREATED)
  handleFriendRequestCreated(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onFriendRequestCreated', payload);
      });
    }
  }

  @OnEvent(MessageEvent.REQUEST_FRIEND_APPROVED)
  handleFriendRequestApproved(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onFriendRequestApproved', payload);
      });
    }
  }

  @OnEvent(MessageEvent.FRIENDSHIP_CREATED)
  handleCreateFriendShip(payload) {
    console.log(payload);
    const { sender, receiver } = payload;
    console.log(sender, receiver);
    const senderSockets = this.sessions.getSocketsByUserId(sender.id);
    const receiverSockets = this.sessions.getSocketsByUserId(receiver.id);
    if (!isEmpty(senderSockets) && !isEmpty(receiverSockets)) {
      senderSockets.forEach((socket) => {
        socket.emit('onFriendOnline', receiver);
      });
      receiverSockets.forEach((socket) => {
        socket.emit('onFriendOnline', sender);
      });
    }
  }

  @OnEvent(MessageEvent.REPLY_COMMENT_CREATED)
  handleReplyCommentCreated(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onReplyCommentCreated', payload);
      });
    }
  }

  @OnEvent(MessageEvent.FORUM_APPROVED)
  handleForumApproved(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onForumApproved', payload);
      });
    }
  }

  @OnEvent(MessageEvent.EVENT_COMMENT_CREATED)
  handleEventCommentCreated(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onEventCommentCreated', payload);
      });
    }
  }

  @OnEvent(MessageEvent.EVENT_UPCOMING)
  handleUpComingEvent(payload, userId: string) {
    const authorSockets = this.sessions.getSocketsByUserId(userId);

    if (!isEmpty(authorSockets)) {
      authorSockets.forEach((socket) => {
        socket.emit('onUpcomingEvent', payload);
      });
    }
  }
}
