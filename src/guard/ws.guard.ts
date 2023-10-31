import { WebSocket } from '@common/types';
import { AuthService } from '@modules/auth';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: WebSocket = context.switchToWs().getClient<WebSocket>();
      const authToken =
        client.handshake?.headers?.authorization.split(' ')[1] ||
        client.handshake?.headers?.authorization;

      const user = await this.authService.verifyToken(authToken);
      client.user = user;

      return Boolean(user);
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}
