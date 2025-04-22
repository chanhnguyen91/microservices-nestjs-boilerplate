import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from 'apps/auth/src/decorators/permissions.decorator';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { User } from 'libs/common/src/decorators/user.decorator';

@Controller('products')
@UseInterceptors(ResponseInterceptor)
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('create:products')
  @Post()
  createProduct(@Body() createProductDto: CreateProductDto, @User() user: any) {
    return this.productService.createProduct(createProductDto, user.userId);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('read:products')
  @Get()
  getProducts() {
    return this.productService.getProducts();
  }

  @UseGuards(PermissionsGuard)
  @Permissions('read:products')
  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productService.getProduct(+id);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('update:products')
  @Put(':id')
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @User() user: any) {
    return this.productService.updateProduct(+id, updateProductDto, user.userId);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('delete:products')
  @Delete(':id')
  deleteProduct(@Param('id') id: string, @User() user: any) {
    return this.productService.deleteProduct(+id, user.userId);
  }
}
