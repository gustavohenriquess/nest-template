import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_META_KEY } from '../decorators/response-meta.decorator';
import {
  formatSuccessResponse,
  TransformResponse,
} from './transform-response.helper';

interface RequestWithMeta extends Request {
  customMeta?: Record<string, unknown>;
}

/* istanbul ignore next */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  TransformResponse<T>
> {
  @Inject(Reflector)
  private readonly reflector!: Reflector;

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<T>> {
    if (context.getType() !== 'http') {
      return next.handle() as Observable<TransformResponse<T>>;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithMeta & { isCached?: boolean }>();
    const response =
      typeof http.getResponse === 'function'
        ? http.getResponse<Response>()
        : undefined;
    const customMeta = this.reflector.getAllAndOverride<
      Record<string, unknown>
    >(RESPONSE_META_KEY, [context.getHandler(), context.getClass()]);

    request.customMeta = customMeta;

    const statusCode = response?.statusCode ?? 200;

    return next.handle().pipe(
      map((data: T) => {
        const metaWithCache = {
          ...customMeta,
          cached: !!request.isCached,
        };
        request.customMeta = metaWithCache;
        return formatSuccessResponse(
          data,
          request.url,
          request.query,
          metaWithCache,
          statusCode,
        );
      }),
    );
  }
}
