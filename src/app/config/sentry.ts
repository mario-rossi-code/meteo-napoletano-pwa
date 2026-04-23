/**
 * @fileoverview Sentry Error Tracking
 * File: src/app/config/sentry.ts
 * 
 * @description Setup Sentry per error tracking
 */

import { APP_SETTINGS } from "./app-settings";

export class SentryService {
  /**
   * @method initialize
   * @description Inizializza Sentry
   * @static
   * @param {string} dsn - Sentry DSN
   * @param {string} environment - Ambiente (dev, prod)
   * @param {string} release - Versione release
   */
  static initialize(
    dsn: string,
    environment: string = 'production',
    release: string = '1.0.0'
  ): void {
    if (!APP_SETTINGS.errorTrackingEnabled) return;

    // Carica Sentry
    const script = document.createElement('script');
    script.src = 'https://browser.sentry-cdn.com/7.0.0/bundle.min.js';
    script.onload = () => {
      if ((window as any).Sentry) {
        (window as any).Sentry.init({
          dsn: dsn,
          environment: environment,
          release: release,
          tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
          beforeSend(event: any, hint: any) {
            // Filtra errori sensibili
            if (event.exception) {
              const error = hint.originalException;
              if (error.message?.includes('auth')) {
                return null; // Non inviare errori auth
              }
            }
            return event;
          },
        });
      }
    };
    document.head.appendChild(script);
  }

  /**
   * @method captureException
   * @description Cattura eccezione
   * @static
   * @param {Error} error - Errore
   * @param {string} context - Contesto
   */
  static captureException(error: Error, context: string): void {
    if (!APP_SETTINGS.errorTrackingEnabled) return;

    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { context },
      });
    }
  }

  /**
   * @method setUserContext
   * @description Imposta contesto utente
   * @static
   * @param {any} userData - Dati utente
   */
  static setUserContext(userData: any): void {
    if ((window as any).Sentry) {
      (window as any).Sentry.setUser({
        id: userData.id || 'anonymous',
        location: userData.location,
        ip_address: userData.ip,
      });
    }
  }
}