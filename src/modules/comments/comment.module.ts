import { DatabaseModule } from '@db';
import { CloudinaryModule } from '@modules/cloudinary';
import { NotificationModule } from '@modules/notification';
import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [DatabaseModule, CloudinaryModule, NotificationModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
