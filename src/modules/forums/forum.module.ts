import { TopicModule } from '@modules/topic';
import { UserModule } from '@modules/user';
import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserModule), TopicModule],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
