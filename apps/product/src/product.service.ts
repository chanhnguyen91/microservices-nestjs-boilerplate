import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import { RabbitMQService } from 'libs/common/src/rabbit-mq/rabbit-mq.service';
import { LoggingService } from 'libs/common/src/logging/logging.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { from, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private rabbitMQService: RabbitMQService,
    private loggingService: LoggingService,
  ) {}

  createProduct(createProductDto: CreateProductDto, userId: number): Observable<any> {
    return from(
      this.prisma.products.create({
        data: createProductDto,
      }),
    ).pipe(
      mergeMap((product) => {
        this.rabbitMQService.emit('productMicroserviceQueue', 'product.created', { productId: product.id, userId });
        this.loggingService.info('Product created', { productId: product.id, userId });
        return from([product]);
      }),
    );
  }

  getProducts(): Observable<any> {
    return from(this.prisma.products.findMany());
  }

  getProduct(id: number): Observable<any> {
    return from(this.prisma.products.findUnique({ where: { id } })).pipe(
      map((product) => {
        if (!product) {
          this.loggingService.error('Product not found', { productId: id });
          throw new NotFoundException('Product not found');
        }
        return product;
      }),
    );
  }

  updateProduct(id: number, updateProductDto: UpdateProductDto, userId: number): Observable<any> {
    return from(this.prisma.products.findUnique({ where: { id } })).pipe(
      mergeMap((product) => {
        if (!product) {
          this.loggingService.error('Product not found', { productId: id });
          throw new NotFoundException('Product not found');
        }
        return from(
          this.prisma.products.update({
            where: { id },
            data: updateProductDto,
          }),
        );
      }),
      mergeMap((updatedProduct) => {
        this.rabbitMQService.emit('productMicroserviceQueue', 'product.updated', { productId: updatedProduct.id, userId });
        this.loggingService.info('Product updated', { productId: updatedProduct.id, userId });
        return from([updatedProduct]);
      }),
    );
  }

  deleteProduct(id: number, userId: number): Observable<any> {
    return from(this.prisma.products.findUnique({ where: { id } })).pipe(
      mergeMap((product) => {
        if (!product) {
          this.loggingService.error('Product not found', { productId: id });
          throw new NotFoundException('Product not found');
        }
        return from(this.prisma.products.delete({ where: { id } }));
      }),
      mergeMap((deletedProduct) => {
        this.rabbitMQService.emit('productMicroserviceQueue', 'product.deleted', { productId: id, userId });
        this.loggingService.info('Product deleted', { productId: id, userId });
        return from([{ message: 'Product deleted' }]);
      }),
    );
  }
}
