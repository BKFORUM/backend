import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Gender, UserType } from '@prisma/client';
import { UserRole } from '@common/types';

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
  @IsISO8601()
  @IsOptional()
  @IsNotEmpty()
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
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Address of user',
  })
  @IsOptional()
  @MaxLength(255)
  @IsString()
  address?: string;
}
