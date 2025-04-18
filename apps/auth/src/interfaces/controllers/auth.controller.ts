import { Controller, Post, Body } from '@nestjs/common';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';

@Controller('auth')
export class AuthController {
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const user = UserAggregate.create(body.email, body.password, ['USER']);
    return { message: 'User created', userId: user.getId() };
  }
}
