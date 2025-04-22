import { Injectable } from '@nestjs/common';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserRepository } from '../../infrastructure/prisma/user.repository';
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async register(email: string, password: string): Promise<UserAggregate> {
    const user = this.eventPublisher.mergeObjectContext(
      UserAggregate.create(email, password, ['USER']),
    );
    await this.userRepository.save(user);
    user.commit();
    return user;
  }
}
