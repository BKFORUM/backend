import { ResourceStatus } from '@prisma/client';

export interface PostResponse {
  id: string;
  forum: {
    id: string;
    name: string;
  };
  title: string;
  content: string;
  user: {
    avatarUrl: string;
    fullName: string;
  };
  status: ResourceStatus;
}
