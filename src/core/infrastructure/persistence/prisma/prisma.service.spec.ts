import { PrismaService } from './prisma.service';

// Mocking pg
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      end: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

// Mocking @prisma/adapter-pg
jest.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: jest.fn().mockImplementation(() => ({})),
  };
});

// Mocking @prisma/client using a class to preserve prototype chain
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      constructor() {}
      $connect = jest.fn();
      $disconnect = jest.fn();
    },
  };
});

describe('PrismaService', () => {
  let service: PrismaService;
  const dbUrl = 'postgresql://user:password@localhost:5432/db';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PrismaService(dbUrl);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connect', () => {
    it('should call $connect and log success', async () => {
      (
        service as unknown as { $connect: jest.Mock }
      ).$connect.mockResolvedValue(undefined);

      await service.connect();

      const connectSpy = (service as unknown as { $connect: jest.Mock })
        .$connect;
      expect(connectSpy).toHaveBeenCalled();
    });

    it('should throw and log error if $connect fails', async () => {
      const error = new Error('Connection failed');
      (
        service as unknown as { $connect: jest.Mock }
      ).$connect.mockRejectedValue(error);

      await expect(service.connect()).rejects.toThrow(error);
    });
  });

  describe('disconnect', () => {
    it('should call $disconnect, pool.end and log success', async () => {
      (
        service as unknown as { $disconnect: jest.Mock }
      ).$disconnect.mockResolvedValue(undefined);
      const poolEndSpy = (service as unknown as { pool: { end: jest.Mock } })
        .pool.end;

      await service.disconnect();

      const disconnectSpy = (service as unknown as { $disconnect: jest.Mock })
        .$disconnect;
      expect(disconnectSpy).toHaveBeenCalled();
      expect(poolEndSpy).toHaveBeenCalled();
    });

    it('should log error if disconnect fails', async () => {
      const error = new Error('Disconnect failed');
      (
        service as unknown as { $disconnect: jest.Mock }
      ).$disconnect.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(
        (service as unknown as { logger: { error: jest.Mock } }).logger,
        'error',
      );

      await service.disconnect();

      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call disconnect', async () => {
      const disconnectSpy = jest
        .spyOn(service, 'disconnect')
        .mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('maskUrl', () => {
    it('should mask the password in a valid URL', () => {
      const result = (
        service as unknown as { maskUrl: (url: string) => string }
      ).maskUrl(dbUrl);
      expect(result).toContain('user:****@localhost');
    });

    it('should return **** for an invalid URL', () => {
      const result = (
        service as unknown as { maskUrl: (url: string) => string }
      ).maskUrl('invalid-url');
      expect(result).toBe('****');
    });
  });
});
