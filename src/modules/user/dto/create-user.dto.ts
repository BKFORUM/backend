import { UserRole } from '@common/types/enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, UserType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'username of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === UserType.STUDENT)
  @Matches(/[0-9]{9}@sv1.dut.udn.vn/)
  email: string;

  @ApiProperty({
    description: 'username of the user',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'username of the user',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Role names',
    example: [UserRole.ADMIN],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @ApiProperty({
    description: 'Gender of user',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    description: 'Date of birth',
  })
  @IsISO8601()
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({
    description: 'Faculty Id',
  })
  @IsUUID()
  facultyId: string;

  @ApiProperty({
    description: 'Faculty Id',
  })
  @IsEnum(UserType)
  type: UserType;

  @ApiPropertyOptional({
    description: 'Phone number of user',
  })
  @IsOptional()
  @MaxLength(11)
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Address of user',
  })
  @IsOptional()
  @MaxLength(255)
  @IsString()
  address: string;
}
