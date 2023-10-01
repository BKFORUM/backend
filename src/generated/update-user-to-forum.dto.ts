import { GroupUserType } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserToForumDto {
  @ApiProperty({
    enum: GroupUserType,
    required: false,
  })
  @IsOptional()
  userType?: GroupUserType;
}
