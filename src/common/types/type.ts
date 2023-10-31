import { PrismaClient } from '@prisma/client';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Socket } from 'socket.io';
export type JwtPayload = {
  sub: string;
  username: string;
};

export type WebSocket = Socket & { [k: string]: any };

export type RequestUser = {
  id: string;
  fullName: string;
  roles: string[];
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
