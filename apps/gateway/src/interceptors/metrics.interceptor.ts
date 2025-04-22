import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MonitoringService } from 'libs/common/src/monitoring/monitoring.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - start;
        this.monitoringService.observeRequest(
          request.method,
          request.url,
          response.statusCode,
          duration,
        );
      }),
    );
  }
}
