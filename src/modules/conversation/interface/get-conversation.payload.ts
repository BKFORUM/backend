import { Gender, MessageType, Prisma } from '@prisma/client';

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

export type GetMessageResponse = Prisma.MessageGetPayload<{
  select: {
    id: true;
    content: true;
    type: true;
    createdAt: true;
    updatedAt: true;
    conversationId: true;
    author: {
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
    conversation: {
      select: {
        id: true;
        displayName: true;
        avatarUrl: true;
        type: true;
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
