import { ApiProperty } from '@nestjs/swagger';
import { UserToRoleEntity } from './user-to-role.entity';
import { RoleToPermissionEntity } from './role-to-permission.entity';

export class RoleEntity {
  @ApiProperty({
    required: false,
  })
  id: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  updatedAt: Date;
  @ApiProperty({
    required: false,
  })
  name: string;
  @ApiProperty({
    required: false,
  })
  displayName: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    required: false,
  })
  canBeUpdated: boolean;
  @ApiProperty({
    required: false,
  })
  canBeDeleted: boolean;
  @ApiProperty({
    isArray: true,
    required: false,
  })
  users?: UserToRoleEntity[];
  @ApiProperty({
    isArray: true,
    required: false,
  })
  permissions?: RoleToPermissionEntity[];
}
