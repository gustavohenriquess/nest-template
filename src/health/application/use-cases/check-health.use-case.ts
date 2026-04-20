import { Injectable, Logger } from '@nestjs/common';
import * as os from 'node:os';
import { HealthCheck } from '../../domain/entities/health-check.entity';
import { formatDuration } from '@/core/utils/format-duration.helper';

@Injectable()
export class CheckHealthUseCase {
  private readonly logger = new Logger(CheckHealthUseCase.name);

  execute() {
    const memory = process.memoryUsage();
    const toMB = (bytes: number) =>
      Math.round((bytes / 1024 / 1024) * 100) / 100;

    const uptime = Math.round(process.uptime());

    const healthCheck = HealthCheck.create({
      status: 'ok',
      timestamp: new Date(),
      details: 'Service is running correctly',
      memoryUsage: {
        heapTotal: toMB(memory.heapTotal),
        heapUsed: toMB(memory.heapUsed),
        rss: toMB(memory.rss),
      },
      cpuLoad: os.loadavg(),
      uptime,
      uptimeHuman: formatDuration(uptime),
      nodeVersion: process.version,
    });
    this.logger.warn({ status: healthCheck.status }, 'status');
    return {
      healthCheck,
    };
  }
}
