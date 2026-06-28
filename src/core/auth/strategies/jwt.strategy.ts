import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserSession } from '../interfaces/user-session.interface';
import { getByPath } from '../../utils/get-by-path.helper';
import { RequestContext } from '../../infrastructure/context/request-context';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
    this.configService = configService;
  }

  // This method is called after the JWT signature is successfully verified.
  validate(payload: Record<string, any>): UserSession {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const rolesPath = this.configService.get<string>('AUTH_ROLES_CLAIM_PATH')!;
    const permissionsPath = this.configService.get<string>(
      'AUTH_PERMISSIONS_CLAIM_PATH',
    )!;

    const roles = getByPath(payload, rolesPath, []) as string[];
    const permissions = getByPath(payload, permissionsPath, []) as string[];

    const user: UserSession = {
      sub: payload.sub as string,
      email: payload.email as string,
      roles: Array.isArray(roles) ? roles : [roles].filter(Boolean),
      permissions: Array.isArray(permissions)
        ? permissions
        : [permissions].filter(Boolean),
    };

    // Populamos o contexto global da requisição
    RequestContext.user = user;

    return user;
  }
}
