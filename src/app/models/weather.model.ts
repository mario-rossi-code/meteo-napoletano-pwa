/**
 * @fileoverview Modelli e interfacce per i dati meteorologici
 * @author Meteo Napulitano PWA
 */

/**
 * @interface CurrentWeather
 * @description Dati meteorologici attuali
 */
export interface CurrentWeather {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  pressure_msl: number;
}

/**
 * @interface DailyForecast
 * @description Previsioni giornaliere
 */
export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

/**
 * @interface HourlyForecast
 * @description Previsioni orarie
 */
export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  weather_code: number[];
}

/**
 * @interface WeatherData
 * @description Struttura completa dei dati meteorologici
 */
export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast;
  hourly: HourlyForecast;
  timezone: string;
}

/**
 * @interface GeocodingResult
 * @description Risultato della geocodifica
 */
export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

/**
 * @interface LocationCoords
 * @description Coordinate geografiche
 */
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

/**
 * @enum WeatherCondition
 * @description Condizioni meteo standardizzate
 */
export enum WeatherCondition {
  CLEAR = 'clear',
  FEW_CLOUDS = 'fewClouds',
  CLOUDS = 'clouds',
  LIGHT_DRIZZLE = 'lightDrizzle',
  DRIZZLE = 'drizzle',
  RAIN = 'rain',
  RAIN_HEAVY = 'rainHeavy',
  FOG = 'fog',
  FOG_DENSE = 'fogDense',
  THUNDERSTORM = 'thunderstorm',
  SNOW = 'snow',
  DEFAULT = 'default',
}

/**
 * @interface HourlyCard
 * @description Dati singola card previsione oraria
 */
export interface HourlyCard {
  hour: string;
  temperature: number;
  humidity: number;
  weatherCode: number;
  condition: WeatherCondition;
  icon: string;
}

/**
 * @interface DailyCard
 * @description Dati singola card previsione giornaliera
 */
export interface DailyCard {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  condition: WeatherCondition;
  icon: string;
  phrase: string;
}

/**
 * @interface CacheData
 * @description Struttura per il caching locale
 */
export interface CacheData<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}
