import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateForumDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
