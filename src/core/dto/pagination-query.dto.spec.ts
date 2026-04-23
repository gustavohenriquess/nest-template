import {
  PaginationQuerySchema,
  PaginationQueryDto,
} from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('should instantiate the class correctly', () => {
    const dto = new PaginationQueryDto();
    expect(dto).toBeDefined();
  });

  describe('PaginationQuerySchema', () => {
    it('should validate with default values when empty', () => {
      const result = PaginationQuerySchema.parse({});
      expect(result).toEqual({
        page: 1,
        limit: 10,
        sortOrder: 'desc',
      });
    });

    it('should coerce string values to numbers', () => {
      const result = PaginationQuerySchema.parse({
        page: '5',
        limit: '50',
      });
      expect(result).toEqual({
        page: 5,
        limit: 50,
        sortOrder: 'desc',
      });
    });

    it('should fail if page is negative', () => {
      const result = PaginationQuerySchema.safeParse({
        page: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should fail if limit is over 100', () => {
      const result = PaginationQuerySchema.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
    });

    it('should validate sortBy and sortOrder correctly', () => {
      const result = PaginationQuerySchema.parse({
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });
      expect(result).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });
    });

    it('should fail if sortOrder is invalid', () => {
      const result = PaginationQuerySchema.safeParse({
        sortOrder: 'invalid_order',
      });
      expect(result.success).toBe(false);
    });
  });
});
