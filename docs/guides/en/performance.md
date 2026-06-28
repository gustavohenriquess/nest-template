# Performance & Optimization

This template includes several pre-configured optimizations to ensure your application can handle enterprise-scale traffic out of the box.

## Response Compression (Gzip & Brotli)

To drastically reduce the bandwidth consumed by your API and speed up response times for the client, we have implemented the `compression` middleware natively in the application bootstrap (`src/main.ts`).

### How it Works

When a client (like a web browser or a mobile app) sends an HTTP request, it typically includes an `Accept-Encoding` header (e.g., `Accept-Encoding: gzip, deflate, br`). 

If the response payload is larger than `1KB`, our NestJS middleware intercepts it and compresses the JSON data before sending it over the network. This is especially impactful for:
- Large paginated lists (e.g., fetching 100 users).
- Bulky analytical data or reports.
- GraphQL query responses.

You don't need to manually invoke compression in your controllers; it is handled entirely behind the scenes by the global pipeline.

---

## Rate Limiting

To shield the application from brute-force attacks, DDoS attempts, and API abuse, we implement a dual-limit Rate Limiting strategy using a globally registered `CustomThrottlerGuard` backed by `@nestjs/throttler` (registered in `src/app.module.ts`).

### ⚙️ Throttling Configurations (Environment Variables)

Add the following settings to your `.env` to customize the request rate limits:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `THROTTLE_TTL` | `number` | `60000` | The sliding window size in milliseconds (e.g., 60 seconds). |
| `THROTTLE_LIMIT` | `number` | `10` | Maximum number of allowed requests for anonymous (unauthenticated) clients within the TTL. |
| `THROTTLE_LIMIT_AUTHENTICATED` | `number` | `500` | Maximum number of allowed requests for authenticated clients within the TTL. |

### 🚀 Dual-Limit Strategy

The `CustomThrottlerGuard` dynamically detects the authentication status of the incoming request:

1. **Anonymous / Public Client Limit (`global`)**
   - Applies when the request does not include a valid JWT token.
   - **Limit**: Defined by `THROTTLE_LIMIT` (default: 10 requests / min).
   - **Tracking**: Tracked by the client's IP address.

2. **Authenticated Client Limit (`authenticated`)**
   - Applies when the request includes a valid `Bearer` JWT token.
   - **Limit**: Defined by `THROTTLE_LIMIT_AUTHENTICATED` (default: 500 requests / min).
   - **Tracking**: Tracked by the user's unique identity claim (`sub` field from the JWT). The guard overrides the tracker to `user:${sub}` to ensure limits are applied per-user rather than per-IP (protecting users sharing an IP or NAT).
   - **JWT Pre-parsing**: If the NestJS request's `user` payload is not yet populated (due to guard execution ordering), the guard manually extracts and decodes the JWT bearer token from the `Authorization` header to determine authentication status.

### 🛑 Throttling Response & HTTP Headers

When a request exceeds its limit, the application responds with a `429 Too Many Requests` status code and injects standard rate limiting metadata headers into the HTTP response:

* `X-RateLimit-Remaining: 0` — Indicates no requests are remaining in the current window.
* `X-RateLimit-Reset: <seconds>` — Time remaining in seconds until the block expires and the window resets.
* `Retry-After: <seconds>` — Standard HTTP header specifying the delay in seconds the client must wait before making another request.
