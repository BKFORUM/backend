import { GroupUserType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserToForumDto {
  @ApiProperty({
    enum: GroupUserType,
    required: false,
  })
  userType: GroupUserType;
}
