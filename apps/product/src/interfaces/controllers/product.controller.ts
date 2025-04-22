import { Controller, Post, Body } from '@nestjs/common';
import { ProductService } from '../../application/services/product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() body: { name: string; price: number; createdBy: number }) {
    const product = await this.productService.create(body.name, body.price, body.createdBy);
    return { message: 'Product created', productId: product.getId() };
  }
}
