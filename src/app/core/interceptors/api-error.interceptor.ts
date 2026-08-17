import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        return throwError(
          () => new Error('Could not reach PlexRag API. Please check that the backend is running.')
        );
      }
      const message = typeof error.error?.message === 'string' ? error.error.message : error.message;
      return throwError(() => new Error(message));
    })
  );
};
