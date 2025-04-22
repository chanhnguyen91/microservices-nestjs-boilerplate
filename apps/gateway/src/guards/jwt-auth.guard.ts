import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard {
  constructor(private httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://auth:3000/auth/validate', { token }),
      );
      request.user = response.data.data;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
