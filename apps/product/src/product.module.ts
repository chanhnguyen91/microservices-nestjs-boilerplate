import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductController } from './interfaces/controllers/product.controller';
import { ProductCreationSaga } from './application/sagas/product-creation.saga';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { RabbitMQService } from '@libs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>('REDIS_URL'),
        }),
        ttl: configService.get<number>('SERVICE_CACHE_TTL_IN_SECOND'),
      }),
      inject: [ConfigService],
    }),
    CqrsModule,
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_MICROSERVICE',
        useFactory: (rabbitMQService: RabbitMQService) => rabbitMQService.createClient('productMicroserviceQueue'),
        inject: [RabbitMQService],
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [
    PrismaService,
    RabbitMQService,
    ProductCreationSaga,
  ],
})
export class ProductModule {}
