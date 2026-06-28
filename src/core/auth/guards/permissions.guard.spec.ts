import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { UserSession } from '../interfaces/user-session.interface';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: Record<string, any>;

    beforeEach(() => {
      mockRequest = {};

      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;
    });

    it('should return true if no permissions are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true if requiredPermissions array is empty', () => {
      reflector.getAllAndOverride.mockReturnValue([]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user session is not found', () => {
      reflector.getAllAndOverride.mockReturnValue(['read:data']);
      mockRequest.user = undefined;

      expect(() => guard.canActivate(mockContext)).toThrow(
        new ForbiddenException('User permissions not found'),
      );
    });

    it('should throw ForbiddenException if user permissions array is not found', () => {
      reflector.getAllAndOverride.mockReturnValue(['read:data']);
      mockRequest.user = { sub: 'user-123' } as UserSession;

      expect(() => guard.canActivate(mockContext)).toThrow(
        new ForbiddenException('User permissions not found'),
      );
    });

    it('should throw ForbiddenException if user does not have all required permissions', () => {
      reflector.getAllAndOverride.mockReturnValue(['read:data', 'write:data']);
      mockRequest.user = {
        sub: 'user-123',
        permissions: ['read:data'],
      };

      expect(() => guard.canActivate(mockContext)).toThrow(
        new ForbiddenException(
          'Insufficient permissions/scopes to access this resource',
        ),
      );
    });

    it('should return true if user has all required permissions', () => {
      reflector.getAllAndOverride.mockReturnValue(['read:data', 'write:data']);
      mockRequest.user = {
        sub: 'user-123',
        permissions: ['read:data', 'write:data', 'delete:data'],
      };

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});
