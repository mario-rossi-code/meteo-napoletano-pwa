/**
 * @fileoverview Servizio meteorologico per gestire i dati meteo
 * @author Meteo Napulitano PWA
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

  /** @private Frase di caricamento casuale */
  private currentLoadingPhrase = LOADING_PHRASES[0];

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
   * @example
   * this.weatherService.searchWeatherByCity('Roma').subscribe(
   *   data => console.log('Meteo Roma:', data)
   * );
   */
  searchWeatherByCity(cityName: string): Observable<WeatherData> {
    if (!cityName.trim()) {
      this.loadingSubject.next(false); // Importante: reset loading anche in caso di errore
      return throwError(() => new Error('Nome città non valido'));
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.showRandomLoadingPhrase();

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
        this.loadingSubject.next(false); // Successo: disattiva loading
      }),
      catchError((error) => {
        const errorMsg = error.message || 'Errore nel recupero dei dati meteo';
        this.errorSubject.next(errorMsg);
        this.loadingSubject.next(false); // ERRORE: disattiva loading
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
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.showRandomLoadingPhrase();

    return this.reverseGeocode(latitude, longitude).pipe(
      switchMap((cityName) => {
        this.cityNameSubject.next(cityName);
        return this.fetchWeatherData(latitude, longitude);
      }),
      tap((data) => {
        this.weatherDataSubject.next(data);
        this.loadingSubject.next(false); // Successo: disattiva loading
      }),
      catchError((error) => {
        this.errorSubject.next(error.message || 'Errore geocoding inverso');
        this.loadingSubject.next(false); // ERRORE: disattiva loading
        return throwError(() => error);
      }),
      shareReplay(1),
    );
  }

  /**
   * @method geocodeCity
   * @description Geocodifica un nome città in coordinate
   * @private
   * @param {string} cityName - Nome della città
   * @returns {Observable<GeocodingResult>} Risultato geocodifica
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
   * @param {number} latitude - Latitudine
   * @param {number} longitude - Longitudine
   * @returns {Observable<string>} Nome del quartiere
   */
  private reverseGeocode(latitude: number, longitude: number): Observable<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=it&zoom=18`;
  
  return this.fetchDataWithOptions<any>(url, {
    headers: { 'User-Agent': 'MeteoNapulitanoApp/1.0' }
  }).pipe(
    switchMap((response) => {
      if (response?.display_name) {
        // Prendi la prima parte del display_name ed escludi i numeri civici
        let location = response.display_name.split(',')[0].trim();
        
        // Se la prima parte è una via con numero, prendi la seconda
        if (/\d/.test(location) && location.includes(' ')) {
          const parts = response.display_name.split(',');
          location = parts[1]?.trim() || parts[0].trim();
        }
        
        return of(location);
      }
      return of(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
    }),
    catchError(() => of(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`))
  );
}

  /**
   * @method isAdministrativeArea
   * @description Verifica se è un'area amministrativa (non un quartiere)
   * @private
   */
  private isAdministrativeArea(name: string): boolean {
    const adminTerms = [
      'Municipalità',
      'Municipality',
      'Distretto',
      'District',
      'Circoscrizione',
      'Comune',
    ];
    return adminTerms.some((term) => name.includes(term));
  }

  /**
   * @method isMunicipality
   * @description Verifica se un nome è una municipalità amministrativa
   * @private
   * @param {string} name - Nome da verificare
   * @returns {boolean} True se è una municipalità
   */
  private isMunicipality(name: string): boolean {
    const municipalityPatterns = [
      /municipalità/i,
      /municipality/i,
      /distretto/i,
      /district/i,
      /circoscrizione/i,
    ];

    return municipalityPatterns.some((pattern) => pattern.test(name));
  }

  /**
   * @method extractNeighborhoodFromDisplayName
   * @description Estrae il quartiere dal display_name di Nominatim
   * @private
   * @param {string} displayName - Display name completo
   * @returns {string|null} Nome del quartiere o null
   */
  private extractNeighborhoodFromDisplayName(displayName: string): string | null {
    if (!displayName) return null;

    // Il display_name è tipo: "San Pietro a Patierno, Municipalità 7, Napoli, Campania, Italia"
    // Prendiamo la prima parte prima della virgola
    const parts = displayName.split(',');

    if (parts.length > 0) {
      const firstPart = parts[0].trim();
      // Se la prima parte non è una municipalità, è probabilmente il quartiere
      if (!this.isMunicipality(firstPart)) {
        return firstPart;
      }

      // Altrimenti prova con la seconda parte
      if (parts.length > 1) {
        const secondPart = parts[1].trim();
        if (!this.isMunicipality(secondPart)) {
          return secondPart;
        }
      }
    }

    return null;
  }

  /**
   * @method fetchDataWithOptions
   * @description Fetch generico con opzioni
   * @private
   * @param {string} url - URL della richiesta
   * @param {RequestInit} options - Opzioni fetch
   * @returns {Observable<T>} Dati recuperati
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
   * @param {number} latitude - Latitudine
   * @param {number} longitude - Longitudine
   * @returns {Observable<WeatherData>} Dati meteorologici
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
   * @template T - Tipo di dati da recuperare
   * @param {string} url - URL della richiesta
   * @returns {Observable<T>} Dati recuperati
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
   * @param {number} code - WMO weather code
   * @returns {WeatherCondition} Condizione meteorologica
   */
  weatherCodeToCondition(code: number): WeatherCondition {
    return WMO_CODE_MAPPING[code] || WeatherCondition.DEFAULT;
  }

  /**
   * @method getRandomDescription
   * @description Ritorna descrizione napoletana casuale
   * @param {WeatherCondition} condition - Condizione meteorologica
   * @returns {string} Descrizione napoletana casuale
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
   * @param {WeatherCondition} condition - Condizione meteorologica
   * @returns {string} Descrizione italiana
   */
  getItalianDescription(condition: WeatherCondition): string {
    return WEATHER_DESCRIPTIONS_IT[condition] || '';
  }

  /**
   * @method showRandomLoadingPhrase
   * @description Mostra frase di caricamento casuale
   * @private
   */
  private showRandomLoadingPhrase(): void {
    const randomIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
    this.currentLoadingPhrase = LOADING_PHRASES[randomIndex];
  }

  /**
   * @method getCurrentLoadingPhrase
   * @description Ritorna la frase di caricamento corrente
   * @returns {string} Frase di caricamento
   */
  getCurrentLoadingPhrase(): string {
    return this.currentLoadingPhrase;
  }

  /**
   * @method saveToCache
   * @description Salva dati in cache locale
   * @private
   * @template T - Tipo di dati
   * @param {string} key - Chiave cache
   * @param {T} data - Dati da salvare
   * @param {number} ttl - Time to live in millisecondi
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
   * @template T - Tipo di dati
   * @param {string} key - Chiave cache
   * @returns {T | null} Dati recuperati o null
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
   * @param {string} key - Chiave cache
   * @returns {boolean} True se cache valida
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
   * @template T - Tipo di dati
   * @param {CacheData<T>} cacheData - Dati cache
   * @returns {boolean} True se scaduta
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
