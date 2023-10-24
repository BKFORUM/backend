import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateForumDto } from './create-forum.dto';

export class UpdateForumDto extends PartialType(
  OmitType(CreateForumDto, ['moderatorId', 'userIds']),
) {
  @ApiProperty({
    enum: ResourceStatus,
  })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;
}
