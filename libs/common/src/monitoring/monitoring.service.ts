import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';
import { trace } from '@opentelemetry/api';

@Injectable()
export class MonitoringService implements OnModuleInit {
  private httpRequestDuration: client.Histogram<string>;
  private httpRequestCounter: client.Counter<string>;
  private httpErrorCounter: client.Counter<string>;

  constructor() {
    client.collectDefaultMetrics({ prefix: 'nestjs_' });

    this.httpRequestDuration = new client.Histogram({
      name: 'nestjs_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status', 'trace_id'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
    });

    this.httpRequestCounter = new client.Counter({
      name: 'nestjs_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status', 'trace_id'],
    });

    this.httpErrorCounter = new client.Counter({
      name: 'nestjs_http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'path', 'status', 'trace_id'],
    });
  }

  async onModuleInit() {
    // Đảm bảo metrics được thu thập
  }

  observeRequest(method: string, path: string, status: number, duration: number) {
    const span = trace.getActiveSpan();
    const traceId = span ? span.spanContext().traceId : 'unknown';
    this.httpRequestDuration.labels(method, path, status.toString(), traceId).observe(duration / 1000);
    this.httpRequestCounter.labels(method, path, status.toString(), traceId).inc();
    if (status >= 400) {
      this.httpErrorCounter.labels(method, path, status.toString(), traceId).inc();
    }
  }
}
