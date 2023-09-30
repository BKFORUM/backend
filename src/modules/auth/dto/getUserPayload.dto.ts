import { Prisma } from '@prisma/client';

export type getUsersPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    password: true;
    refreshToken: true;
    fullName: true;
    roles: {
      select: {
        role: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;
