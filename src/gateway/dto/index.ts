import { Gender } from '@prisma/client';

export type UserDto = {
  id: string;
  avatarUrl: string;
  email: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string;
  address: string;
};
