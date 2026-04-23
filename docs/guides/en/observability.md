# Observability & Telemetry

This template takes an Enterprise approach to Observability by combining Logs, Traces, and Metrics into a single, cohesive ecosystem. We use the **OpenTelemetry (OTEL)** standard to avoid vendor lock-in and ensure deep insights into application behavior.

## The 3 Pillars of Observability

### 1. Structured Logging (Pino)
We replaced the default NestJS logger with **Pino**. 
- **Why?** Pino is extremely fast and outputs logs in structured JSON format instead of plain text.
- **Benefits**: JSON logs are much easier to parse in tools like Loki, Datadog, or Kibana.
- **Security**: It features an automatic PII redactor. If a developer accidentally logs an object containing a `password` or `token`, Pino will mask it (`"password": "[REDACTED]"`).

### 2. Distributed Tracing (OpenTelemetry + Jaeger)
Tracing allows us to see the entire lifecycle of a request as it travels through controllers, services, and databases.
- The `src/tracing.ts` file initializes the **NodeSDK**.
- It automatically tracks HTTP requests (Express) and Database queries (Prisma).
- **Correlation IDs**: Every incoming request gets a unique trace ID. This ID is automatically injected into the JSON Logs. If an error occurs, you can take the ID from the log and search for it in **Jaeger** to see the exact execution path that failed.

### 3. Application & Host Metrics (Prometheus + Grafana)
Instead of relying on the Prometheus Pull-model, our application **Pushes** data to an OpenTelemetry Collector.
- The `HostMetrics` module automatically collects CPU, Memory, Disk, and Network usage.
- The `HttpInstrumentation` counts requests and tracks latency (e.g., `http_server_duration_milliseconds_count`).
- **How to View**: Open **Grafana** (default port: `3090`), select the Prometheus data source, and query `process_cpu_time_seconds_total{service_name="nest-template"}`.

## Local Infrastructure
When you run `docker compose up`, the following stack is booted up to support telemetry:
1. **OTEL Collector**: The universal receiver (Port `4318` for HTTP). It processes traces/metrics and redirects them.
2. **Jaeger**: The UI for visualizing Traces.
3. **Loki**: The database for aggregating JSON Logs.
4. **Prometheus**: The database for aggregating Metrics.
5. **Grafana**: The universal dashboard UI that connects to Loki and Prometheus.
