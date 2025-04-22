import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisService } from 'libs/common/src/redis/redis.service';
import { TracingService } from 'libs/common/src/tracing/tracing.service';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(helmet());
  app.enableCors();

  const tracingService = app.get(TracingService);
  await tracingService.onModuleInit();

  const redisService = app.get(RedisService);
  await redisService.registerService('auth', 'http://localhost:3000');

  await app.listen(3000);
}
bootstrap();
