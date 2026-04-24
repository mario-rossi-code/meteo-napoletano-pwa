/**
 * @fileoverview Componente card meteo corrente
 * File: src/app/components/weather-card/weather-card.component.ts
 */

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData, WeatherCondition } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';
import {
  WEATHER_ICONS,
  CURIOSITIES,
  NIGHT_HOUR_START,
  NIGHT_HOUR_END,
} from '../../constants/weather-constants';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherCardComponent implements OnInit, OnChanges {
  @Input() weatherData: WeatherData | null = null;
  @Input() cityName: string | null = null;

  protected weatherService = inject(WeatherService);
  protected WEATHER_ICONS = WEATHER_ICONS;
  protected CURIOSITIES = CURIOSITIES;

  // Proprietà memorizzate per evitare ricalcoli casuali
  protected weatherIcon: string = '';
  protected description: string = '';
  protected curiosity: string = '';
  protected temperature: number = 0;
  protected humidity: number = 0;
  protected windSpeed: number = 0;
  protected pressure: number = 0;
  protected currentDate: string = '';

  ngOnInit(): void {
    this.updateWeatherProperties();
    this.updateDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weatherData']) {
      this.updateWeatherProperties();
    }
  }

  /**
   * Aggiorna tutte le proprietà del meteo quando i dati cambiano
   */
  private updateWeatherProperties(): void {
    if (!this.weatherData) {
      this.resetProperties();
      return;
    }

    const code = this.weatherData.current.weather_code;
    const condition = this.weatherService.weatherCodeToCondition(code);

    // Calcola descrizione (una volta sola)
    this.description = this.weatherService.getRandomDescription(condition);

    // Calcola curiosità basata sulla descrizione
    this.curiosity = this.CURIOSITIES[this.description] || 'Che tiempo che sta facendo!';

    // Calcola icona meteo
    this.weatherIcon = this.calculateWeatherIcon();

    // Calcola valori numerici
    this.temperature = Math.round(this.weatherData.current.temperature_2m || 0);
    this.humidity = this.weatherData.current.relative_humidity_2m || 0;
    this.windSpeed = Math.round(this.weatherData.current.wind_speed_10m || 0);
    this.pressure = this.weatherData.current.pressure_msl || 0;
  }

  /**
   * Aggiorna la data corrente
   */
  private updateDate(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Calcola l'icona meteo in base all'ora del giorno
   */
  private calculateWeatherIcon(): string {
    if (!this.weatherData) return WEATHER_ICONS.default;

    const code = this.weatherData.current.weather_code;
    const condition = this.weatherService.weatherCodeToCondition(code);
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour < NIGHT_HOUR_END || hour >= NIGHT_HOUR_START;

    if (isNight && condition === WeatherCondition.CLEAR) {
      return 'fa-moon';
    }
    if (isNight && condition === WeatherCondition.FEW_CLOUDS) {
      return 'fa-cloud-moon';
    }
    if (isNight && condition === WeatherCondition.LIGHT_DRIZZLE) {
      return 'fa-cloud-moon-rain';
    }

    return WEATHER_ICONS[condition] || WEATHER_ICONS.default;
  }

  /**
   * Resetta le proprietà quando non ci sono dati
   */
  private resetProperties(): void {
    this.weatherIcon = WEATHER_ICONS.default;
    this.description = '';
    this.curiosity = 'Nessun dato meteo disponibile';
    this.temperature = 0;
    this.humidity = 0;
    this.windSpeed = 0;
    this.pressure = 0;
  }

  /**
   * Ritorna l'icona meteo
   */
  getWeatherIcon(): string {
    return this.weatherIcon;
  }

  /**
   * Ritorna la descrizione napoletana
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Ritorna la curiosità in base alla descrizione
   */
  getCuriosity(): string {
    return this.curiosity;
  }

  /**
   * Formatta la temperatura
   */
  getTemperature(): number {
    return this.temperature;
  }

  /**
   * Ritorna umidità
   */
  getHumidity(): number {
    return this.humidity;
  }

  /**
   * Ritorna velocità vento
   */
  getWindSpeed(): number {
    return this.windSpeed;
  }

  /**
   * Ritorna pressione
   */
  getPressure(): number {
    return this.pressure;
  }

  /**
   * Ritorna data formattata
   */
  getCurrentDate(): string {
    return this.currentDate;
  }
}
