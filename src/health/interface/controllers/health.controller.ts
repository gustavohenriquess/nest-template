import { Controller, Get, Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../../application/indicators/prisma.health';
import { PubSubHealthIndicator } from '../../application/indicators/pubsub.health';
import { BigQueryHealthIndicator } from '../../application/indicators/bigquery.health';
import { StorageHealthIndicator } from '../../application/indicators/storage.health';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { ResponseMeta } from '@/core/decorators/response-meta.decorator';
import { ErrorResponseDto, BaseResponseDto } from '@/core/dto/api-response.dto';

@ApiTags('Health')
@ApiExtraModels(BaseResponseDto, ErrorResponseDto)
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly pubsub: PubSubHealthIndicator,
    private readonly bigquery: BigQueryHealthIndicator,
    private readonly storage: StorageHealthIndicator,
    private readonly bigqueryService: BigQueryService,
    private readonly pubsubService: PubSubService,
    private readonly storageService: StorageService,
    @Inject(PrismaService) private readonly defaultPrisma: PrismaService,
    @Inject('PRIMARY_PRISMA') private readonly primaryPrisma: PrismaService,
    @Inject('SECONDARY_PRISMA') private readonly secondaryPrisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check basic system health' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'System is unhealthy',
    type: ErrorResponseDto,
  })
  @ResponseMeta({ module: 'health', severity: 'low' })
  handle() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  @Get('integrations')
  @HealthCheck()
  @ApiOperation({
    summary: 'Check health of all integrations (DB, GCP, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'All integrations are healthy',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'One or more integrations are unhealthy',
    type: ErrorResponseDto,
  })
  @ResponseMeta({ module: 'health', severity: 'high' })
  async handleIntegrations() {
    return this.health.check([
      () => this.prisma.isHealthy('database_default', this.defaultPrisma),
      () => this.prisma.isHealthy('database_primary', this.primaryPrisma),
      () => this.prisma.isHealthy('database_secondary', this.secondaryPrisma),
      () => this.pubsub.isHealthy('pubsub', this.pubsubService),
      () => this.bigquery.isHealthy('bigquery', this.bigqueryService),
      () => this.storage.isHealthy('storage', this.storageService),
    ]);
  }
}
