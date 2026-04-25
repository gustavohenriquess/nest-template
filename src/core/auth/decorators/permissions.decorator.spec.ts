import { PERMISSIONS_KEY, Permissions } from './permissions.decorator';

describe('PermissionsDecorator', () => {
  it('should set the permissions metadata', () => {
    class Test {
      @Permissions('read', 'write')
      test(this: void) {
        return true;
      }
    }

    const metadata = Reflect.getMetadata(
      PERMISSIONS_KEY,
      Test.prototype.test,
    ) as string[];
    expect(metadata).toEqual(['read', 'write']);
  });
});
