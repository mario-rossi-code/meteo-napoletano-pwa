/**
 * @fileoverview Componente principale dell'applicazione
 * @author Meteo Napulitano PWA
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

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
  public readonly geolocationService = inject(GeolocationService);
  /** @public Servizio PWA */
  public readonly pwaService = inject(PwaService);

  /** @public Input città */
  cityInput = '';

  /** @public Flag app online */
  isOnline = navigator.onLine;

  /** @public Flag aggiornamento disponibile */
  hasUpdate = false;

  /** @private Flag per evitare chiamate multiple */
  private isInitialized = false;

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

  /**
   * @method getCurrentLoadingPhrase
   * @description Ritorna la frase di caricamento corrente
   * @returns {string} Frase di caricamento
   */
  public getCurrentLoadingPhrase(): string {
    return this.weatherService.getCurrentLoadingPhrase();
  }

  public isAppInstallable(): boolean {
    return this.pwaService.isAppInstallable();
  }

  ngOnInit(): void {
    // Monitora stato rete
    this.pwaService
      .getNetworkStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOnline) => {
        this.isOnline = isOnline;
        if (isOnline) {
          console.log('[NETWORK] Connessione online');
        } else {
          console.log('[NETWORK] Modalità offline');
        }
      });

    // Monitora aggiornamenti disponibili
    this.pwaService.updateAvailable$.pipe(takeUntil(this.destroy$)).subscribe((update) => {
      this.hasUpdate = update.available;
    });

    // Inizializza l'app
    this.initializeApp();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @method initializeApp
   * @description Inizializza l'app gestendo geolocalizzazione e fallback
   * @private
   */
  private initializeApp(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Attiva il loading
    this.weatherService.startLoading();

    // Controlla se c'è una città salvata in cache
    const lastCity = this.getLastSearchedCity();

    if (this.geolocationService.isGeolocationAvailable()) {
      // Chiede la posizione - il browser mostrerà il suo prompt nativo
      this.geolocationService
        .getCurrentLocation()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (coordinates) => {
            console.log('[GEOLOCALZATION] Posizione ottenuta:', coordinates);
            // Salva che l'utente ha accettato
            localStorage.setItem('geolocation_granted', 'true');
            this.weatherService
              .searchWeatherByCoordinates(coordinates.latitude, coordinates.longitude)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                error: () => {
                  // Fallback a ultima città o Napoli
                  this.fallbackToCity(lastCity);
                },
              });
          },
          error: (error) => {
            console.log(
              '[GEOLOCALZATION] Geolocalizzazione negata o non disponibile:',
              error.message,
            );
            // Salva che l'utente ha negato
            localStorage.setItem('geolocation_granted', 'false');
            // Fallback a ultima città o Napoli
            this.fallbackToCity(lastCity);
          },
        });
    } else {
      // Geolocalizzazione non supportata dal browser
      console.log('[GEOLOCALZATION] Geolocalizzazione non supportata dal browser');
      this.fallbackToCity(lastCity);
    }
  }

  /**
   * @method fallbackToCity
   * @description Fallback a ultima città o Napoli
   * @private
   * @param {string|null} lastCity - Ultima città cercata
   */
  private fallbackToCity(lastCity: string | null): void {
    const cityToSearch = lastCity || DEFAULT_CITY;
    console.log(`[GEOLOCALZATION] Fallback a città: ${cityToSearch}`);

    if (cityToSearch) {
      this.weatherService
        .searchWeatherByCity(cityToSearch)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error) => {
            console.error('❌ Errore fallback:', error);
            // Se anche il fallback fallisce, prova con Napoli
            if (cityToSearch !== DEFAULT_CITY) {
              this.weatherService
                .searchWeatherByCity(DEFAULT_CITY)
                .pipe(takeUntil(this.destroy$))
                .subscribe();
            }
          },
        });
    }
  }

  /**
   * @method getLastSearchedCity
   * @description Recupera l'ultima città cercata dalla cache
   * @private
   * @returns {string|null} Nome dell'ultima città o null
   */
  private getLastSearchedCity(): string | null {
    try {
      // Cerca nei dati cache del meteo
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weather_') && key !== 'weather_geo_') {
          // Rimuovi il prefisso 'weather_' per ottenere il nome città
          const city = key.replace('weather_', '');
          if (city && !city.startsWith('geo_')) {
            return city;
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('Errore lettura ultima città:', error);
      return null;
    }
  }

  /**
   * @method searchWeather
   * @description Cerca meteo per città
   * @param {string} cityName - Nome della città
   */
  searchWeather(cityName?: string): void {
    const city = cityName || this.cityInput;

    if (!city || !city.trim()) {
      return;
    }

    this.cityInput = city;

    this.weatherService
      .searchWeatherByCity(city)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('[WEATHER] Meteo aggiornato per:', city);
        },
        error: (error) => {
          console.error('[WEATHER] Errore ricerca:', error.message);
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
      console.log(' [PWA] App installata con successo');
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
