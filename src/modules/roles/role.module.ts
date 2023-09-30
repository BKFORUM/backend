import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
