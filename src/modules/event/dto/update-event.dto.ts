import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventParam {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  eventCommentId: string;
}

export class UpdateEventDto extends OmitType(CreateEventDto, [
  'type',
  'forumId',
]) {}
