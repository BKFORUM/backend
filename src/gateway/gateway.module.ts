import { Module } from '@nestjs/common';
import { EventGateway } from './gateway';
import { MessageModule } from '@modules/message/message.module';
import { AuthModule } from '@modules/auth';
import { GatewaySessionManager } from './gateway.session';
import { FriendsModule } from '@modules/friends';
import { ConversationModule } from '@modules/conversation/conversation.module';

@Module({
  imports: [MessageModule, AuthModule, FriendsModule, ConversationModule],
  providers: [EventGateway, GatewaySessionManager],
  exports: [EventGateway],
})
export class GatewayModule {}
