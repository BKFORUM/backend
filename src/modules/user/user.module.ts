import { FacultyModule } from '@modules/faculty/faculty.module';
import { ForumModule } from '@modules/forums';
import { PostModule } from '@modules/posts';
import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { RoleModule } from '../roles';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FriendsModule, FriendsService } from '@modules/friends';

@Module({
  imports: [
    DatabaseModule,
    RoleModule,
    FacultyModule,
    PostModule,
    FriendsModule,
    forwardRef(() => ForumModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
