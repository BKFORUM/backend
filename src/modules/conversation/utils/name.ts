import { RequestUser } from '@common/types';
import {
  GetConversationMemberPayload,
  GetConversationPayload,
} from '../interface/get-conversation.payload';
import { ConversationType } from '@prisma/client';

export const getAuthorDisplayName = (author: GetConversationMemberPayload) => {
  if (author.displayName) {
    return author.displayName;
  }

  return author.user.fullName;
};

export const getConversationDisplayName = (
  conversation: GetConversationPayload,
  user: RequestUser,
) => {
  if (conversation.displayName) {
    return conversation.displayName;
  }

  return conversation.users
    .filter((member) => member.userId !== user.id)
    .map((member) => getAuthorDisplayName(member))
    .join(', ');
};

export const getOtherUserAvatar = (
  users: GetConversationMemberPayload[],
  user: RequestUser,
) => {
  const friend = users.find(({ userId }) => userId !== user.id)!.user;
  return friend.avatarUrl;
};
