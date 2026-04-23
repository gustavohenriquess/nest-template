import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

type DecoratorFactory = (data: unknown, ctx: ExecutionContext) => any;

function getParamDecoratorFactory(
  decorator: (...args: any[]) => any,
): DecoratorFactory {
  class Test {
    public test(@decorator() _value: any): any {
      return _value;
    }
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test') as Record<
    string,
    { factory: DecoratorFactory }
  >;
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUserDecorator', () => {
  let factory: DecoratorFactory;

  beforeEach(() => {
    factory = getParamDecoratorFactory(CurrentUser);
  });

  it('should extract the entire user object if no data key is provided', () => {
    const mockUser = { sub: '123', email: 'test@test.com', roles: ['ADMIN'] };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = factory(undefined, mockContext) as typeof mockUser;
    expect(result).toEqual(mockUser);
  });

  it('should extract a specific field if data key is provided', () => {
    const mockUser = { sub: '123', email: 'test@test.com', roles: ['ADMIN'] };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = factory('email', mockContext) as string;
    expect(result).toBe('test@test.com');
  });

  it('should return undefined if user is not present', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const result = factory('sub', mockContext) as string | undefined;
    expect(result).toBeUndefined();
  });
});
