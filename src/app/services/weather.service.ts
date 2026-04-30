/**
 * @fileoverview Servizio meteorologico per gestire i dati meteo
 * @author Meteo Napoletano PWA
 *
 * @description Servizio centrale che gestisce:
 * - Recupero dati meteo da API Open-Meteo
 * - Geocodifica città
 * - Cache locale
 * - Conversione WMO codes
 * - Frasi napoletane casuali
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of, timer } from 'rxjs';
import {
  catchError,
  tap,
  switchMap,
  shareReplay,
  startWith,
  retry,
  debounceTime,
} from 'rxjs/operators';
import {
  NEAPOLITAN_DESCRIPTIONS,
  WMO_CODE_MAPPING,
  LOADING_PHRASES,
  API_ENDPOINTS,
  CACHE_CONFIG,
  WEATHER_DESCRIPTIONS_IT,
  DEFAULT_CITY,
} from '../constants/weather-constants';
import { WeatherData, GeocodingResult, WeatherCondition, CacheData } from '../models/weather.model';

/**
 * @class WeatherService
 * @description Servizio per la gestione dei dati meteorologici
 */
@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  /** @private Soggetto per lo stato di caricamento */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  /** @public Osservabile dello stato di caricamento */
  loading$ = this.loadingSubject.asObservable();

  /** @private Soggetto per gli errori */
  private errorSubject = new BehaviorSubject<string | null>(null);
  /** @public Osservabile degli errori */
  error$ = this.errorSubject.asObservable();

  /** @private Soggetto per i dati meteo */
  private weatherDataSubject = new BehaviorSubject<WeatherData | null>(null);
  /** @public Osservabile dei dati meteo */
  weatherData$ = this.weatherDataSubject.asObservable();

  /** @private Soggetto per il nome città */
  private cityNameSubject = new BehaviorSubject<string>(DEFAULT_CITY);
  /** @public Osservabile del nome città */
  cityName$ = this.cityNameSubject.asObservable();

  /** @private Soggetto per la frase di caricamento */
  private loadingPhraseSubject = new BehaviorSubject<string>(LOADING_PHRASES[0]);
  /** @public Osservabile della frase di caricamento */
  loadingPhrase$ = this.loadingPhraseSubject.asObservable();

  constructor() {
    this.initializeCache();
  }

  /**
   * @method initializeCache
   * @description Inizializza il sistema di cache
   * @private
   */
  private initializeCache(): void {
    const isCacheValid = this.isCacheValid(CACHE_CONFIG.STORAGE_KEY_PREFIX + DEFAULT_CITY);
    if (isCacheValid) {
      const cachedData = this.getFromCache<WeatherData>(
        CACHE_CONFIG.STORAGE_KEY_PREFIX + DEFAULT_CITY,
      );
      if (cachedData) {
        this.weatherDataSubject.next(cachedData);
      }
    }
  }

  /**
   * @method searchWeatherByCity
   * @description Cerca il meteo per nome città
   * @param {string} cityName - Nome della città
   * @returns {Observable<WeatherData>} Dati meteorologici
   */
  searchWeatherByCity(cityName: string): Observable<WeatherData> {
    if (!cityName.trim()) {
      this.loadingSubject.next(false);
      return throwError(() => new Error('Nome città non valido'));
    }

    this.startLoading(); // Usa il metodo unificato
    this.errorSubject.next(null);

    return this.geocodeCity(cityName.trim()).pipe(
      switchMap((result) => {
        this.cityNameSubject.next(result.name);
        return this.fetchWeatherData(result.latitude, result.longitude);
      }),
      tap((data) => {
        this.weatherDataSubject.next(data);
        this.saveToCache(
          CACHE_CONFIG.STORAGE_KEY_PREFIX + cityName,
          data,
          CACHE_CONFIG.WEATHER_TTL,
        );
        // Disattiva loading
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        const errorMsg = error.message || 'Errore nel recupero dei dati meteo';
        this.errorSubject.next(errorMsg);
        // Disattiva loading
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      retry({ count: 1, delay: 1000 }),
      shareReplay(1),
    );
  }

  /**
   * @method searchWeatherByCoordinates
   * @description Cerca il meteo per coordinate geografiche
   * @param {number} latitude - Latitudine
   * @param {number} longitude - Longitudine
   * @returns {Observable<WeatherData>} Dati meteorologici
   */
  searchWeatherByCoordinates(latitude: number, longitude: number): Observable<WeatherData> {
    this.startLoading();
    this.errorSubject.next(null);

    return this.reverseGeocode(latitude, longitude).pipe(
      switchMap((cityName) => {
        this.cityNameSubject.next(cityName);
        return this.fetchWeatherData(latitude, longitude);
      }),
      tap((data) => {
        this.weatherDataSubject.next(data);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this.errorSubject.next(error.message || 'Errore geocoding inverso');
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      shareReplay(1),
    );
  }

  /**
   * @method startLoading
   * @description Attiva manualmente lo stato di loading con una frase casuale FISSA
   */
  startLoading(): void {
    // Genera UNA SOLA frase casuale all'inizio del caricamento
    const randomIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
    const fixedPhrase = LOADING_PHRASES[randomIndex];
    this.loadingPhraseSubject.next(fixedPhrase);
    this.loadingSubject.next(true);
  }

  /**
   * @method getCurrentLoadingPhrase
   * @description Ritorna la frase di caricamento corrente
   * @returns {string} Frase di caricamento
   */
  getCurrentLoadingPhrase(): string {
    return this.loadingPhraseSubject.value;
  }

  /**
   * @method geocodeCity
   * @description Geocodifica un nome città in coordinate
   * @private
   */
  private geocodeCity(cityName: string): Observable<GeocodingResult> {
    const cacheKey = CACHE_CONFIG.STORAGE_KEY_PREFIX + 'geo_' + cityName;
    const cached = this.getFromCache<GeocodingResult>(cacheKey);

    if (cached) {
      return of(cached);
    }

    const params = new URLSearchParams({
      name: cityName,
      count: '1',
      language: 'it',
      format: 'json',
    });

    return this.fetchData<any>(`${API_ENDPOINTS.GEOCODING}?${params.toString()}`).pipe(
      switchMap((response) => {
        if (!response.results || response.results.length === 0) {
          return throwError(() => new Error('Città non trovata'));
        }

        const result: GeocodingResult = response.results[0];
        this.saveToCache(cacheKey, result, CACHE_CONFIG.GEO_TTL);

        return of(result);
      }),
      catchError((error) => throwError(() => new Error(`Errore geocodifica: ${error.message}`))),
    );
  }

  /**
   * @method reverseGeocode
   * @description Geocodifica inversa per ottenere il quartiere
   * @private
   */
  private reverseGeocode(latitude: number, longitude: number): Observable<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=it&zoom=18`;

    return this.fetchDataWithOptions<any>(url, {
      headers: { 'User-Agent': 'MeteoNapulitanoApp/1.0' },
    }).pipe(
      switchMap((response) => {
        if (response?.display_name) {
          let location = response.display_name.split(',')[0].trim();

          if (/\d/.test(location) && location.includes(' ')) {
            const parts = response.display_name.split(',');
            location = parts[1]?.trim() || parts[0].trim();
          }

          return of(location);
        }
        return of(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      }),
      catchError(() => of(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)),
    );
  }

  /**
   * @method fetchDataWithOptions
   * @description Fetch generico con opzioni
   * @private
   */
  private fetchDataWithOptions<T>(url: string, options?: RequestInit): Observable<T> {
    return new Observable((observer) => {
      fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then((data: T) => {
          observer.next(data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  /**
   * @method fetchWeatherData
   * @description Recupera i dati meteorologici da Open-Meteo
   * @private
   */
  private fetchWeatherData(latitude: number, longitude: number): Observable<WeatherData> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,pressure_msl',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      hourly: 'temperature_2m,relative_humidity_2m,weather_code',
      timezone: 'auto',
    });

    return this.fetchData<WeatherData>(`${API_ENDPOINTS.OPEN_METEO}?${params.toString()}`).pipe(
      catchError((error) => throwError(() => new Error(`Errore API meteo: ${error.message}`))),
    );
  }

  /**
   * @method fetchData
   * @description Fetch generico con error handling
   * @private
   */
  private fetchData<T>(url: string): Observable<T> {
    return new Observable((observer) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then((data: T) => {
          observer.next(data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  /**
   * @method weatherCodeToCondition
   * @description Converte WMO code a condizione meteorologica
   */
  weatherCodeToCondition(code: number): WeatherCondition {
    return WMO_CODE_MAPPING[code] || WeatherCondition.DEFAULT;
  }

  /**
   * @method getRandomDescription
   * @description Ritorna descrizione napoletana casuale
   */
  getRandomDescription(condition: WeatherCondition): string {
    const descriptions =
      NEAPOLITAN_DESCRIPTIONS[condition] || NEAPOLITAN_DESCRIPTIONS[WeatherCondition.DEFAULT];
    const randomIndex = Math.floor(Math.random() * descriptions.length);
    return descriptions[randomIndex];
  }

  /**
   * @method getItalianDescription
   * @description Ritorna descrizione italiana ufficiale
   */
  getItalianDescription(condition: WeatherCondition): string {
    return WEATHER_DESCRIPTIONS_IT[condition] || '';
  }

  /**
   * @method saveToCache
   * @description Salva dati in cache locale
   * @private
   */
  private saveToCache<T>(key: string, data: T, ttl: number): void {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Errore salvataggio cache:', error);
    }
  }

  /**
   * @method getFromCache
   * @description Recupera dati da cache locale
   * @private
   */
  private getFromCache<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheData: CacheData<T> = JSON.parse(item);
      if (this.isCacheExpired(cacheData)) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Errore lettura cache:', error);
      return null;
    }
  }

  /**
   * @method isCacheValid
   * @description Verifica se cache è valida
   * @private
   */
  private isCacheValid(key: string): boolean {
    try {
      const item = localStorage.getItem(key);
      if (!item) return false;

      const cacheData: CacheData<any> = JSON.parse(item);
      return !this.isCacheExpired(cacheData);
    } catch {
      return false;
    }
  }

  /**
   * @method isCacheExpired
   * @description Verifica se cache è scaduta
   * @private
   */
  private isCacheExpired<T>(cacheData: CacheData<T>): boolean {
    return Date.now() - cacheData.timestamp > cacheData.ttl;
  }

  /**
   * @method clearCache
   * @description Pulisce tutta la cache
   */
  clearCache(): void {
    try {
      for (let key in localStorage) {
        if (key.startsWith(CACHE_CONFIG.STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Errore pulizia cache:', error);
    }
  }
}
