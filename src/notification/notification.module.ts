import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { MessageModule } from '@modules/message/message.module';
import { AuthModule } from '@modules/auth';

@Module({
  imports: [MessageModule, AuthModule],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
