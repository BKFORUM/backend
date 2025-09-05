import { DatabaseModule } from '@db';
import { CloudinaryModule } from '@modules/cloudinary';
import { NotificationModule } from '@modules/notification/notification.module';
import { NotificationService } from '@modules/notification/notification.service';
import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [DatabaseModule, CloudinaryModule, NotificationModule],
  controllers: [PostController],
  providers: [PostService, NotificationService],
  exports: [PostService],
})
export class PostModule {}
