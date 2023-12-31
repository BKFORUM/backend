import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'New password',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Confirm password',
  })
  @MinLength(6)
  confirmPassword: string;
}
