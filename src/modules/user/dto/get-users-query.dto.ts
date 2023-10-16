import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, UserType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { IsOrderQueryParam } from 'src/common/decorator';
import { GetAllUsersOrderByEnum } from '../user.enum';

export class GetUsersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of records to skip and then return the remainder',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({
    description: 'Number of records to return and then skip over the remainder',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 10;

  @ApiPropertyOptional({
    description: `Order by keyword. \n\n  Available values: ${Object.values(
      GetAllUsersOrderByEnum,
    )}`,
    example: `${GetAllUsersOrderByEnum.FULL_NAME}:${Prisma.SortOrder.asc}`,
  })
  @IsOptional()
  @IsString()
  @IsOrderQueryParam('order', GetAllUsersOrderByEnum)
  order?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto, value) => {
    if (value && dto.isInForum === undefined) {
      throw new BadRequestException(
        'The forumId is sent when the isInForum is sent',
      );
    }

    return true;
  })
  @IsString()
  @IsOptional()
  @IsUUID('4')
  forumId?: string;

  @ApiPropertyOptional({
    description:
      'This value to specify the returned list users are in or not in the forum and there is no effect if sending this field without forumId',
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  isInForum?: boolean;

  @ApiPropertyOptional({
    enum: UserType,
  })
  @IsOptional()
  @IsEnum(UserType)
  type?: UserType;
}
