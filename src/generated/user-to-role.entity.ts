import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

export class UserToRoleEntity {
  @ApiProperty({
    required: false,
  })
  userId: string;
  @ApiProperty({
    required: false,
  })
  roleId: string;
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
  role?: RoleEntity;
}
