import { Gender } from '@prisma/client';

export interface CommentResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  postId: string;
  content: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    address?: string;
    avatarUrl?: string;
    dateOfBirth: Date;
    email: string;
    gender: Gender;
  };
}
