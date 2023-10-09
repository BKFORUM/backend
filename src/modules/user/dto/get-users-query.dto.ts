import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'This forumId to filter the users are not in the forum',
  })
  @IsUUID('4')
  @IsString()
  @IsOptional()
  forumId?: string;
}
