import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserCreationSaga } from './application/sagas/user-creation.saga';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { RabbitMQService } from '@libs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
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
        name: 'AUTH_MICROSERVICE',
        useFactory: (rabbitMQService: RabbitMQService) => rabbitMQService.createClient('authMicroserviceQueue'),
        inject: [RabbitMQService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    RabbitMQService,
    UserCreationSaga,
  ],
})
export class AuthModule {}
