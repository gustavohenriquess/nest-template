/* istanbul ignore file */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_META_KEY } from '../decorators/response-meta.decorator';
import {
  formatSuccessResponse,
  TransformResponse,
} from './transform-response.helper';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  TransformResponse<T>
> {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<T>> {
    if (context.getType() !== 'http') {
      return next.handle() as Observable<TransformResponse<T>>;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const customMeta = this.reflector.getAllAndOverride<
      Record<string, unknown>
    >(RESPONSE_META_KEY, [context.getHandler(), context.getClass()]);

    return next
      .handle()
      .pipe(
        map((data: T) =>
          formatSuccessResponse(data, request.url, request.query, customMeta),
        ),
      );
  }
}
