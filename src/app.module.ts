import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user';
import { AuthModule } from './modules/auth';
import { RoleModule } from './modules/roles';
import { ForumModule } from './modules/forums';
import { PostModule } from './modules/posts';
import { TopicModule } from '@modules/topic';
import { NotificationGateway } from './notification/notification.gateway';
import { FacultyModule } from './modules/faculty/faculty.module';
import { CloudinaryModule } from '@modules/cloudinary';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter';
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    AppService,
    NotificationGateway,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CloudinaryModule,
    AuthModule,
    UserModule,
    RoleModule,
    ForumModule,
    PostModule,
    TopicModule,
    FacultyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
