
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather.service';
import { inject } from '@angular/core';
import { WeatherData } from '../../models/weather.model';
import { FORECAST_DAYS, WEATHER_ICONS } from '../../constants/weather-constants';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss'],
})
export class ForecastComponent {
  @Input() weatherData: WeatherData | null = null;

  protected weatherService = inject(WeatherService);

  /**
   * Ritorna le previsioni giornaliere
   */
  getDailyForecasts() {
    if (!this.weatherData) return [];

    const forecasts = [];
    const daily = this.weatherData.daily;

    for (let i = 1; i <= FORECAST_DAYS && i < daily.time.length; i++) {
      const date = new Date(daily.time[i]);
      const code = daily.weather_code[i];
      const condition = this.weatherService.weatherCodeToCondition(code);

      forecasts.push({
        date: date.toLocaleDateString('it-IT', { weekday: 'long' }),
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        condition,
        code,
        icon: WEATHER_ICONS[condition],
        description: this.weatherService.getRandomDescription(condition),
      });
    }

    return forecasts;
  }
}