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
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
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

export type GetForumResponse = Prisma.ForumGetPayload<{
  select: {
    name: true;
    moderator: {
      select: {
        id: true;
        fullName: true;
        phoneNumber: true;
        address: true;
        avatarUrl: true;
        dateOfBirth: true;
        email: true;
        gender: true;
      };
    };
    topics: {
      select: {
        topic: {
          select: {
            id: true;
            displayName: true;
          };
        };
      };
    };
    posts: {
      select: {
        id: true;
        user: {
          select: {
            id: true;
            fullName: true;
            phoneNumber: true;
            address: true;
            avatarUrl: true;
            dateOfBirth: true;
            email: true;
            gender: true;
          };
        };
        _count: {
          select: {
            comments: true;
            likes: true;
          };
        };
        createdAt: true;
      };
    };
    users: {
      select: {
        user: {
          select: {
            id: true;
            fullName: true;
            phoneNumber: true;
            address: true;
            avatarUrl: true;
            dateOfBirth: true;
            email: true;
            gender: true;
          };
        };
      };
    };
  };
}>;

export type GetUserResponse = Prisma.UserGetPayload<{
  select: {
    id: true;
    fullName: true;
    phoneNumber: true;
    address: true;
    avatarUrl: true;
    dateOfBirth: true;
    email: true;
    gender: true;
  };
}>;
