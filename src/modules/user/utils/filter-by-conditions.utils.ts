import { Prisma } from '@prisma/client';
import { isEmpty } from 'lodash';
import { searchByMode } from 'src/common/utils/prisma';

export function filterByNotInForum(forumId?: string): Prisma.UserWhereInput {
  if (isEmpty(forumId)) {
    return {};
  }

  return {
    AND: {
      NOT: {
        userToForum: {
          some: {
            forumId,
          },
        },
      },
    },
  };
}

export function filterBySearch(search: string): Prisma.UserWhereInput {
  let whereConditions: Prisma.UserWhereInput = {};

  if (search) {
    whereConditions = {
      OR: [
        {
          fullName: searchByMode(search),
        },
        {
          studentId: searchByMode(search),
        },
        {
          username: searchByMode(search),
        },
      ],
    };
  }

  return whereConditions;
}
