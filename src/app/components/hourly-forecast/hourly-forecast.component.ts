import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather.service';
import { inject } from '@angular/core';
import {
  WEATHER_ICONS,
  WEATHER_DESCRIPTIONS_IT,
  HOURLY_FORECAST_HOURS,
  NIGHT_HOUR_START,
  NIGHT_HOUR_END,
} from '../../constants/weather-constants';
import { WeatherData } from '../../models/weather.model';

@Component({
  selector: 'app-hourly-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-forecast.component.html',
  styleUrls: ['./hourly-forecast.component.scss'],
})
export class HourlyForecastComponent {
  @Input() weatherData: WeatherData | null = null;

  protected weatherService = inject(WeatherService);

  /**
   * Ritorna le previsioni orarie
   */
  getHourlyForecasts() {
    if (!this.weatherData) return [];

    const forecasts = [];
    const hourly = this.weatherData.hourly;
    const now = new Date();

    const startIndex = hourly.time.findIndex((timestamp) => {
      return new Date(timestamp) > now;
    });

    if (startIndex === -1) return [];

    for (let i = startIndex; i < startIndex + HOURLY_FORECAST_HOURS && i < hourly.time.length; i++) {
      const date = new Date(hourly.time[i]);
      const hour = date.getHours();
      const code = hourly.weather_code[i];
      const condition = this.weatherService.weatherCodeToCondition(code);
      const isNight = hour < NIGHT_HOUR_END || hour >= NIGHT_HOUR_START;

      let icon = WEATHER_ICONS[condition];
      if (isNight && condition === 'clear') icon = 'fa-moon';

      forecasts.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        temp: Math.round(hourly.temperature_2m[i]),
        humidity: hourly.relative_humidity_2m[i],
        icon,
      });
    }

    return forecasts;
  }

  /**
   * Ritorna la descrizione meteo
   */
  getWeatherDescription(): string {
    if (!this.weatherData) return '';

    const code = this.weatherData.current.weather_code;
    const condition = this.weatherService.weatherCodeToCondition(code);
    return WEATHER_DESCRIPTIONS_IT[condition] || '';
  }

  /**
   * Ritorna i limiti di temperatura
   */
  getTempRange(): string {
    if (!this.weatherData) return '';

    const maxTemp = Math.round(this.weatherData.daily.temperature_2m_max[0]);
    const minTemp = Math.round(this.weatherData.daily.temperature_2m_min[0]);

    return `Massima ${maxTemp}°C, Minima ${minTemp}°C`;
  }
}