import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, GetAllRolesDto, UpdateRoleDto } from './dto';
import { Roles } from 'src/common/decorator';
import { UserRole } from 'src/common/types/enum';
import { RoleQueryParam } from './dto/role-param';
import { AccessTokenGuard } from 'src/guard';

@ApiBearerAuth()
@ApiTags('Role')
@Controller({
  version: '1',
  path: 'roles',
})
@UseGuards(AccessTokenGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.roleService.createRole(createRoleDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  async getAllRoles(@Query() query: GetAllRolesDto) {
    return await this.roleService.getAllRoles(query);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getRoleById(@Param() { id }: RoleQueryParam) {
    return await this.roleService.getRoleById(id);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateRoleById(
    @Param() { id }: RoleQueryParam,
    @Body() body: UpdateRoleDto,
  ) {
    return await this.roleService.updateRole(id, body);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRoleById(@Param() { id }: RoleQueryParam) {
    return await this.roleService.deleteRole(id);
  }
}
