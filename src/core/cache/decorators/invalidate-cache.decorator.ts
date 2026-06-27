import { SetMetadata } from '@nestjs/common';

export const INVALIDATE_CACHE_METADATA_KEY = 'cache_module:invalidate_cache';

export interface InvalidateCacheMetadata {
  key?: string;
}

export function InvalidateCache(key?: string): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const metadata: InvalidateCacheMetadata = { key };
    SetMetadata(INVALIDATE_CACHE_METADATA_KEY, metadata)(
      target,
      propertyKey,
      descriptor,
    );
  };
}
