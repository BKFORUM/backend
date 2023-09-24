import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionGroupDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  resourceName?: string;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
