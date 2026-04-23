import { Roles, ROLES_KEY } from './roles.decorator';

describe('RolesDecorator', () => {
  it('should assign roles metadata to a class or method', () => {
    class TestClass {
      @Roles('ADMIN', 'USER')
      testMethod() {}
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestClass.prototype['testMethod'],
    ) as string[];
    expect(roles).toEqual(['ADMIN', 'USER']);
  });
});
