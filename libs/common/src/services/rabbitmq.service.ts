import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(private configService: ConfigService) {}

  createClient(queue: string): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@localhost:5672'],
        queue,
        queueOptions: { durable: true },
        exchange: 'appEvents',
        exchangeType: 'topic',
      },
    });
  }
}
