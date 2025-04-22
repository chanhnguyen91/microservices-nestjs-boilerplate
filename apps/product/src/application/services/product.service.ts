import { Injectable } from '@nestjs/common';
import { ProductAggregate } from '../../domain/aggregates/product.aggregate';
import { ProductRepository } from '../../infrastructure/prisma/product.repository';
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(name: string, price: number, createdBy: number): Promise<ProductAggregate> {
    const product = this.eventPublisher.mergeObjectContext(
      ProductAggregate.create(name, price, createdBy),
    );
    await this.productRepository.save(product);
    product.commit();
    return product;
  }
}
