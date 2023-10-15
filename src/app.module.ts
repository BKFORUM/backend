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
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    RoleModule,
    ForumModule,
    PostModule,
    TopicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
