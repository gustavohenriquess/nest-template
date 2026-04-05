import { LoggingMiddleware } from './logging.middleware';
import { Request, Response } from 'express';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log request information on finish', () => {
    const req = {
      method: 'GET',
      originalUrl: '/test',
    } as Request;

    const res = {
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          callback();
        }
      }),
      statusCode: 200,
    } as unknown as Response;

    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    const resMock = res as unknown as { on: jest.Mock };
    expect(resMock.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });
});
