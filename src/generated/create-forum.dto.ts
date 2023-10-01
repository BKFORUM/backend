import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateForumDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
