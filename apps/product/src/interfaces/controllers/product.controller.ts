import { Controller, Post, Body } from '@nestjs/common';
import { ProductAggregate } from '../../domain/aggregates/product.aggregate';

@Controller('products')
export class ProductController {
  @Post()
  async create(@Body() body: { name: string; price: number; createdBy: number }) {
    const product = ProductAggregate.create(body.name, body.price, body.createdBy);
    return { message: 'Product created', productId: product.getId() };
  }
}
