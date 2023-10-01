import { ApiProperty } from '@nestjs/swagger';
import { UserToRoleEntity } from './user-to-role.entity';

export class UserEntity {
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
  fullName: string;
  @ApiProperty({
    required: false,
  })
  username: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  studentId: string | null;
  @ApiProperty({
    required: false,
  })
  password: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  refreshToken: string | null;
  @ApiProperty({
    isArray: true,
    required: false,
  })
  roles?: UserToRoleEntity[];
  @ApiProperty({
    required: false,
    nullable: true,
  })
  avatarUrl: string | null;
}
