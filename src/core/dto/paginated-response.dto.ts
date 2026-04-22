import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Total number of items across all pages' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({ description: 'Indicates if there is a next page' })
  hasNextPage!: boolean;

  @ApiProperty({ description: 'Indicates if there is a previous page' })
  hasPreviousPage!: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'The array of data items', isArray: true })
  data!: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMeta })
  meta!: PaginationMeta;

  /**
   * Helper factory to create a paginated response and automatically calculate
   * totalPages, hasNextPage, and hasPreviousPage.
   */
  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
