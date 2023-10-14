import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { IsOrderQueryParam } from 'src/common/decorator';
import { GetAllForumsOrderByEnum } from '../forum.enum';

export class GetAllForumsDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
    example: 'Test',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of records to skip and then return the remainder',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiPropertyOptional({
    description: 'Number of records to return and then skip over the remainder',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take: number = 10;

  @ApiPropertyOptional({
    description: 'The status of the forum is pending or not',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isPending: boolean;

  @ApiPropertyOptional({
    description: `Order by keyword. \n\n  Available values: ${Object.values(
      GetAllForumsOrderByEnum,
    )}`,
    example: `${GetAllForumsOrderByEnum.NAME}:${Prisma.SortOrder.asc}`,
  })
  @IsOptional()
  @IsString()
  @IsOrderQueryParam('order', GetAllForumsOrderByEnum)
  order?: string;
}
