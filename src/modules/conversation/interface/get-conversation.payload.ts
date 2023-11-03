import { Prisma } from '@prisma/client';

export type GetConversationPayload = Prisma.ConversationGetPayload<{
  select: {
    id: true;
    displayName: true;
    users: {
      select: {
        userId: true;
        displayName: true;
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

export type GetConversationMemberPayload = Prisma.UserToConversationGetPayload<{
  select: {
    userId: true;
    displayName: true;
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
}>;
