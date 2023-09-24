import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  resourceName: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  displayName: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
