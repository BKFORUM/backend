import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'email of the user',
    example: 'namvietanh2002@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
