/* istanbul ignore file */
import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { CheckIntegrationsUseCase } from '../../application/use-cases/check-integrations.use-case';
import { ResponseMeta } from '@/core/decorators/response-meta.decorator';
import { ErrorResponseDto, BaseResponseDto } from '@/core/dto/api-response.dto';

@ApiTags('Health')
@ApiExtraModels(BaseResponseDto, ErrorResponseDto)
@Controller('health')
export class HealthController {
  constructor(
    private readonly checkHealth: CheckHealthUseCase,
    private readonly checkIntegrations: CheckIntegrationsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check basic system health' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'System is unhealthy',
    type: ErrorResponseDto,
  })
  @ResponseMeta({ module: 'health', severity: 'low' })
  handle() {
    const { healthCheck } = this.checkHealth.execute();

    return {
      status: healthCheck.status,
      timestamp: healthCheck.timestamp,
      details: healthCheck.details,
      memoryUsage: healthCheck.memoryUsage,
      cpuLoad: healthCheck.cpuLoad,
      uptime: healthCheck.uptime,
      uptimeHuman: healthCheck.uptimeHuman,
      nodeVersion: healthCheck.nodeVersion,
    };
  }

  @Get('integrations')
  @ApiOperation({ summary: 'Check health of all integrations (DB, GCP, etc.)' })
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
    return this.checkIntegrations.execute();
  }
}
