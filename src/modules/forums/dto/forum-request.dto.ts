import { ApiProperty } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class ForumRequestDto {
  @ApiProperty({
    description: 'Id of user',
    example: '0288b413-c607-43d8-a1d4-c653d2ecb768',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Request status',
    example: `Available values: ${Object.values(ResourceStatus)}`,
  })
  @IsEnum(ResourceStatus)
  status: ResourceStatus;
}
