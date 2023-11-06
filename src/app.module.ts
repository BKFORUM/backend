import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user';
import { AuthModule } from './modules/auth';
import { RoleModule } from './modules/roles';
import { ForumModule } from './modules/forums';
import { PostModule } from './modules/posts';
import { TopicModule } from '@modules/topic';
import { FacultyModule } from './modules/faculty/faculty.module';
import { CloudinaryModule } from '@modules/cloudinary';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter';
import { FriendsModule } from './modules/friends';
import { ConversationModule } from './modules/conversation/conversation.module';
import { MessageModule } from './modules/message/message.module';
import { CommentModule } from '@modules/comments/comment.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    GatewayModule,
    CloudinaryModule,
    AuthModule,
    UserModule,
    RoleModule,
    ForumModule,
    PostModule,
    TopicModule,
    FacultyModule,
    FriendsModule,
    ConversationModule,
    MessageModule,
    CommentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
