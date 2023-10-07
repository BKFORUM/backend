import { ForumType, ResourceStatus } from '@prisma/client';

export interface ForumResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  status: ResourceStatus;
  type: ForumType;
  moderator: {
    id: string;
    fullName: string;
  };
  _count: {
    users: number;
  };
}
