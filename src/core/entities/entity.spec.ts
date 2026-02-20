import { Entity } from './entity';
import { UniqueEntityId } from './unique-entity-id';

interface StubProps {
    name: string;
}

class StubEntity extends Entity<StubProps> {
    static create(props: StubProps, id?: UniqueEntityId) {
        return new StubEntity(props, id);
    }
}

describe('Entity', () => {
    it('should be able to create an entity', () => {
        const entity = StubEntity.create({ name: 'test' });
        expect(entity.id).toBeInstanceOf(UniqueEntityId);
    });

    it('should be able to check equality', () => {
        const id = new UniqueEntityId();
        const entity1 = StubEntity.create({ name: 'test' }, id);
        const entity2 = StubEntity.create({ name: 'other' }, id);
        const entity3 = StubEntity.create({ name: 'test' });

        expect(entity1.equals(entity2)).toBe(true);
        expect(entity1.equals(entity1)).toBe(true);
        expect(entity1.equals(entity3)).toBe(false);
    });
});
