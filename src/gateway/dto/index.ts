import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsUUID } from 'class-validator';

export type UserDto = {
  id: string;
  avatarUrl: string;
  email: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string;
  address: string;
};

export class ReadMessageDto {
  @ApiProperty({
    description: 'ID of the message',
    example: 'b9aee9b6-16fa-4bb4-a3ff-d664d5b720eb',
  })
  @IsUUID()
  messageId: string;

  @ApiProperty({
    description: 'ID of the conversation',
    example: 'b9aee9b6-16fa-4bb4-a3ff-d664d5b720eb',
  })
  @IsUUID()
  conversationId: string;
}
