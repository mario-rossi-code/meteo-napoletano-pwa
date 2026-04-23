/**
 * @fileoverview Route Guards e Resolvers
 * File: src/app/guards/pwa.guard.ts
 * 
 * @description Protezione route e precaricamento dati
 */

import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { WeatherService } from '../services/weather.service';

/**
 * @class PwaGuard
 * @description Guard per verificare supporto PWA
 * @implements {CanActivate}
 */
@Injectable({
  providedIn: 'root',
})
export class PwaGuard implements CanActivate {
  private geolocationService = inject(GeolocationService);
  private router = inject(Router);

  /**
   * @method canActivate
   * @description Verifica se PWA è supportata
   * @param {ActivatedRouteSnapshot} route - Route attivata
   * @param {RouterStateSnapshot} state - Stato router
   * @returns {boolean | Observable<boolean>} True se può attivare
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    if (this.geolocationService.isGeolocationAvailable()) {
      return true;
    }

    console.warn('PWA non completamente supportata');
    return true; // Allow anyway, fallback to default city
  }
}

/**
 * @class OnlineGuard
 * @description Guard per verificare connessione online
 * @implements {CanActivate}
 */
@Injectable({
  providedIn: 'root',
})
export class OnlineGuard implements CanActivate {
  private pwaService = inject(PwaService);

  /**
   * @method canActivate
   * @description Verifica stato online
   * @param {ActivatedRouteSnapshot} route - Route attivata
   * @param {RouterStateSnapshot} state - Stato router
   * @returns {Observable<boolean>} True se online
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.pwaService.getNetworkStatus().pipe(
      map((isOnline) => {
        if (!isOnline) {
          console.warn('Offline mode - using cached data');
        }
        return true; // Allow always, with or without connection
      })
    );
  }
}

/**
 * @class WeatherDataGuard
 * @description Guard che precarica dati meteo
 * @implements {CanActivate}
 */
@Injectable({
  providedIn: 'root',
})
export class WeatherDataGuard implements CanActivate {
  private weatherService = inject(WeatherService);

  /**
   * @method canActivate
   * @description Precarica dati meteo
   * @param {ActivatedRouteSnapshot} route - Route attivata
   * @param {RouterStateSnapshot} state - Stato router
   * @returns {Observable<boolean>} True se dati caricati
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Se dati già presenti, allow
    if (this.weatherService.weatherData$) {
      return of(true);
    }

    // Altrimenti, carica dati di default
    const city = route.queryParams['city'] || 'Napoli';
    return this.weatherService.searchWeatherByCity(city).pipe(
      map(() => true),
      catchError(() => {
        console.warn('Impossibile precaricare dati meteo');
        return of(true); // Allow anyway
      })
    );
  }
}

/**
 * @class RateLimitGuard
 * @description Guard per limitare richieste API
 * @implements {CanActivate}
 */
@Injectable({
  providedIn: 'root',
})
export class RateLimitGuard implements CanActivate {
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 secondo

  /**
   * @method canActivate
   * @description Verifica rate limit
   * @param {ActivatedRouteSnapshot} route - Route attivata
   * @param {RouterStateSnapshot} state - Stato router
   * @returns {boolean} True se dentro limite
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      console.warn('Rate limit exceeded');
      return false;
    }

    this.lastRequestTime = now;
    return true;
  }
}

/**
 * @function preloadWeatherData
 * @description Resolver per precaricamento dati meteo
 * @param {ActivatedRouteSnapshot} route - Route snapshot
 * @param {WeatherService} weatherService - Servizio meteo
 * @returns {Observable<WeatherData>} Dati meteo
 */
export function preloadWeatherData(
  route: ActivatedRouteSnapshot,
  weatherService: WeatherService
): Observable<any> {
  const city = route.queryParams['city'] || 'Napoli';
  return weatherService.searchWeatherByCity(city).pipe(
    catchError((error) => {
      console.error('Errore precaricamento meteo:', error);
      return of(null);
    })
  );
}

/**
 * @function canDeactivateWeatherComponent
 * @description Guard per unsaved changes (futura implementazione)
 * @param {any} component - Componente
 * @returns {boolean} True se può deattivare
 */
export function canDeactivateWeatherComponent(component: any): boolean {
  // Implementazione futura per verificare cambiamenti non salvati
  return true;
}

/**
 * @constant ROUTE_GUARDS
 * @description Configurazione guards per rotte
 * @type {Object}
 */
export const ROUTE_GUARDS = {
  canActivate: [PwaGuard, OnlineGuard],
  resolve: {
    weatherData: preloadWeatherData,
  },
};

/**
 * @class CacheInterceptor
 * @description Interceptor per caching HTTP
 */
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { GeolocationService } from '../services/geolocation.service';
import { PwaService } from '../services/pwa.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { data: HttpEvent<any>; time: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minuti

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Solo cache per GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    const cachedResponse = this.cache.get(request.url);
    const now = Date.now();

    // Verifica se cache è ancora valida
    if (
      cachedResponse &&
      now - cachedResponse.time < this.CACHE_DURATION
    ) {
      return of(cachedResponse.data);
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.cache.set(request.url, { data: event, time: now });
        }
        return event;
      })
    );
  }
}
