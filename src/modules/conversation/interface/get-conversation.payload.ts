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

export type GetMessageResponse = {
  id: string;
  type: MessageType;
  content: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    displayName: string;
    id: string;
    avatarUrl: string;
    fullName: string;
    email: string;
    dateOfBirth: Date;
    gender: Gender;
    phoneNumber: string;
    address: string;
  };
};

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
