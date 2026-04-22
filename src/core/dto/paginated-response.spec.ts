import { PaginatedResponseDto } from './paginated-response.dto';

describe('PaginatedResponseDto', () => {
  it('should calculate metadata correctly for the first page', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const response = PaginatedResponseDto.create(data, 15, 1, 10);

    expect(response.data).toEqual(data);
    expect(response.meta.total).toBe(15);
    expect(response.meta.page).toBe(1);
    expect(response.meta.limit).toBe(10);
    expect(response.meta.totalPages).toBe(2); // 15 / 10 = 1.5 -> Math.ceil -> 2
    expect(response.meta.hasNextPage).toBe(true);
    expect(response.meta.hasPreviousPage).toBe(false);
  });

  it('should calculate metadata correctly for the last page', () => {
    const data = [{ id: 11 }, { id: 12 }];
    const response = PaginatedResponseDto.create(data, 12, 2, 10);

    expect(response.meta.totalPages).toBe(2);
    expect(response.meta.hasNextPage).toBe(false);
    expect(response.meta.hasPreviousPage).toBe(true);
  });

  it('should handle empty data', () => {
    const response = PaginatedResponseDto.create([], 0, 1, 10);

    expect(response.meta.totalPages).toBe(0);
    expect(response.meta.hasNextPage).toBe(false);
    expect(response.meta.hasPreviousPage).toBe(false);
  });
});
