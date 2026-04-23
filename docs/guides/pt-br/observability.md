# Observabilidade e Telemetria

Este template adota uma abordagem Enterprise para Observabilidade, combinando Logs, Traces (Rastreamento) e Métricas em um ecossistema único e coeso. Utilizamos o padrão **OpenTelemetry (OTEL)** para evitar dependência de fornecedor (vendor lock-in) e garantir insights profundos sobre o comportamento da aplicação.

## Os 3 Pilares da Observabilidade

### 1. Logs Estruturados (Pino)
Substituímos o logger padrão do NestJS pelo **Pino**.
- **Por quê?** O Pino é extremamente rápido e gera logs no formato estruturado JSON em vez de texto plano.
- **Benefícios**: Logs em JSON são muito mais fáceis de analisar em ferramentas como Loki, Datadog ou Kibana.
- **Segurança**: Ele possui um redator automático de PII (Informações Pessoalmente Identificáveis). Se um desenvolvedor acidentalmente "logar" um objeto contendo um `password` ou `token`, o Pino irá mascará-lo (`"password": "[REDACTED]"`).

### 2. Rastreamento Distribuído (OpenTelemetry + Jaeger)
O Tracing nos permite ver todo o ciclo de vida de uma requisição enquanto ela viaja por controllers, services e banco de dados.
- O arquivo `src/tracing.ts` inicializa o **NodeSDK**.
- Ele rastreia automaticamente requisições HTTP (Express) e consultas ao banco (Prisma).
- **Correlation IDs (IDs de Correlação)**: Toda requisição recebe um ID único. Esse ID é injetado automaticamente nos Logs JSON. Se ocorrer um erro, você pode pegar esse ID no log e pesquisar no **Jaeger** para ver exatamente qual função falhou.

### 3. Métricas de Aplicação e Host (Prometheus + Grafana)
Em vez de depender do modelo Pull do Prometheus, nossa aplicação **Empurra (Push)** os dados para um OpenTelemetry Collector.
- O módulo `HostMetrics` coleta automaticamente o uso de CPU, Memória, Disco e Rede.
- O `HttpInstrumentation` conta as requisições e mede a latência (ex: `http_server_duration_milliseconds_count`).
- **Como Visualizar**: Abra o **Grafana** (porta padrão: `3090`), selecione a fonte de dados Prometheus e pesquise por `process_cpu_time_seconds_total{service_name="nest-template"}`.

## Infraestrutura Local
Quando você roda o `docker compose up`, a seguinte stack é iniciada para suportar a telemetria:
1. **OTEL Collector**: O receptor universal (Porta `4318` para HTTP). Processa traces/métricas e os redireciona.
2. **Jaeger**: A interface (UI) para visualizar Traces.
3. **Loki**: O banco de dados para agregar Logs JSON.
4. **Prometheus**: O banco de dados para agregar Métricas.
5. **Grafana**: O painel (Dashboard UI) que se conecta ao Loki e ao Prometheus.
