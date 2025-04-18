import { UserCreatedEvent } from '../events/user-created.event';
import { Email } from '../value-objects/email.vo';
import { AggregateRoot } from '@nestjs/cqrs';

export class UserAggregate extends AggregateRoot {
  private id: number;
  private email: Email;
  private password: string;
  private roles: string[];

  constructor(id: number, email: Email, password: string, roles: string[]) {
    super();
    this.id = id;
    this.email = email;
    this.password = password;
    this.roles = roles;
  }

  static create(email: string, password: string, roles: string[]): UserAggregate {
    const emailVO = Email.create(email);
    const user = new UserAggregate(0, emailVO, password, roles);
    user.apply(new UserCreatedEvent(user.id, email, roles));
    return user;
  }

  getId(): number {
    return this.id;
  }

  getEmail(): string {
    return this.email.getValue();
  }

  getPassword(): string {
    return this.password;
  }

  getRoles(): string[] {
    return this.roles;
  }
}
