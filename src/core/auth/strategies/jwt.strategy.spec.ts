import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

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
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });

    it('should return UserSession if payload is valid', () => {
      const payload = { sub: '123', email: 'test@test.com', roles: ['ADMIN'] };
      const result = strategy.validate(payload);
      expect(result).toEqual({
        sub: '123',
        email: 'test@test.com',
        roles: ['ADMIN'],
      });
    });

    it('should return empty roles array if roles are missing', () => {
      const payload = { sub: '123', email: 'test@test.com' };
      const result = strategy.validate(payload);
      expect(result.roles).toEqual([]);
    });
  });
});
