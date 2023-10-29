import { ForumType, Gender, ResourceStatus, Topic, UserType } from '@prisma/client';

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
    gender: Gender
    dateOfBirth: Date;
    avatarUrl: string;
    faculty: {
      id: string;
      name: string;
    },
    type: UserType
  };
  topics: Array<Object>
  _count: {
    users: number;
  };
}
