import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSession } from '../interfaces/user-session.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof UserSession | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserSession }>();
    const user = request.user;

    return data && user ? user[data] : user;
  },
);
