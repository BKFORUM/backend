import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto';
import { Roles } from 'src/common/decorator';
import { UserRole } from 'src/common/types/enum';

@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller({
  version: '1',
  path: 'roles',
})
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.roleService.createRole(createRoleDto);
  }
}
