import { ApiProperty } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export class PatchFriendRequestDto {
  @ApiProperty({
    description: 'Status of the request',
    example: ResourceStatus.ACTIVE,
  })
  @IsIn([ResourceStatus.ACTIVE, ResourceStatus.DELETED, ResourceStatus.BLOCKED])
  status: ResourceStatus;
}
