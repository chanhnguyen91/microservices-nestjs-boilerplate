import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import { Observable, from } from 'rxjs';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async registerService(serviceName: string, url: string): Promise<void> {
    await this.client.hSet('services', serviceName, url);
  }

  async getServiceUrl(serviceName: string): Promise<string | null> {
    return this.client.hGet('services', serviceName);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  toPromise<T>(observable: Observable<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (value) => resolve(value),
        error: (err) => reject(err),
        complete: () => {},
      });
    });
  }
}
