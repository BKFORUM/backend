import { DatabaseModule } from '@db';
import { NotificationModule } from '@modules/notification';
import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [DatabaseModule, NotificationModule, EventEmitterModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
