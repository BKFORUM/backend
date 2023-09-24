import { ApiProperty } from '@nestjs/swagger';
import { RoleToPermissionEntity } from './role-to-permission.entity';
import { UserToPermissionEntity } from './user-to-permission.entity';
import { PermissionGroupEntity } from './permission-group.entity';

export class PermissionEntity {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  id: number;
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
  resourceName: string;
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
  canCreate: boolean;
  @ApiProperty({
    required: false,
  })
  canRead: boolean;
  @ApiProperty({
    required: false,
  })
  canUpdate: boolean;
  @ApiProperty({
    required: false,
  })
  canDelete: boolean;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  permissionGroupId: number | null;
  @ApiProperty({
    isArray: true,
    required: false,
  })
  roles?: RoleToPermissionEntity[];
  @ApiProperty({
    isArray: true,
    required: false,
  })
  users?: UserToPermissionEntity[];
  @ApiProperty({
    required: false,
    nullable: true,
  })
  permissionGroup?: PermissionGroupEntity | null;
}
