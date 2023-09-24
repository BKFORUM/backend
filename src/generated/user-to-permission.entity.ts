import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { PermissionEntity } from './permission.entity';

export class UserToPermissionEntity {
  @ApiProperty({
    required: false,
  })
  userId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  permissionId: number;
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
  user?: UserEntity;
  @ApiProperty({
    required: false,
  })
  permission?: PermissionEntity;
}
