import { ResourceStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { UserToForumEntity } from './user-to-forum.entity';

export class ForumEntity {
  @ApiProperty({
    required: false,
  })
  id: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  updatedAt: Date;
  @ApiProperty({
    required: false,
  })
  name: string;
  @ApiProperty({
    required: false,
  })
  modId: string;
  @ApiProperty({
    enum: ResourceStatus,
    required: false,
  })
  status: ResourceStatus;
  @ApiProperty({
    required: false,
  })
  moderator?: UserEntity;
  @ApiProperty({
    isArray: true,
    required: false,
  })
  forums?: UserToForumEntity[];
}
