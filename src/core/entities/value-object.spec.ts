import { ValueObject } from './value-object';

interface StubProps {
  age: number;
}

class StubValueObject extends ValueObject<StubProps> {
  static create(props: StubProps) {
    return new StubValueObject(props);
  }
}

describe('ValueObject', () => {
  it('should be able to check equality', () => {
    const vo1 = StubValueObject.create({ age: 20 });
    const vo2 = StubValueObject.create({ age: 20 });
    const vo3 = StubValueObject.create({ age: 30 });

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
    expect(vo1.equals(null as any)).toBe(false);
    expect(vo1.equals(undefined as any)).toBe(false);
  });

  it('should handle undefined props in comparison', () => {
    const vo1 = StubValueObject.create({ age: 20 });
    const vo2 = { props: undefined };
    expect(vo1.equals(vo2 as any)).toBe(false);
  });
});
