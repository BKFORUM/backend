import { ApiProperty } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { IsEnum, IsIn } from 'class-validator';

export class PatchPostRequestDto {
  @ApiProperty({
    description: 'Status of the request',
    example: ResourceStatus.ACTIVE,
  })
  @IsEnum(ResourceStatus)
  @IsIn([ResourceStatus.ACTIVE, ResourceStatus.DELETED, ResourceStatus.BLOCKED])
  status: ResourceStatus;
}
