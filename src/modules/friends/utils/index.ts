import { Friendship, ResourceStatus } from '@prisma/client';

export const getRequestStatus = (request: Friendship, userId: string) => {
  if (!request) return 'NOT FRIEND';
  switch (request.status) {
    case ResourceStatus.PENDING:
      const pendingStatus =
        userId === request.receiverId ? 'PENDING_RECEIVED' : 'PENDING_SENT';
      return pendingStatus;
    default:
      return request.status;
  }
};
