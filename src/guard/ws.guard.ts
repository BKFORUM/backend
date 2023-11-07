import { AuthenticatedSocket, RequestUser } from '@common/types';
import { AuthService } from '@modules/auth';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context
        .switchToWs()
        .getClient<AuthenticatedSocket>();
      const authToken =
        client.handshake?.headers?.authorization.split(' ')[1] ||
        client.handshake?.headers?.authorization;

      const user = await this.authService.verifyToken(authToken);
      return Boolean(user);
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException();
    }
  }
}
