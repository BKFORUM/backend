import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  resourceName: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;
}
