import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'authMicroserviceQueue',
      queueOptions: { durable: true },
      exchange: 'appEvents',
      exchangeType: 'topic',
    },
  });

  const configService = app.get(ConfigService);
  await app.listen();
  Logger.log(`Auth microservice is listening, NODE_ENV: ${configService.get<string>('NODE_ENV')}`, 'Bootstrap');
}

bootstrap();
