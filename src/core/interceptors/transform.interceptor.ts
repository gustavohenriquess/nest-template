import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_META_KEY } from '../decorators/response-meta.decorator';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, any> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;
    const filters = request.query;

    const customMeta = this.reflector.getAllAndOverride<Record<string, any>>(
      RESPONSE_META_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => ({
        meta: {
          timestamp: new Date().toISOString(),
          path,
          filters,
          ...customMeta,
          ...(Array.isArray(data) ? { count: data.length } : {}),
        },
        data,
      })),
    );
  }
}
