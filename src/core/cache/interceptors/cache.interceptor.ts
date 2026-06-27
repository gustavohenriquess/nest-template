import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import {
  CACHE_METADATA_KEY,
  CacheMetadata,
} from '../decorators/cache.decorator';
import {
  INVALIDATE_CACHE_METADATA_KEY,
  InvalidateCacheMetadata,
} from '../decorators/invalidate-cache.decorator';

interface RequestWithCache extends Request {
  isCached?: boolean;
  query: Record<string, any>;
  params: Record<string, any>;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  /* istanbul ignore next */
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const isCacheEnabled =
      this.configService.get<boolean>('CACHE_ENABLED') ?? false;

    if (!isCacheEnabled) {
      return next.handle();
    }

    const handler = context.getHandler();
    const controller = context.getClass();

    const cacheMetadata = this.reflector.get<CacheMetadata | undefined>(
      CACHE_METADATA_KEY,
      handler,
    );

    const invalidateMetadata = this.reflector.get<
      InvalidateCacheMetadata | undefined
    >(INVALIDATE_CACHE_METADATA_KEY, handler);

    if (invalidateMetadata) {
      return next.handle().pipe(
        tap(() => {
          void (async () => {
            const namespace = invalidateMetadata.key || controller.name;
            await this.cacheService.incrementNamespaceVersion(namespace);
          })();
        }),
      );
    }

    if (cacheMetadata) {
      const namespace = cacheMetadata.key || controller.name;
      const version = await this.cacheService.getNamespaceVersion(namespace);
      const req = context.switchToHttp().getRequest<RequestWithCache>();
      const filters = JSON.stringify({ query: req.query, params: req.params });
      const key = `${namespace}:v${version}:${handler.name}:${filters}`;

      const defaultTtl =
        this.configService.get<number>('CACHE_DEFAULT_TTL') ?? 60;
      const ttl = cacheMetadata.ttl ?? defaultTtl;

      const cachedResponse = await this.cacheService.get(key);
      if (cachedResponse !== null) {
        req.isCached = true;
        return of(cachedResponse);
      }

      return next.handle().pipe(
        tap((response: unknown) => {
          void (async () => {
            await this.cacheService.set(key, response, ttl);
          })();
        }),
      );
    }

    return next.handle();
  }
}
