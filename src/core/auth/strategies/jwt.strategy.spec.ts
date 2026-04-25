import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { RequestContext } from '../../infrastructure/context/request-context';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
            get: jest.fn((key: string) => {
              if (key === 'AUTH_ROLES_CLAIM_PATH') return 'roles';
              if (key === 'AUTH_PERMISSIONS_CLAIM_PATH') return 'permissions';
              return null;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should throw UnauthorizedException if sub is missing', () => {
      const payload = { email: 'test@test.com' };
      expect(() => {
        strategy.validate(payload);
      }).toThrow(UnauthorizedException);
    });

    it('should return UserSession and populate RequestContext if payload is valid', () => {
      const payload = {
        sub: '123',
        email: 'test@test.com',
        roles: ['ADMIN'],
        permissions: ['read'],
      };

      RequestContext.run({}, () => {
        const result = strategy.validate(payload);

        expect(result).toEqual({
          sub: '123',
          email: 'test@test.com',
          roles: ['ADMIN'],
          permissions: ['read'],
        });

        // Verificamos se o RequestContext foi alimentado
        expect(RequestContext.user).toEqual(result);
      });
    });

    it('should return empty arrays if roles and permissions are missing', () => {
      const payload = { sub: '123', email: 'test@test.com' };
      RequestContext.run({}, () => {
        const result = strategy.validate(payload);
        expect(result.roles).toEqual([]);
        expect(result.permissions).toEqual([]);
      });
    });
  });
});
