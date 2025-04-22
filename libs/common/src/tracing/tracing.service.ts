import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
@Injectable()
export class TracingService implements OnModuleInit {
  private sdk: NodeSDK;

  constructor() {
    const exporter = new OTLPTraceExporter({
      url: process.env.JAEGER_URL || 'http://localhost:14268/api/traces',
    });

    this.sdk = new NodeSDK({
      resource: new Resource({
        'service.name': process.env.SERVICE_NAME || 'nestjs-service',
      }),
      traceExporter: exporter,
      instrumentations: [getNodeAutoInstrumentations()],
      spanProcessor: new BatchSpanProcessor(exporter, {
        maxQueueSize: 1000,
        scheduledDelayMillis: 1000,
      }),
      sampler: new TraceIdRatioBasedSampler(0.1), // Sample 10% traces
    });
  }

  async onModuleInit() {
    await this.sdk.start();
  }
}