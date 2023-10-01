import { GroupUserType } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserToForumDto {
  @ApiProperty({
    enum: GroupUserType,
  })
  @IsNotEmpty()
  userType: GroupUserType;
}
