import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorLogService } from '../services/error-log.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorLog = inject(ErrorLogService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.status === 0
          ? 'Could not reach PlexRag API. Please check that the backend is running.'
          : (typeof error.error?.message === 'string' ? error.error.message : error.message);
      // Skip logging failures of the error-log endpoint itself — would otherwise log forever.
      if (!req.url.includes('/api/errors')) {
        errorLog.log('API', `${req.method} ${req.url} → ${message}`);
      }
      return throwError(() => new Error(message));
    })
  );
};
