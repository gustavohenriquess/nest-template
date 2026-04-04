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
import { 
  formatSuccessResponse, 
  TransformResponse 
} from './transform-response.helper';

/* istanbul ignore next */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<T>> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const customMeta = this.reflector.getAllAndOverride<Record<string, any>>(
      RESPONSE_META_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => formatSuccessResponse(
        data, 
        request.url, 
        request.query, 
        customMeta
      )),
    );
  }
}
