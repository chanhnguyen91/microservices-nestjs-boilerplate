import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCreatedEvent } from '../../domain/events/product-created.event';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class ProductCreationSaga {
  constructor(
    @Inject('PRODUCT_MICROSERVICE') private readonly rabbitMQClient: ClientProxy
  ) {}

  @Saga()
  productCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ProductCreatedEvent),
      map(event => {
        this.rabbitMQClient.emit({ pattern: 'product.created', routingKey: 'product.created' }, {
          productId: event.productId,
          name: event.name,
          price: event.price,
          createdBy: event.createdBy,
        });
        return null;
      })
    );
  };
}
