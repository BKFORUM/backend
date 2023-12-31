import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'New password',
  })
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'New password',
  })
  @MinLength(6)
  oldPassword: string;
}
