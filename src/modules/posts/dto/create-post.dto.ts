import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  arrayMaxSize,
  arrayMinSize,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Forum id of the post',
    example: '5d4ef1c7-c1e5-4567-960e-691129569ad1',
  })
  @IsUUID()
  forumId: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'Test content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
