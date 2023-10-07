import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Forum id of the post',
    example: '5d4ef1c7-c1e5-4567-960e-691129569ad1',
  })
  @IsUUID()
  forumId: string;

  @ApiProperty({
    description: 'Title of the post',
    example: 'Test title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'Test content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
