import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { DatabaseModule } from '@db';

@Module({
  imports: [DatabaseModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
