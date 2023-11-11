import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Gender, UserType } from '@prisma/client';
import { UserRole } from '@common/types';
import { Transform, Type } from 'class-transformer';

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

  @ApiProperty({
    description: 'Role names',
    example: [UserRole.ADMIN],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional({
    description: 'Gender of user',
  })
  @IsOptional()
  @IsEnum(Gender)
  @IsNotEmpty()
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Date of birth',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsISO8601({ strict: true })
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Faculty Id',
  })
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  @ApiPropertyOptional({
    description: 'Phone number of user',
  })
  @IsOptional()
  @MaxLength(11)
  @IsMobilePhone()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Address of user',
  })
  @IsOptional()
  @MaxLength(255)
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Url of avatar',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
