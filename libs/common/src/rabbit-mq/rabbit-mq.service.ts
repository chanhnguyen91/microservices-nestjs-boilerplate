import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { connect, AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib'; // Import Channel từ amqplib

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;

  constructor() {
    this.connection = connect([process.env.RABBITMQ_URL]);
    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: Channel, cb: (error?: Error) => void) => {
        Promise.all([
          channel.assertQueue('authMicroserviceQueue', { durable: true }),
          channel.assertQueue('productMicroserviceQueue', { durable: true }),
        ])
          .then(() => cb()) // Gọi cb() khi hoàn thành
          .catch((error) => cb(error)); // Gọi cb(error) nếu có lỗi
      },
    });
  }

  async emit(queue: string, event: string, message: any) {
    await this.channel.sendToQueue(queue, { event, message });
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }
}