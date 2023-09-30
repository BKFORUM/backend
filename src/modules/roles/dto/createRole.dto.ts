import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of role',
    example: 'USER',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Display name of role',
    example: 'USER',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  displayName: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'USER',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Permissions of the role',
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissions: number[] = [];
}
