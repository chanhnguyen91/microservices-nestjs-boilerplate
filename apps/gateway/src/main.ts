import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisService } from 'libs/common/src/redis/redis.service';
import { TracingService } from 'libs/common/src/tracing/tracing.service';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(helmet());
  app.enableCors();

  const tracingService = app.get(TracingService);
  await tracingService.onModuleInit();

  const redisService = app.get(RedisService);
  await redisService.registerService('gateway', 'http://localhost:3002');

  await app.listen(3002);
}
bootstrap();
