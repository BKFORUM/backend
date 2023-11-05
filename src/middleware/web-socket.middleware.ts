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
        socket.handshake?.headers?.authorization.split(' ')[1] ||
        socket.handshake?.headers?.authorization;

      const user = await authService.verifyToken(authToken);
      if (user) {
        socket.user = {
          ...user,
          roles: user.roles.map(({ name }) => name),
        };
        next();
      } else {
        next(new UnauthorizedException());
      }
    } catch (error) {
      next(new UnauthorizedException());
    }
  };
};
