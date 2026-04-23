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
