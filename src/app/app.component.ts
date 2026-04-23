/**
 * @fileoverview Componente principale dell'applicazione
 * @author Meteo Napulitano PWA
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WeatherService } from './services/weather.service';
import { GeolocationService } from './services/geolocation.service';
import { PwaService } from './services/pwa.service';

import { WeatherCardComponent } from './components/weather-card/weather-card.component';
import { ForecastComponent } from './components/forecast/forecast.component';
import { HourlyForecastComponent } from './components/hourly-forecast/hourly-forecast.component';
import { LoadingComponent } from './components/loading/loading.component';
import { DEFAULT_CITY } from './constants/weather-constants';

/**
 * @component AppComponent
 * @description Componente radice dell'applicazione
 * @selector app-root
 * @standalone true
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WeatherCardComponent,
    ForecastComponent,
    HourlyForecastComponent,
    LoadingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  /** @private Subject per gestire unsubscribe */
  private destroy$ = new Subject<void>();

  /** @public Servizio meteo */
  public readonly weatherService = inject(WeatherService);
  /** @public Servizio geolocalizzazione */
  public readonly  geolocationService = inject(GeolocationService);
  /** @public Servizio PWA */
  public readonly  pwaService = inject(PwaService);

  /** @public Input città */
  cityInput = DEFAULT_CITY;

  /** @public Flag app online */
  isOnline = navigator.onLine;

  /** @public Flag aggiornamento disponibile */
  hasUpdate = false;

  // Esponi le proprietà necessarie per il template
  public get loading$() {
    return this.weatherService.loading$;
  }

  public get error$() {
    return this.weatherService.error$;
  }

  public get weatherData$() {
    return this.weatherService.weatherData$;
  }

  public get cityName$() {
    return this.weatherService.cityName$;
  }

  public getCurrentLoadingPhrase(): string {
    return this.weatherService.getCurrentLoadingPhrase();
  }

  public isAppInstallable(): boolean {
    return this.pwaService.isAppInstallable();
  }

  ngOnInit(): void {
    // Inizializza meteo dalla geolocalizzazione
    this.initializeWeather();

    // Monitora stato rete
    this.pwaService
      .getNetworkStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOnline) => {
        this.isOnline = isOnline;
        if (isOnline) {
          console.log('🟢 Connessione online');
        } else {
          console.log('🔴 Modalità offline');
        }
      });

    // Monitora aggiornamenti disponibili
    this.weatherService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.pwaService.updateAvailable$
      .pipe(takeUntil(this.destroy$))
      .subscribe((update) => {
        this.hasUpdate = update.available;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @method initializeWeather
   * @description Inizializza i dati meteo
   * @private
   */
  private initializeWeather(): void {
    if (this.geolocationService.isGeolocationAvailable()) {
      this.geolocationService
        .getCurrentLocation()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (coords) => {
            console.log('📍 Posizione ottenuta:', coords);
            this.weatherService
              .searchWeatherByCoordinates(coords.latitude, coords.longitude)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                error: () => {
                  // Fallback a città di default
                  this.searchWeather(DEFAULT_CITY);
                },
              });
          },
          () => {
            // Fallback a città di default se geolocalizzazione fallisce
            this.searchWeather(DEFAULT_CITY);
          }
        );
    } else {
      // Fallback se geolocalizzazione non disponibile
      this.searchWeather(DEFAULT_CITY);
    }
  }

  /**
   * @method searchWeather
   * @description Cerca meteo per città
   * @param {string} cityName - Nome della città
   */
  searchWeather(cityName?: string): void {
    const city = cityName || this.cityInput || DEFAULT_CITY;
    this.cityInput = city;

    this.weatherService
      .searchWeatherByCity(city)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('✅ Meteo aggiornato per:', city);
        },
        error: (error) => {
          console.error('❌ Errore ricerca:', error.message);
        },
      });
  }

  /**
   * @method onSearchSubmit
   * @description Gestisce submit della ricerca
   */
  onSearchSubmit(): void {
    this.searchWeather();
  }

  /**
   * @method onKeyPress
   * @description Gestisce pressione tasto
   * @param {KeyboardEvent} event - Evento tastiera
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchWeather();
    }
  }

  /**
   * @method installApp
   * @description Installa l'app come PWA
   */
  async installApp(): Promise<void> {
    const installed = await this.pwaService.installApp();
    if (installed) {
      console.log('✅ App installata con successo');
    }
  }

  /**
   * @method activateUpdate
   * @description Attiva aggiornamento disponibile
   */
  activateUpdate(): void {
    this.pwaService.activateUpdate();
  }
}
