import { getByPath } from './get-by-path.helper';

describe('getByPath', () => {
  const obj = {
    a: {
      b: {
        c: 'value',
      },
      d: null,
    },
    e: 0,
    f: false,
  };

  it('should return the object if path is empty', () => {
    expect(getByPath(obj, '')).toBe(obj);
  });

  it('should return a nested value', () => {
    expect(getByPath(obj, 'a.b.c')).toBe('value');
  });

  it('should return undefined for non-existent path without default', () => {
    expect(getByPath(obj, 'a.x.y')).toBeUndefined();
  });

  it('should return default value for non-existent path', () => {
    expect(getByPath(obj, 'a.x.y', 'default')).toBe('default');
  });

  it('should handle null in the path', () => {
    expect(getByPath(obj, 'a.d.x', 'default')).toBe('default');
  });

  it('should handle primitives that are not objects in the path', () => {
    expect(getByPath(obj, 'e.x', 'default')).toBe('default');
    expect(getByPath(obj, 'f.x', 'default')).toBe('default');
  });

  it('should return the default value if the leaf value is undefined', () => {
    const objWithUndefined = { a: { b: undefined } };
    expect(getByPath(objWithUndefined, 'a.b', 'default')).toBe('default');
  });

  it('should return false or 0 if they are the values (truthy check)', () => {
    expect(getByPath(obj, 'e')).toBe(0);
    expect(getByPath(obj, 'f')).toBe(false);
  });
});
