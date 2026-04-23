/**
 * @fileoverview Componente card meteo corrente
 * File: src/app/components/weather-card/weather-card.component.ts
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData, WeatherCondition } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';
import {
  WEATHER_ICONS,
  CURIOSITIES,
  NIGHT_HOUR_START,
  NIGHT_HOUR_END,
} from '../../constants/weather-constants';
import { inject } from '@angular/core';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.scss'],
})
export class WeatherCardComponent {
  @Input() weatherData: WeatherData | null = null;
  @Input() cityName: string | null = null;

  protected weatherService = inject(WeatherService);
  protected WEATHER_ICONS = WEATHER_ICONS;
  protected CURIOSITIES = CURIOSITIES;

  /**
   * Ritorna l'icona meteo in base all'ora del giorno
   */
  getWeatherIcon(): string {
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
   * Ritorna la descrizione napoletana casuale
   */
  getDescription(): string {
    if (!this.weatherData) return '';

    const code = this.weatherData.current.weather_code;
    const condition = this.weatherService.weatherCodeToCondition(code);
    return this.weatherService.getRandomDescription(condition);
  }

  /**
   * Ritorna la curiosità in base alla descrizione
   */
  getCuriosity(): string {
    const description = this.getDescription();
    return this.CURIOSITIES[description] || 'Che tiempo che sta facendo!';
  }

  /**
   * Formatta la temperatura
   */
  getTemperature(): number {
    return Math.round(this.weatherData?.current.temperature_2m || 0);
  }

  /**
   * Ritorna umidità
   */
  getHumidity(): number {
    return this.weatherData?.current.relative_humidity_2m || 0;
  }

  /**
   * Ritorna velocità vento
   */
  getWindSpeed(): number {
    return Math.round(this.weatherData?.current.wind_speed_10m || 0);
  }

  /**
   * Ritorna pressione
   */
  getPressure(): number {
    return this.weatherData?.current.pressure_msl || 0;
  }

  /**
   * Ritorna data formattata
   */
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}