/**
 * @fileoverview Configurazioni Avanzate PWA
 * File: src/app/config/app-settings.ts
 * 
 * @description Impostazioni globali applicazione
 */

/**
 * @interface AppSettings
 * @description Impostazioni applicazione
 */
export interface AppSettings {
  appName: string;
  appVersion: string;
  apiBaseUrl: string;
  apiTimeout: number;
  cacheEnabled: boolean;
  analyticsEnabled: boolean;
  errorTrackingEnabled: boolean;
  offlineModeEnabled: boolean;
  geolocationEnabled: boolean;
  notificationsEnabled: boolean;
  debugMode: boolean;
}

/**
 * @constant APP_SETTINGS
 * @description Configurazione applicazione
 * @type {AppSettings}
 */
export const APP_SETTINGS: AppSettings = {
  appName: 'Meteo Napoletano',
  appVersion: '1.0.0',
  apiBaseUrl: 'https://api.open-meteo.com/v1',
  apiTimeout: 10000,
  cacheEnabled: true,
  analyticsEnabled: true,
  errorTrackingEnabled: true,
  offlineModeEnabled: true,
  geolocationEnabled: true,
  notificationsEnabled: true,
  debugMode: false, // Disabilita in produzione
};