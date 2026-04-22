# GCP Integrations

The NestJS Enterprise Template comes with robust, pre-configured adapters for Google Cloud Platform (GCP) services. These are located in `src/core/infrastructure/gcp/`.

Our architecture heavily mocks these services during E2E tests (see `test/utils/e2e-helper.ts`) so you never hit real GCP endpoints during CI builds.

## 1. Pub/Sub (Messaging)
The `PubSubService` handles event-driven architectures.

**Publishing a Message:**
```typescript
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';

constructor(private readonly pubsub: PubSubService) {}

async sendWelcomeEmail(userId: string) {
  const messageId = await this.pubsub.publishMessage('user-registered-topic', {
    userId,
    timestamp: new Date().toISOString()
  });
  console.log(`Message sent with ID: ${messageId}`);
}
```

**Listening to a Subscription:**
Check `src/health/application/listeners/pubsub-listener.example.ts` for a robust example of how to attach a listener using the `OnModuleInit` lifecycle hook, and safely detach it using `OnModuleDestroy`.

## 2. BigQuery (Data Warehousing)
The `BigQueryService` enables you to push analytics data efficiently.

```typescript
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';

constructor(private readonly bq: BigQueryService) {}

async logUserAction(actionPayload: object) {
  await this.bq.insertRows('my_dataset', 'user_actions_table', [
    actionPayload
  ]);
}
```

## 3. Cloud Storage (Files & Assets)
The `StorageService` provides a clean API to interact with GCS buckets.

```typescript
import { StorageService } from '@/core/infrastructure/gcp/storage.service';

constructor(private readonly storage: StorageService) {}

async uploadProfilePicture(userId: string, buffer: Buffer) {
  await this.storage.uploadFile('my-app-assets', `profiles/${userId}.png`, buffer);
}
```

## Health Checks
All of these services have dedicated indicators in `src/health/application/indicators/` that continuously monitor if the API has valid credentials and connectivity to the GCP projects.
