import { Injectable } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class CircuitBreakerService {
  private states: Map<string, { state: string; lastFailure: number; failureCount: number }> = new Map();
  private readonly FAILURE_THRESHOLD = 5;
  private readonly TIMEOUT = 30000; // 30 seconds

  constructor(private loggingService: LoggingService) {}

  async execute<T>(service: string, fn: () => Promise<T>): Promise<T> {
    const state = this.states.get(service) || { state: 'CLOSED', lastFailure: 0, failureCount: 0 };

    if (state.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - state.lastFailure;
      if (timeSinceLastFailure < this.TIMEOUT) {
        this.loggingService.error('Circuit breaker open', { service });
        throw new Error('Service unavailable');
      }
      state.state = 'HALF_OPEN';
      this.loggingService.info('Circuit breaker half-open', { service });
    }

    try {
      const result = await fn();
      if (state.state === 'HALF_OPEN') {
        state.state = 'CLOSED';
        state.failureCount = 0;
        this.loggingService.info('Circuit breaker closed', { service });
      }
      this.states.set(service, state);
      return result;
    } catch (error) {
      state.failureCount++;
      state.lastFailure = Date.now();

      if (state.failureCount >= this.FAILURE_THRESHOLD) {
        state.state = 'OPEN';
        this.loggingService.error('Circuit breaker tripped', { service, error: error.message });
      }
      this.states.set(service, state);
      throw error;
    }
  }
}
