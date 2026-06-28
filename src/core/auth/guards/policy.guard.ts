import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserSession } from '../interfaces/user-session.interface';

/**
 * PolicyGuard - Flexible Hybrid Authorization
 * -----------------------------------------
 * This guard implements an "OR" logic between Roles and Permissions.
 *
 * Logic:
 * - If user has ANY of the required Roles -> ALLOW.
 * - OR if user has ALL of the required Permissions -> ALLOW.
 *
 * This is useful for "Admin bypass" or "Flexible access" scenarios.
 * If you need strict "AND" logic (must have Role AND Permission),
 * use RolesGuard and PermissionsGuard separately via @UseGuards().
 */
@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no authorization is defined, let it pass
    if (
      (!requiredRoles || requiredRoles.length === 0) &&
      (!requiredPermissions || requiredPermissions.length === 0)
    ) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: UserSession }>();

    if (!user) {
      throw new ForbiddenException('User session not found');
    }

    // 1. Check Roles (OR check)
    const hasRequiredRole = requiredRoles?.some((role) =>
      user.roles?.includes(role),
    );
    if (hasRequiredRole) return true;

    // 2. Check Permissions (AND check for the permissions array)
    const hasAllPermissions = requiredPermissions?.every((permission) =>
      user.permissions?.includes(permission),
    );
    if (hasAllPermissions) return true;

    // If neither check passed
    throw new ForbiddenException(
      'Insufficient access: user does not have the required roles or permissions',
    );
  }
}
