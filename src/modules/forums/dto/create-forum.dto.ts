import { ApiProperty } from '@nestjs/swagger';
import { ForumType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { uniq } from 'lodash';

export class CreateForumDto {
  @ApiProperty({
    description: 'name of the forum',
    example: '20TCLC_DT4',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Id of the moderator',
    example: 'b9aee9b6-16fa-4bb4-a3ff-d664d5b720eb',
  })
  @IsNotEmpty()
  @IsUUID()
  moderatorId: string;

  @ApiProperty({
    description: 'Type of the forum',
    example: `${Object.values(ForumType)}`,
  })
  @IsNotEmpty()
  @IsEnum(ForumType)
  type: ForumType;

  @ApiProperty({
    description: 'An array uuid topicId',
    example: [
      '0288b413-c607-43d8-a1d4-c653d2ecb768',
      '0288b413-c607-43d8-a1d4-c653d2ecb768',
    ],
  })
  @ValidateIf((o) => o.type === ForumType.TOPIC)
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) => uniq(value))
  topicIds: string[];

  @ApiProperty({
    description: 'An array uuid userId',
    example: [
      '0288b413-c607-43d8-a1d4-c653d2ecb768',
      '0288b413-c607-43d8-a1d4-c653d2ecb768',
    ],
  })
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) => uniq(value))
  userIds: string[];
}
