import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  displayName?: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}
