import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, EventType, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateIf,
} from 'class-validator';
import { GetEventsOrderByEnum } from '../event.enum';
import { IsOrderQueryParam } from '@common/decorator';
import { IsAfterConstraint } from '@common/decorator/date.decorator';

export class GetEventDto {
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
    description: 'Forum filter',
    example:
      'c3fbe424-bac4-4e69-a1b7-25afb7a33071,ba68c625-4733-491e-bed2-1f56c5def336',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => value && value.split(','))
  @Type(() => String)
  @IsArray()
  @IsString({ each: true })
  forumIds?: string[];

  @ApiPropertyOptional({
    description: 'from day',
    type: String,
  })
  @IsOptional()
  @IsISO8601()
  from?: Date;

  @ApiPropertyOptional({
    description: 'to day',
    type: String,
  })
  @IsOptional()
  @ValidateIf((o) => !!o.from)
  @Validate(IsAfterConstraint, ['from'])
  @IsISO8601()
  to?: Date;

  @ApiPropertyOptional({
    description: 'Event type',
    type: String,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: `Order by keyword. \n\n  Available values: ${Object.values(
      GetEventsOrderByEnum,
    )}`,
    example: `${GetEventsOrderByEnum.CREATED_AT}:${Prisma.SortOrder.asc}`,
  })
  @IsOptional()
  @IsString()
  @IsOrderQueryParam('order', GetEventsOrderByEnum)
  order?: string;
}
