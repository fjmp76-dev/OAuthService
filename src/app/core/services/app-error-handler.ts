import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorLogService } from './error-log.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly errorLog = inject(ErrorLogService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.errorLog.log('App', message);
    console.error(error);
  }
}
