import { UniqueEntityId } from './unique-entity-id';

describe('UniqueEntityId', () => {
    it('should create a new ID if none is provided', () => {
        const id = new UniqueEntityId();
        expect(id.toValue()).toBeDefined();
        expect(typeof id.toValue()).toBe('string');
    });

    it('should use the provided ID', () => {
        const idValue = 'custom-id';
        const id = new UniqueEntityId(idValue);
        expect(id.toValue()).toBe(idValue);
        expect(id.toString()).toBe(idValue);
    });

    it('should be able to check equality', () => {
        const id1 = new UniqueEntityId('id-1');
        const id2 = new UniqueEntityId('id-1');
        const id3 = new UniqueEntityId('id-2');

        expect(id1.equals(id2)).toBe(true);
        expect(id1.equals(id3)).toBe(false);
    });
});
