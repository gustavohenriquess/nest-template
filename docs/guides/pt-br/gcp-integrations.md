# Integrações GCP

O NestJS Enterprise Template vem com adaptadores robustos e pré-configurados para serviços do Google Cloud Platform (GCP). Eles estão localizados em `src/core/infrastructure/gcp/`.

Nossa arquitetura realiza "mocks" (simulações) pesadas desses serviços durante os testes E2E (veja `test/utils/e2e-helper.ts`) para que você nunca faça requisições a endpoints reais do GCP durante builds de CI.

## 1. Pub/Sub (Mensageria)
O `PubSubService` lida com arquiteturas orientadas a eventos.

**Publicando uma Mensagem:**
```typescript
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';

constructor(private readonly pubsub: PubSubService) {}

async sendWelcomeEmail(userId: string) {
  const messageId = await this.pubsub.publishMessage('user-registered-topic', {
    userId,
    timestamp: new Date().toISOString()
  });
  console.log(`Mensagem enviada com ID: ${messageId}`);
}
```

**Ouvindo uma Inscrição (Subscription):**
Verifique o arquivo `src/health/application/listeners/pubsub-listener.example.ts` para um exemplo robusto de como conectar um listener usando o hook de ciclo de vida `OnModuleInit`, e desconectá-lo com segurança usando `OnModuleDestroy`.

## 2. BigQuery (Data Warehousing)
O `BigQueryService` permite que você envie dados de analytics com eficiência.

```typescript
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';

constructor(private readonly bq: BigQueryService) {}

async logUserAction(actionPayload: object) {
  await this.bq.insertRows('my_dataset', 'user_actions_table', [
    actionPayload
  ]);
}
```

## 3. Cloud Storage (Arquivos e Assets)
O `StorageService` fornece uma API limpa para interagir com buckets do GCS.

```typescript
import { StorageService } from '@/core/infrastructure/gcp/storage.service';

constructor(private readonly storage: StorageService) {}

async uploadProfilePicture(userId: string, buffer: Buffer) {
  await this.storage.uploadFile('my-app-assets', `profiles/${userId}.png`, buffer);
}
```

## Health Checks
Todos esses serviços possuem indicadores dedicados em `src/health/application/indicators/` que monitoram continuamente se a API possui credenciais válidas e conectividade com os projetos do GCP.
