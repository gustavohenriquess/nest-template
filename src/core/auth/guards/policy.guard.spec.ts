import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PolicyGuard } from './policy.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PolicyGuard', () => {
  let guard: PolicyGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PolicyGuard>(PolicyGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles or permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  describe('with user session', () => {
    const mockRequest = (user: unknown) =>
      ({
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      }) as unknown as ExecutionContext;

    it('should throw ForbiddenException if user is not in request', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const context = mockRequest(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access if user has required role (OR logic)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['ADMIN'];
        if (key === PERMISSIONS_KEY) return ['read:all'];
        return null;
      });

      const context = mockRequest({ roles: ['ADMIN'], permissions: [] });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access if user has required permissions (OR logic)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['ADMIN'];
        if (key === PERMISSIONS_KEY) return ['read:all'];
        return null;
      });

      const context = mockRequest({
        roles: ['USER'],
        permissions: ['read:all'],
      });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access if user has multiple required permissions (AND check for permissions array)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return ['read', 'write'];
        return null;
      });

      const context = mockRequest({
        roles: [],
        permissions: ['read', 'write'],
      });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if user has neither role nor all permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['ADMIN'];
        if (key === PERMISSIONS_KEY) return ['read:all'];
        return null;
      });

      const context = mockRequest({ roles: ['USER'], permissions: ['other'] });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
