import { BadRequestException } from '@nestjs/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { CreateForumDto } from './create-forum.dto';

export class UpdateForumDto extends PartialType(
  OmitType(CreateForumDto, ['moderatorId', 'userIds']),
) {
  @ApiProperty({
    enum: ResourceStatus,
  })
  @IsOptional()
  @ValidateIf((dto, value) => {
    {
      if (value) {
        if (dto.name || dto.type || dto.topicIds) {
          throw new BadRequestException('The status must be sent alone');
        }
      }

      return true;
    }
  })
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;
}
