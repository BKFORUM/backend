import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { DocumentDto } from './create-post.dto';
import { uniq } from 'lodash';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Content of the post',
    example: 'Test content',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'File of the posts',
  })
  @ValidateNested({ each: true })
  @Transform(({ value }) => uniq(value))
  @Type(() => DocumentDto)
  documents: DocumentDto[];
}
