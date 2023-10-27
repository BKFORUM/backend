import { PrismaClient } from '@prisma/client';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export type JwtPayload = {
  sub: string;
  username: string;
};

export type RequestUser = {
  id: string;
  fullName: string;
  roles: string[];
};

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

export type Document = {
  fileName: string;
  url: string;
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
