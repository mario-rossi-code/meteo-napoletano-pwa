/**
 * @fileoverview Google Analytics Configuration
 * File: src/app/config/analytics.ts
 * 
 * @description Setup Google Analytics
 */

import { APP_SETTINGS } from "./app-settings";

export class AnalyticsService {
  /**
   * @method initialize
   * @description Inizializza Google Analytics
   * @static
   * @param {string} measurementId - GA4 measurement ID
   */
  static initialize(measurementId: string): void {
    if (!APP_SETTINGS.analyticsEnabled) return;

    // Carica GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Setup window.dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', measurementId);
  }

  /**
   * @method trackEvent
   * @description Traccia evento
   * @static
   * @param {string} eventName - Nome evento
   * @param {any} parameters - Parametri evento
   */
  static trackEvent(eventName: string, parameters: any = {}): void {
    if (!APP_SETTINGS.analyticsEnabled) return;

    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  }

  /**
   * @method trackPageView
   * @description Traccia visualizzazione pagina
   * @static
   * @param {string} pageTitle - Titolo pagina
   * @param {string} pagePath - Percorso pagina
   */
  static trackPageView(pageTitle: string, pagePath: string): void {
    this.trackEvent('page_view', {
      page_title: pageTitle,
      page_path: pagePath,
    });
  }

  /**
   * @method trackWeatherSearch
   * @description Traccia ricerca meteo
   * @static
   * @param {string} city - Città cercata
   */
  static trackWeatherSearch(city: string): void {
    this.trackEvent('weather_search', {
      city: city,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * @method trackInstallPrompt
   * @description Traccia prompt installazione
   * @static
   * @param {string} status - 'shown' o 'installed'
   */
  static trackInstallPrompt(status: string): void {
    this.trackEvent('install_prompt', {
      status: status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * @method trackError
   * @description Traccia errore
   * @static
   * @param {string} errorName - Nome errore
   * @param {string} errorMessage - Messaggio errore
   */
  static trackError(errorName: string, errorMessage: string): void {
    this.trackEvent('exception', {
      description: `${errorName}: ${errorMessage}`,
      fatal: false,
    });
  }
}