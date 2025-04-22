import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '@libs/redis/redis.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { LoggingService } from 'libs/common/src/logging/logging.service';
import { lastValueFrom } from 'rxjs';
import * as client from 'prom-client';

@Injectable()
export class GatewayService {
  constructor(
    private httpService: HttpService,
    private redisService: RedisService,
    private circuitBreakerService: CircuitBreakerService,
    private loggingService: LoggingService,
  ) {}

  async proxyRequest(service: string, method: string, path: string, body: any, user: any) {
    const serviceUrl = await this.redisService.getServiceUrl(service);
    if (!serviceUrl) {
      this.loggingService.error('Service not found in Redis', { service });
      throw new HttpException('Service not found', 503);
    }

    const url = `${serviceUrl}/${path}`;
    const config = user ? { headers: { 'X-User': JSON.stringify(user) } } : {};

    return this.circuitBreakerService.execute(service, async () => {
      try {
        let response;
        switch (method.toUpperCase()) {
          case 'GET':
            response = await lastValueFrom(this.httpService.get(url, config));
            break;
          case 'POST':
            response = await lastValueFrom(this.httpService.post(url, body, config));
            break;
          case 'PUT':
            response = await lastValueFrom(this.httpService.put(url, body, config));
            break;
          case 'DELETE':
            response = await lastValueFrom(this.httpService.delete(url, config));
            break;
          default:
            throw new HttpException('Method not supported', 405);
        }
        this.loggingService.info('Request proxied successfully', { service, path, method });
        return response.data.data;
      } catch (error) {
        this.loggingService.error('Proxy request failed', { service, path, method, error: error.message });
        throw new HttpException(error.response?.data || 'Internal server error', error.response?.status || 500);
      }
    });
  }

  async getMetrics() {
    return await client.register.metrics();
  }
}
