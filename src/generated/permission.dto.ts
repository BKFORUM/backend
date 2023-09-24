import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
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
}
