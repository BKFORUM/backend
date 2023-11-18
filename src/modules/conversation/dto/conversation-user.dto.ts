import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ConversationUserRequestParam {
  @ApiProperty({
    description: 'Id of the conversation',
  })
  @IsNotEmpty()
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    description: 'Id of the user',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class ConversationUserRequestBody {
  @ApiPropertyOptional({
    description: 'Display name of the user',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  displayName: string;
}
