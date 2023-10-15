import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { UserModule } from '@modules/user';
import { TopicModule } from '@modules/topic';

@Module({
  imports: [DatabaseModule, UserModule, TopicModule],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
