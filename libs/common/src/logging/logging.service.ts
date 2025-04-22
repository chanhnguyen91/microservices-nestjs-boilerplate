import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as LogstashTransport from 'winston-logstash';
import { trace } from '@opentelemetry/api';

@Injectable()
export class LoggingService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          const span = trace.getActiveSpan();
          if (span) {
            info.traceId = span.spanContext().traceId;
            info.spanId = span.spanContext().spanId;
          }
          return info;
        })(),
      ),
      transports: [
        new winston.transports.Console(),
        new LogstashTransport({
          host: process.env.LOGSTASH_HOST || 'localhost',
          port: parseInt(process.env.LOGSTASH_PORT, 10) || 5044,
        }),
      ],
    });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }
}
