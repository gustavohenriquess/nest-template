import { ApiProperty } from '@nestjs/swagger';

export class MetaDto {
  @ApiProperty({ example: '2026-04-04T18:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/health' })
  path!: string;

  @ApiProperty({ example: {} })
  filters: any;

  @ApiProperty({ required: false, example: 1 })
  count?: number;

  [key: string]: any;
}

export class BaseResponseDto<T> {
  @ApiProperty()
  meta!: MetaDto;

  data!: T;
}

export class ErrorDetailDto {
  @ApiProperty({ example: 'BUSINESS_RULE_ERROR' })
  code!: string;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiProperty({ required: false, example: 'Resource already exists' })
  details?: any;
}

export class ErrorResponseDto {
  @ApiProperty()
  meta!: MetaDto;

  @ApiProperty()
  error!: ErrorDetailDto;
}
