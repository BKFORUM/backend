import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database';
import { RoleModule } from '../roles';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
