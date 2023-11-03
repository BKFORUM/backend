import {
  GetConversationMemberPayload,
  GetConversationPayload,
} from '../interface/get-conversation.payload';

export const getAuthorDisplayName = (author: GetConversationMemberPayload) => {
  if (author.displayName) {
    return author.displayName;
  }

  return author.user.fullName;
};

export const getConversationDisplayName = (
  conversation: GetConversationPayload,
) => {
  if (conversation.displayName) {
    return conversation.displayName;
  }

  return conversation.users
    .map((member) => getAuthorDisplayName(member))
    .join(', ');
};
