import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { DatabaseModule } from '@db';
import { NotificationGateway } from 'src/notification';
import { MessageModule } from '@modules/message/message.module';
import { AuthModule } from '@modules/auth';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
