import { MessageType } from '@prisma/client';

export type CreateMessageResponse = {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  type: MessageType;
};
