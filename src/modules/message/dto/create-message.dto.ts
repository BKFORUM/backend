import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Id of the conversation',
    example: 'b9aee9b6-16fa-4bb4-a3ff-d664d5b720eb',
  })
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello world',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Type of the message',
    example: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  type: MessageType = MessageType.TEXT;
}
