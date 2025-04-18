import { ProductCreatedEvent } from '../events/product-created.event';
import { Price } from '../value-objects/price.vo';
import { AggregateRoot } from '@nestjs/cqrs';

export class ProductAggregate extends AggregateRoot {
  private id: number;
  private name: string;
  private price: Price;
  private createdBy: number;

  constructor(id: number, name: string, price: Price, createdBy: number) {
    super();
    this.id = id;
    this.name = name;
    this.price = price;
    this.createdBy = createdBy;
  }

  static create(name: string, price: number, createdBy: number): ProductAggregate {
    const priceVO = Price.create(price);
    const product = new ProductAggregate(0, name, priceVO, createdBy);
    product.apply(new ProductCreatedEvent(product.id, name, price, createdBy));
    return product;
  }

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getPrice(): number {
    return this.price.getValue();
  }

  getCreatedBy(): number {
    return this.createdBy;
  }
}
