# O Módulo de Health

Este template integra a biblioteca `@nestjs/terminus` para fornecer checagens de saúde (health checks) avançadas de nível corporativo.

Os endpoints de saúde são expostos automaticamente através de `src/health/interface/controllers/health.controller.ts`.

## 1. Liveness Check (`/v1/health`)
Este é um endpoint leve projetado para "liveness probes" do Kubernetes ou Docker. Ele retorna quase instantaneamente sem verificar integrações externas.

**O que ele verifica:**
- Limites básicos de memória heap (limiar de 150MB).
- Uso básico de memória RSS (limiar de 150MB).

## 2. Readiness Check (`/v1/health/integrations`)
Este é um endpoint mais pesado projetado para "readiness probes" em Load Balancers. Ele ativamente "pinga" as integrações externas para garantir que a aplicação esteja verdadeiramente pronta para receber tráfego.

**O que ele verifica:**
- **Prisma Database**: Executa um `SELECT 1` contra o banco PostgreSQL.
- **BigQuery**: Verifica a existência de datasets e a conectividade.
- **Cloud Storage**: Verifica a acessibilidade do bucket.
- **Pub/Sub**: Verifica a conectividade com os tópicos GCP configurados.

## Criando Indicadores de Saúde Customizados

Se você adicionar uma nova integração externa (ex: Redis), você deve criar um indicador customizado.

1. Crie `redis.health.ts` em `src/health/application/indicators/`.
2. Estenda a classe `HealthIndicator`.
3. Adicione-o no construtor do `health-integrations.service.ts`.

```typescript
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

export class RedisHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isUp = await pingRedis();
    const result = this.getStatus(key, isUp);

    if (isUp) return result;
    throw new HealthCheckError('Redis failed', result);
  }
}
```
