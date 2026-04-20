import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainError,
  EntityNotFoundError,
  BusinessRuleError,
  ConflictError,
  UnauthorizedError,
} from '../errors/domain.error';

interface RequestWithMeta extends Request {
  customMeta?: Record<string, unknown>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithMeta>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, unknown>;
        code =
          (responseObj.error as string) ||
          (responseObj.message as string) ||
          'HTTP_EXCEPTION';
        message = (responseObj.message as string) || exception.message;
        details = responseObj.details || null;
      } else {
        message = res;
        code = exception.name.replace('Exception', '').toUpperCase();
      }
    } else if (exception instanceof DomainError) {
      status = this.mapDomainErrorToStatus(exception);
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error for internal tracking (exclude common user errors from levels like 'error' if desired)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${message}`,
      );
    }

    const customMeta = request.customMeta ?? {};
    const filters = request.query ?? {};

    response.status(status).json({
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        filters,
        ...customMeta,
      },
      error: {
        code,
        message,
        details,
      },
    });
  }

  private mapDomainErrorToStatus(error: DomainError): number {
    if (error instanceof EntityNotFoundError) return HttpStatus.NOT_FOUND;
    if (error instanceof BusinessRuleError) return HttpStatus.BAD_REQUEST;
    if (error instanceof ConflictError) return HttpStatus.CONFLICT;
    if (error instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
    return HttpStatus.BAD_REQUEST;
  }
}
