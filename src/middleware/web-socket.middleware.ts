import { AuthenticatedSocket } from '@common/types';
import { AuthService } from '@modules/auth';
import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';

export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;
export const WSAuthMiddleware = (
  authService: AuthService,
): SocketMiddleware => {
  return async (socket: AuthenticatedSocket, next) => {
    try {
      const authToken =
        socket.handshake?.auth?.token.split(' ')[1] ||
        socket.handshake?.auth?.token;

      const user = await authService.verifyToken(authToken);
      if (user) {
        socket.user = user;
        next();
      } else {
        next(new UnauthorizedException());
      }
    } catch (error) {
      next(new UnauthorizedException());
    }
  };
};
