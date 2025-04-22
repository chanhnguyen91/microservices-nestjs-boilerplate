import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProductAggregate } from '../../domain/aggregates/product.aggregate';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: ProductAggregate): Promise<void> {
    await this.prisma.product.create({
      data: {
        name: product.getName(),
        price: product.getPrice(),
        createdBy: product.getCreatedBy(),
      },
    });
  }
}
