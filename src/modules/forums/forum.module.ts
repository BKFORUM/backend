import { NotificationModule } from '@modules/notification';
import { TopicModule } from '@modules/topic';
import { UserModule } from '@modules/user';
import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from 'src/database';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UserModule),
    TopicModule,
    EventEmitterModule,
    NotificationModule
  ],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
