import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProductModule } from './product.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'amqplib';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProductModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'productMicroserviceQueue',
      queueOptions: { durable: true },
    },
  });

  const configService = app.get(ConfigService);

  // Tạo exchange nếu chưa tồn tại
  const rabbitMQUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@localhost:5672';
  const connection = await require('amqplib').connect(rabbitMQUrl);
  const channel = await connection.createChannel();
  await channel.assertExchange('appEvents', 'topic', { durable: true });
  await channel.assertQueue('productMicroserviceQueue', { durable: true });
  await channel.bindQueue('productMicroserviceQueue', 'appEvents', 'product.created');
  await channel.close();
  await connection.close();

  await app.listen();
  Logger.log(`Product microservice is listening, NODE_ENV: ${configService.get<string>('NODE_ENV')}`, 'Bootstrap');
}

bootstrap();
