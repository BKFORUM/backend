import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateForumDto } from './create-forum.dto';

export class UpdateForumDto extends PartialType(
  OmitType(CreateForumDto, ['moderatorId', 'userIds']),
) {}
