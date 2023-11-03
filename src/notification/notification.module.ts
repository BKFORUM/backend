import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { MessageModule } from '@modules/message/message.module';
import { AuthModule } from '@modules/auth';
import { GatewaySessionManager } from './notification.session';

@Module({
  imports: [MessageModule, AuthModule],
  providers: [NotificationGateway, GatewaySessionManager],
  exports: [NotificationGateway],
})
export class NotificationModule {}
