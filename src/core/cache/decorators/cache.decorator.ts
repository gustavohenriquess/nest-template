import { SetMetadata } from '@nestjs/common';

export const CACHE_METADATA_KEY = 'cache_module:cache';

export interface CacheMetadata {
  key?: string;
  ttl?: number;
}

export function Cache(): MethodDecorator;
export function Cache(key: string): MethodDecorator;
export function Cache(ttl: number): MethodDecorator;
export function Cache(key: string, ttl: number): MethodDecorator;
export function Cache(
  keyOrTtl?: string | number,
  ttl?: number,
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const metadata: CacheMetadata = {};

    if (typeof keyOrTtl === 'string') {
      metadata.key = keyOrTtl;
      if (typeof ttl === 'number') {
        metadata.ttl = ttl;
      }
    } else if (typeof keyOrTtl === 'number') {
      metadata.ttl = keyOrTtl;
    }

    SetMetadata(CACHE_METADATA_KEY, metadata)(target, propertyKey, descriptor);
  };
}
