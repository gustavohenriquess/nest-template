import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export interface HealthCheckProps {
    status: 'ok' | 'error';
    timestamp: Date;
    details?: string;
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

    static create(props: HealthCheckProps, id?: UniqueEntityId) {
        const healthCheck = new HealthCheck(props, id);
        return healthCheck;
    }
}
