import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { RedisService } from 'libs/common/src/redis/redis.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { TracingService } from 'libs/common/src/tracing/tracing.service';
import { LoggingService } from 'libs/common/src/logging/logging.service';
import { MonitoringService } from 'libs/common/src/monitoring/monitoring.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    RedisService,
    CircuitBreakerService,
    TracingService,
    LoggingService,
    MonitoringService,
  ],
})
export class GatewayModule {}
