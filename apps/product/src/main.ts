import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisService } from 'libs/common/src/redis/redis.service';
import { TracingService } from 'libs/common/src/tracing/tracing.service';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(helmet());
  app.enableCors();

  const tracingService = app.get(TracingService);
  await tracingService.onModuleInit();

  const redisService = app.get(RedisService);
  await redisService.registerService('product', 'http://localhost:3001');

  await app.listen(3001);
}
bootstrap();
