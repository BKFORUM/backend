import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
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
}
