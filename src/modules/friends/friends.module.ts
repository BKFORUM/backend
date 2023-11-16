import { DatabaseModule } from '@db';
import { NotificationModule } from '@modules/notification';
import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
