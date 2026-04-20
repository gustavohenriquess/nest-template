import { Controller, Get } from '@nestjs/common';
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
import { HealthIntegrationsService } from '../../application/services/health-integrations.service';
import { ResponseMeta } from '@/core/decorators/response-meta.decorator';
import { ErrorResponseDto, BaseResponseDto } from '@/core/dto/api-response.dto';

@ApiTags('Health')
@ApiExtraModels(BaseResponseDto, ErrorResponseDto)
@Controller('health')
export class HealthController {
  private readonly health: HealthCheckService;
  private readonly memory: MemoryHealthIndicator;
  private readonly integrations: HealthIntegrationsService;

  constructor(
    health: HealthCheckService,
    memory: MemoryHealthIndicator,
    integrations: HealthIntegrationsService,
  ) {
    this.health = health;
    this.memory = memory;
    this.integrations = integrations;
  }

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
    return this.health.check(this.integrations.getIndicators());
  }
}
