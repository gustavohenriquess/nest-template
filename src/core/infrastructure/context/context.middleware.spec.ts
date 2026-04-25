import { Request, Response } from 'express';
import { ContextMiddleware } from './context.middleware';
import { RequestContext } from './request-context';

describe('ContextMiddleware', () => {
  let middleware: ContextMiddleware;

  beforeEach(() => {
    middleware = new ContextMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should initialize request context and call next', () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn();

    const runSpy = jest.spyOn(RequestContext, 'run');

    middleware.use(req, res, next);

    expect(runSpy).toHaveBeenCalledWith({}, expect.any(Function));
    expect(next).toHaveBeenCalled();

    runSpy.mockRestore();
  });
});
