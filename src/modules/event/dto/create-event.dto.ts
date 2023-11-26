import { IsAfterConstraint } from '@common/decorator/date.decorator';
import { DocumentDto } from '@modules/posts/dto/create-post.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateEventDto {
  @ApiPropertyOptional({
    description: 'Forum id of the post',
    example: '5d4ef1c7-c1e5-4567-960e-691129569ad1',
  })
  @ValidateIf((o) => o.type === EventType.FORUM)
  @IsUUID()
  forumId?: string;

  @ApiProperty({
    description: 'type of the event',
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    description: 'Content of the event',
    example: 'Test content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'File of the event',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];

  @ApiProperty({
    description: 'Start at',
  })
  @IsISO8601()
  @IsNotEmpty()
  @Validate(IsAfterConstraint, ['now'])
  startAt: Date;

  @ApiProperty({
    description: 'End at',
  })
  @IsISO8601()
  @IsNotEmpty()
  @Validate(IsAfterConstraint, ['startAt'])
  endAt: Date;

  @ApiProperty({
    description: 'Display name of the event',
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'Location of the event',
  })
  @IsString()
  location: string;
}
