import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  studentId?: string | null;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  refreshToken?: string | null;
}
