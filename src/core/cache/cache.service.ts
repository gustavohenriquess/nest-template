import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/* istanbul ignore next */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | undefined;
  private readonly isEnabled: boolean;

  /* istanbul ignore next */
  constructor(private configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('CACHE_ENABLED') ?? false;

    if (this.isEnabled) {
      const host = this.configService.get<string>('REDIS_HOST');
      const port = this.configService.get<number>('REDIS_PORT');
      const password = this.configService.get<string>('REDIS_PASSWORD');

      this.redisClient = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis connection error', err);
      });

      // Initially connect to fail fast or at least establish the connection
      this.redisClient.connect().catch((err) => {
        this.logger.error(
          'Failed to connect to Redis during initialization',
          err,
        );
      });
    } else {
      this.logger.warn('Cache is DISABLED. Redis will not be connected.');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redisClient) {
      return null;
    }

    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      this.logger.error(`Error getting key ${key} from Redis`, err);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, serialized);
      }
    } catch (err) {
      this.logger.error(`Error setting key ${key} in Redis`, err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      await this.redisClient.del(key);
    } catch (err) {
      this.logger.error(`Error deleting key ${key} from Redis`, err);
    }
  }

  async getNamespaceVersion(namespace: string): Promise<number> {
    if (!this.isEnabled || !this.redisClient) {
      return 0;
    }

    try {
      const versionStr = await this.redisClient.get(`version:${namespace}`);
      return versionStr ? parseInt(versionStr, 10) : 0;
    } catch (err) {
      this.logger.error(
        `Error getting version for namespace ${namespace}`,
        err,
      );
      return 0;
    }
  }

  async incrementNamespaceVersion(namespace: string): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      await this.redisClient.incr(`version:${namespace}`);
    } catch (err) {
      this.logger.error(
        `Error incrementing version for namespace ${namespace}`,
        err,
      );
    }
  }

  getClient(): Redis | undefined {
    return this.redisClient;
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }
}
