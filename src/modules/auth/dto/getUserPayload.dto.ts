import { Prisma } from '@prisma/client';

export type getUsersPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    password: true;
    refreshToken: true;
    fullName: true;
    avatarUrl: true;
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
