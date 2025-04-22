import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import { RabbitMQService } from 'libs/common/src/rabbit-mq/rabbit-mq.service';
import { RedisService } from 'libs/common/src/redis/redis.service';
import { TracingService } from 'libs/common/src/tracing/tracing.service';
import { LoggingService } from 'libs/common/src/logging/logging.service';
import { MonitoringService } from 'libs/common/src/monitoring/monitoring.service';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    RabbitMQService,
    RedisService,
    TracingService,
    LoggingService,
    MonitoringService,
    PermissionsGuard,
  ],
})
export class AuthModule {}
