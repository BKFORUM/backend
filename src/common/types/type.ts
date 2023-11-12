import { $Enums, PrismaClient } from '@prisma/client';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Socket } from 'socket.io';
export type JwtPayload = {
  sub: string;
  username: string;
};

export type AuthenticatedSocket = Socket & { user: RequestUser };

export type RequestUser = {
  id: string;
  fullName: string;
  roles: string[];
  session: string;
};

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

export type Document = {
  fileName: string;
  fileUrl: string;
};

export type Models = keyof Omit<
  PrismaClient,
  | 'disconnect'
  | 'connect'
  | 'executeRaw'
  | 'queryRaw'
  | 'transaction'
  | 'on'
  | '$disconnect'
  | '$connect'
  | '$executeRaw'
  | '$queryRaw'
  | '$transaction'
  | '$on'
  | '$executeRawUnsafe'
  | '$queryRawUnsafe'
  | '$use'
  | '$extends'
>;

export type UserResponse = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  email: string;
  dateOfBirth: Date;
  gender: $Enums.Gender;
  phoneNumber: string;
  address: string;
  avatarUrl: string;
  type: $Enums.UserType;
  facultyId: string;
};
