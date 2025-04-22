import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import { RabbitMQService } from 'libs/common/src/rabbit-mq/rabbit-mq.service';
import { LoggingService } from 'libs/common/src/logging/logging.service';
import { TracingService } from 'libs/common/src/tracing/tracing.service';
import { MonitoringService } from 'libs/common/src/monitoring/monitoring.service';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    PrismaService,
    RabbitMQService,
    LoggingService,
    TracingService,
    MonitoringService,
    PermissionsGuard,
  ],
})
export class ProductModule {}
