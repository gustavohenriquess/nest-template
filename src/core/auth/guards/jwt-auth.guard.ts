import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserSession } from '../interfaces/user-session.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private reflector: Reflector;

  constructor(reflector: Reflector) {
    super();
    this.reflector = reflector;
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Bypass Passport authentication
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = UserSession>(
    err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Authentication token is missing or invalid')
      );
    }
    return user as TUser;
  }
}
