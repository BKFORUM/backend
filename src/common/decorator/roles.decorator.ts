import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { UserRole } from '../types/enum';
import { AccessTokenGuard } from 'src/guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { ApiBearerAuth, ApiForbiddenResponse } from '@nestjs/swagger';

export function Roles(...roles: UserRole[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AccessTokenGuard, RolesGuard),
    ApiBearerAuth(),
    ApiForbiddenResponse({ description: 'Forbidden' }),
  );
}
