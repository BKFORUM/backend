import { Prisma } from '@prisma/client';
import { isEmpty } from 'lodash';
import { searchByMode } from 'src/common/utils/prisma';

export function filterByInOrNotInForum(
  forumId?: string,
  isInForum?: boolean,
): Prisma.UserWhereInput {
  if (isEmpty(forumId)) {
    return {};
  }

  return {
    AND: {
      userToForum: isInForum
        ? {
            some: {
              forumId,
            },
          }
        : {
            none: {
              forumId,
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
          email: searchByMode(search),
        },
        {
          phoneNumber: searchByMode(search),
        },
        {
          address: searchByMode(search),
        },
      ],
    };
  }

  return whereConditions;
}
