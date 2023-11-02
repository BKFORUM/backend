import { DatabaseModule } from '@db';
import { CloudinaryModule } from '@modules/cloudinary';
import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [DatabaseModule, CloudinaryModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
