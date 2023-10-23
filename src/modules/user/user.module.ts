import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database';
import { RoleModule } from '../roles';
import { FacultyModule } from '@modules/faculty/faculty.module';
import { PostModule } from '@modules/posts';

@Module({
  imports: [DatabaseModule, RoleModule, FacultyModule, PostModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
