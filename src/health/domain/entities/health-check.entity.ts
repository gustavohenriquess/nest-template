import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export interface HealthCheckProps {
  status: 'ok' | 'error';
  timestamp: Date;
  details?: string;
  memoryUsage: {
    heapTotal: number;
    heapUsed: number;
    rss: number;
  };
  cpuLoad: number[];
  uptime: number;
  uptimeHuman: string;
  nodeVersion: string;
}

export class HealthCheck extends Entity<HealthCheckProps> {
  get status() {
    return this.props.status;
  }

  get timestamp() {
    return this.props.timestamp;
  }

  get details() {
    return this.props.details;
  }

  get memoryUsage() {
    return this.props.memoryUsage;
  }

  get cpuLoad() {
    return this.props.cpuLoad;
  }

  get uptime() {
    return this.props.uptime;
  }

  get uptimeHuman() {
    return this.props.uptimeHuman;
  }

  get nodeVersion() {
    return this.props.nodeVersion;
  }

  static create(props: HealthCheckProps, id?: UniqueEntityId) {
    const healthCheck = new HealthCheck(props, id);
    return healthCheck;
  }
}
