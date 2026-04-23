/**
 * @fileoverview HTTP Interceptor e Error Handler
 * File: src/app/http/error.interceptor.ts
 * 
 * @description Gestione centralizzata errori HTTP
 */

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { LoggerUtils } from '../utils/utils-helpers';

/**
 * @class ErrorInterceptor
 * @description Interceptor per gestione errori HTTP
 * @implements {HttpInterceptor}
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  /**
   * @constant TIMEOUT_MS
   * @description Timeout richieste HTTP (10 secondi)
   */
  private readonly TIMEOUT_MS = 10000;

  /**
   * @constant RETRY_ATTEMPTS
   * @description Numero tentativi retry
   */
  private readonly RETRY_ATTEMPTS = 1;

  /**
   * @method intercept
   * @description Intercetta richieste HTTP
   * @param {HttpRequest<any>} request - Richiesta HTTP
   * @param {HttpHandler} next - Handler successivo
   * @returns {Observable<HttpEvent<any>>} Evento HTTP
   */
  intercept(
  request: HttpRequest<any>,
  next: HttpHandler
): Observable<HttpEvent<any>> {
  LoggerUtils.log(`HTTP ${request.method} ${request.url}`);

  return next.handle(request).pipe(  // ← Aggiungi .handle(request)
    timeout(this.TIMEOUT_MS),
    retry({ count: this.RETRY_ATTEMPTS, delay: 1000 }),
    catchError((error: HttpErrorResponse) =>
      this.handleError(error, request)
    )
  );
}

  /**
   * @method handleError
   * @description Gestisce errori HTTP
   * @private
   * @param {HttpErrorResponse} error - Errore HTTP
   * @param {HttpRequest<any>} request - Richiesta originale
   * @returns {Observable<never>} Observable errore
   */
  private handleError(
    error: HttpErrorResponse,
    request: HttpRequest<any>
  ): Observable<never> {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      LoggerUtils.error(errorMessage);
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} ${error.statusText}`;
      LoggerUtils.error(errorMessage, error.error);

      // Gestione errori specifici
      switch (error.status) {
        case 0:
          errorMessage = 'Errore connessione. Verifica la tua connessione internet.';
          break;
        case 400:
          errorMessage = 'Richiesta non valida. Verifica i parametri.';
          break;
        case 401:
          errorMessage = 'Non autorizzato. Accesso negato.';
          break;
        case 403:
          errorMessage = 'Accesso proibito.';
          break;
        case 404:
          errorMessage = `Risorsa non trovata: ${request.url}`;
          break;
        case 429:
          errorMessage = 'Troppe richieste. Prova più tardi.';
          break;
        case 500:
          errorMessage = 'Errore server. Riprovare più tardi.';
          break;
        case 503:
          errorMessage = 'Servizio temporaneamente non disponibile.';
          break;
        default:
          errorMessage = `Errore ${error.status}: ${error.statusText}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

/**
 * @class AppError
 * @description Custom error class per applicazione
 */
export class AppError extends Error {
  /**
   * @constructor
   * @param {string} message - Messaggio errore
   * @param {string} code - Codice errore
   * @param {any} context - Contesto aggiuntivo
   */
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public context?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * @class ApiError
 * @description Errore API specifico
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
    public url: string
  ) {
    super(message, 'API_ERROR');
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * @class ValidationError
 * @description Errore validazione dati
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field: string
  ) {
    super(message, 'VALIDATION_ERROR');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * @class GeolocationError
 * @description Errore geolocalizzazione
 */
export class GeolocationError extends AppError {
  constructor(message: string) {
    super(message, 'GEOLOCATION_ERROR');
    Object.setPrototypeOf(this, GeolocationError.prototype);
  }
}

/**
 * @class CacheError
 * @description Errore cache
 */
export class CacheError extends AppError {
  constructor(message: string) {
    super(message, 'CACHE_ERROR');
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

/**
 * @class ErrorHandler
 * @description Centralizzato error handler
 */
export class ErrorHandler {
  /**
   * @method handleApiError
   * @description Gestisce errore API
   * @static
   * @param {HttpErrorResponse} error - Errore HTTP
   * @returns {ApiError} Error formattato
   */
  static handleApiError(error: HttpErrorResponse): ApiError {
    const message =
      error.error?.message || error.message || 'Errore API sconosciuto';
    return new ApiError(message, error.status, error.url || 'unknown');
  }

  /**
   * @method handleValidationError
   * @description Gestisce errore validazione
   * @static
   * @param {string} message - Messaggio
   * @param {string} field - Campo
   * @returns {ValidationError} Error formattato
   */
  static handleValidationError(message: string, field: string): ValidationError {
    return new ValidationError(message, field);
  }

  /**
   * @method formatErrorMessage
   * @description Formatta messaggio errore per UI
   * @static
   * @param {Error} error - Errore
   * @returns {string} Messaggio formattato
   */
  static formatErrorMessage(error: Error): string {
    if (error instanceof AppError) {
      return error.message;
    }

    if (error instanceof TypeError) {
      return 'Errore applicazione. Contatta support se persiste.';
    }

    return error.message || 'Si è verificato un errore sconosciuto.';
  }

  /**
   * @method logError
   * @description Registra errore con contesto
   * @static
   * @param {Error} error - Errore
   * @param {string} context - Contesto
   */
  static logError(error: Error, context: string): void {
    LoggerUtils.error(`${context}:`, error);

    if (error instanceof AppError) {
      LoggerUtils.error(`Code: ${error.code}`, error.context);
    }

    // In produzione, inviare a servizio error tracking (Sentry, etc)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { tags: { context } });
    }
  }
}
