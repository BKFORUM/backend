import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'username of the user',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @ApiPropertyOptional({
    description: 'username of the user',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Role ids',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roles?: string[];
}
