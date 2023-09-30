import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'username of the user',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'username of the user',
  })
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
    description: 'Role ids',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  roles: string[];
}
