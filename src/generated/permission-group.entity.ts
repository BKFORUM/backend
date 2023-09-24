import { ApiProperty } from '@nestjs/swagger';
import { PermissionEntity } from './permission.entity';

export class PermissionGroupEntity {
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
  description: string;
  @ApiProperty({
    isArray: true,
    required: false,
  })
  permissions?: PermissionEntity[];
}
