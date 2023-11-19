import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';
import { uniq } from 'lodash';

export class AddUsersToConversationDto {
  @ApiProperty({
    description: 'An array uuid userId',
    example: [
      '0288b413-c607-43d8-a1d4-c653d2ecb768',
      '0288b413-c607-43d8-a1d4-c653d2ecb768',
    ],
  })
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) => uniq(value))
  userIds: string[];
}
