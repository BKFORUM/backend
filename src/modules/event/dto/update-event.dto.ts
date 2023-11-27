import { OmitType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends OmitType(CreateEventDto, [
  'type',
  'forumId',
]) {}
