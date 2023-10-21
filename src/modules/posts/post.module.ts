import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { DatabaseModule } from '@db';
import { CloudinaryModule } from '@modules/cloudinary';

@Module({
  imports: [DatabaseModule, CloudinaryModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
