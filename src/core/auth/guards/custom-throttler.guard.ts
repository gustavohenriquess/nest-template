import { Injectable, Inject, ExecutionContext } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerRequest,
  ThrottlerStorage,
  ThrottlerLimitDetail,
  ThrottlerException,
} from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

interface RequestWithUser {
  user?: {
    sub: string;
    [key: string]: unknown;
  };
  ip: string;
  headers?: {
    authorization?: string;
    [key: string]: unknown;
  };
}

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

interface ResponseWithHeader {
  header?: (name: string, value: string) => void;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject('THROTTLER:MODULE_OPTIONS') options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super(options, storageService, reflector);
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const { res } = this.getRequestResponse(context) as unknown as {
      res: ResponseWithHeader;
    };

    if (res && typeof res.header === 'function') {
      const secondsRemaining = throttlerLimitDetail.timeToExpire;
      res.header('X-RateLimit-Remaining', '0');
      res.header('X-RateLimit-Reset', secondsRemaining.toString());
      res.header('Retry-After', secondsRemaining.toString());
    }

    await Promise.resolve();
    throw new ThrottlerException('Too Many Requests');
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, throttler } = requestProps;
    const { req } = this.getRequestResponse(context) as unknown as {
      req: RequestWithUser;
    };

    let user = req.user;

    // Manually parse JWT if req.user is not yet populated (due to guard execution order)
    if (!user && req.headers?.authorization?.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const payload = this.jwtService.verify(token) as unknown as JwtPayload;
        if (payload && typeof payload.sub === 'string') {
          const userPayload = { ...payload };
          req.user = userPayload;
          user = userPayload;
        }
      } catch {
        // Invalid or expired token
      }
    }

    // Skip global limit for authenticated users (they are regulated by 'authenticated' instead)
    if (throttler.name === 'global' && user) {
      return true;
    }

    // Skip authenticated limit for unauthenticated users
    if (throttler.name === 'authenticated') {
      if (!user) {
        return true;
      }
      // Track by user ID when authenticated
      const userSub = user.sub;
      requestProps.getTracker = () => `user:${userSub}`;
    } else {
      // For global and other throttlers, track by IP
      const reqIp = req.ip;
      requestProps.getTracker = () => reqIp;
    }

    return super.handleRequest(requestProps);
  }
}
