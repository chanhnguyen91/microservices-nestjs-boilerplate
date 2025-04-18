import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class UserCreationSaga {
  constructor(
    @Inject('AUTH_MICROSERVICE') private readonly rabbitMQClient: ClientProxy
  ) {}

  @Saga()
  userCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      map(event => {
        this.rabbitMQClient.emit({ pattern: 'user.created', routingKey: 'user.created' }, {
          userId: event.userId,
          email: event.email,
          roles: event.roles,
        });
        return null;
      })
    );
  };
}
