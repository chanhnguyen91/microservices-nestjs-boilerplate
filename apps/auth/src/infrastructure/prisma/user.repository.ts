import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: UserAggregate): Promise<void> {
    await this.prisma.user.create({
      data: {
        email: user.getEmail(),
        password: user.getPassword(),
        roles: {
          connectOrCreate: user.getRoles().map(role => ({
            where: { name: role },
            create: { name: role },
          })),
        },
      },
    });
  }
}
