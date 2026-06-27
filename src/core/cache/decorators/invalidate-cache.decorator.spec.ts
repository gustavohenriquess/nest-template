/* eslint-disable @typescript-eslint/unbound-method */
import {
  InvalidateCache,
  INVALIDATE_CACHE_METADATA_KEY,
  InvalidateCacheMetadata,
} from './invalidate-cache.decorator';

describe('InvalidateCache Decorator', () => {
  it('should set empty key when used without arguments', () => {
    class TestClass {
      @InvalidateCache()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      INVALIDATE_CACHE_METADATA_KEY,
      TestClass.prototype.testMethod,
    ) as InvalidateCacheMetadata;
    expect(metadata).toEqual({ key: undefined });
  });

  it('should set key when used with a string argument', () => {
    class TestClass {
      @InvalidateCache('my-key')
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      INVALIDATE_CACHE_METADATA_KEY,
      TestClass.prototype.testMethod,
    ) as InvalidateCacheMetadata;
    expect(metadata).toEqual({ key: 'my-key' });
  });
});
