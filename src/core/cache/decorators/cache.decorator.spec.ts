/* eslint-disable @typescript-eslint/unbound-method */
import { Cache, CACHE_METADATA_KEY, CacheMetadata } from './cache.decorator';

describe('Cache Decorator', () => {
  it('should set empty metadata when used without arguments', () => {
    class TestClass {
      @Cache()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      CACHE_METADATA_KEY,
      TestClass.prototype.testMethod,
    ) as CacheMetadata;
    expect(metadata).toEqual({});
  });

  it('should set key when used with a string argument', () => {
    class TestClass {
      @Cache('my-key')
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      CACHE_METADATA_KEY,
      TestClass.prototype.testMethod,
    ) as CacheMetadata;
    expect(metadata).toEqual({ key: 'my-key' });
  });

  it('should set ttl when used with a number argument', () => {
    class TestClass {
      @Cache(120)
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      CACHE_METADATA_KEY,
      TestClass.prototype.testMethod,
    ) as CacheMetadata;
    expect(metadata).toEqual({ ttl: 120 });
  });

  it('should set key and ttl when used with both arguments', () => {
    class TestClass {
      @Cache('my-key', 120)
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      CACHE_METADATA_KEY,
      TestClass.prototype.testMethod,
    ) as CacheMetadata;
    expect(metadata).toEqual({ key: 'my-key', ttl: 120 });
  });
});
