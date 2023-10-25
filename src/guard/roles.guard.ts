import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/types/enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const { user } = context.switchToHttp().getRequest();

      const userRoles = user.roles || [];

      const roles = this.reflector.get<UserRole[]>(
        'roles',
        context.getHandler(),
      );

      const hasRoles = userRoles.some((role: UserRole) => roles.includes(role));

      if (!hasRoles) {
        throw new ForbiddenException('You do not have access to this resource');
      }

      return hasRoles;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}
