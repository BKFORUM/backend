import { GroupUserType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { ForumEntity } from './forum.entity';

export class UserToForumEntity {
  @ApiProperty({
    required: false,
  })
  userId: string;
  @ApiProperty({
    required: false,
  })
  forumId: string;
  @ApiProperty({
    enum: GroupUserType,
    required: false,
  })
  userType: GroupUserType;
  @ApiProperty({
    required: false,
  })
  user?: UserEntity;
  @ApiProperty({
    required: false,
  })
  forum?: ForumEntity;
}
