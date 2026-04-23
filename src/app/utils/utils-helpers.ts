/**
 * @fileoverview Funzioni utility e helper
 * File: src/app/utils/date-formatter.ts
 * 
 * @description Utility per formatting date, calcoli meteo
 */

/**
 * @class DateFormatter
 * @description Utility per formattazione date
 */
export class DateFormatter {
  /**
   * @method formatDate
   * @description Formatta data locale
   * @param {Date | string} date - Data da formattare
   * @param {string} locale - Locale (default 'it-IT')
   * @returns {string} Data formattata
   */
  static formatDate(date: Date | string, locale = 'it-IT'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * @method formatTime
   * @description Formatta ora HH:MM
   * @param {Date | string} date - Data da formattare
   * @returns {string} Ora formattata
   */
  static formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * @method formatDateShort
   * @description Formatta data breve (gg/mm)
   * @param {Date | string} date - Data da formattare
   * @returns {string} Data breve
   */
  static formatDateShort(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  /**
   * @method getDayName
   * @description Ritorna nome giorno della settimana
   * @param {Date | string} date - Data
   * @param {string} locale - Locale
   * @returns {string} Nome giorno
   */
  static getDayName(date: Date | string, locale = 'it-IT'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, { weekday: 'long' });
  }

  /**
   * @method getMonthName
   * @description Ritorna nome mese
   * @param {Date | string} date - Data
   * @param {string} locale - Locale
   * @returns {string} Nome mese
   */
  static getMonthName(date: Date | string, locale = 'it-IT'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, { month: 'long' });
  }

  /**
   * @method isSameDay
   * @description Verifica se due date sono lo stesso giorno
   * @param {Date} date1 - Prima data
   * @param {Date} date2 - Seconda data
   * @returns {boolean} True se stesso giorno
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  /**
   * @method isToday
   * @description Verifica se data è oggi
   * @param {Date | string} date - Data da verificare
   * @returns {boolean} True se oggi
   */
  static isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return this.isSameDay(d, new Date());
  }

  /**
   * @method isTomorrow
   * @description Verifica se data è domani
   * @param {Date | string} date - Data da verificare
   * @returns {boolean} True se domani
   */
  static isTomorrow(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.isSameDay(d, tomorrow);
  }

  /**
   * @method daysUntil
   * @description Calcola giorni fino a data
   * @param {Date | string} date - Data futura
   * @returns {number} Giorni rimanenti
   */
  static daysUntil(date: Date | string): number {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const diff = d.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

/**
 * @class WeatherUtils
 * @description Utility per calcoli meteo
 */
export class WeatherUtils {
  /**
   * @method kelvinToCelsius
   * @description Converte Kelvin a Celsius
   * @param {number} kelvin - Temperatura in Kelvin
   * @returns {number} Temperatura in Celsius
   */
  static kelvinToCelsius(kelvin: number): number {
    return Math.round(kelvin - 273.15);
  }

  /**
   * @method celsiusToFahrenheit
   * @description Converte Celsius a Fahrenheit
   * @param {number} celsius - Temperatura in Celsius
   * @returns {number} Temperatura in Fahrenheit
   */
  static celsiusToFahrenheit(celsius: number): number {
    return Math.round((celsius * 9) / 5 + 32);
  }

  /**
   * @method kmhToMs
   * @description Converte km/h a m/s
   * @param {number} kmh - Velocità in km/h
   * @returns {number} Velocità in m/s
   */
  static kmhToMs(kmh: number): number {
    return Math.round((kmh / 3.6) * 10) / 10;
  }

  /**
   * @method msToKmh
   * @description Converte m/s a km/h
   * @param {number} ms - Velocità in m/s
   * @returns {number} Velocità in km/h
   */
  static msToKmh(ms: number): number {
    return Math.round(ms * 3.6);
  }

  /**
   * @method hpaToMbar
   * @description Converte hPa a mbar (sono equivalenti)
   * @param {number} hpa - Pressione in hPa
   * @returns {number} Pressione in mbar
   */
  static hpaToMbar(hpa: number): number {
    return hpa; // 1 hPa = 1 mbar
  }

  /**
   * @method getWindDirection
   * @description Ritorna direzione vento da gradi
   * @param {number} degrees - Angolo in gradi (0-360)
   * @returns {string} Direzione (N, NE, E, SE, S, SW, W, NW)
   */
  static getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * @method getHumidityLevel
   * @description Ritorna livello umidità descrittivo
   * @param {number} humidity - Umidità percentuale (0-100)
   * @returns {string} Livello descrittivo
   */
  static getHumidityLevel(humidity: number): string {
    if (humidity < 30) return 'Molto bassa';
    if (humidity < 50) return 'Bassa';
    if (humidity < 70) return 'Moderata';
    if (humidity < 85) return 'Alta';
    return 'Molto alta';
  }

  /**
   * @method getUVIndex
   * @description Ritorna livello UV da radiazione solare
   * @param {number} solarRadiation - Radiazione solare (W/m²)
   * @returns {string} Livello UV
   */
  static getUVIndex(solarRadiation: number): string {
    const uv = solarRadiation / 25; // Approssimazione
    if (uv < 3) return 'Basso';
    if (uv < 6) return 'Moderato';
    if (uv < 8) return 'Alto';
    if (uv < 11) return 'Molto alto';
    return 'Estremo';
  }

  /**
   * @method getVisibilityDescription
   * @description Ritorna descrizione visibilità
   * @param {number} visibility - Visibilità in metri
   * @returns {string} Descrizione
   */
  static getVisibilityDescription(visibility: number): string {
    if (visibility < 1000) return 'Molto bassa';
    if (visibility < 5000) return 'Bassa';
    if (visibility < 10000) return 'Moderata';
    if (visibility < 20000) return 'Buona';
    return 'Eccellente';
  }

  /**
   * @method calculateFeelsLike
   * @description Calcola temperatura percepita (wind chill)
   * @param {number} tempC - Temperatura in Celsius
   * @param {number} windKmh - Velocità vento in km/h
   * @returns {number} Temperatura percepita
   */
  static calculateFeelsLike(tempC: number, windKmh: number): number {
    // Wind chill formula
    if (tempC > 10 || windKmh < 4.8) return tempC;
    
    const windMs = this.kmhToMs(windKmh);
    const feelsLike = 13.12 + 
                      0.6215 * tempC - 
                      11.37 * Math.pow(windMs, 0.16) + 
                      0.3965 * tempC * Math.pow(windMs, 0.16);
    
    return Math.round(feelsLike);
  }

  /**
   * @method calculateDewPoint
   * @description Calcola punto di rugiada
   * @param {number} tempC - Temperatura in Celsius
   * @param {number} humidity - Umidità relativa (0-100)
   * @returns {number} Punto di rugiada
   */
  static calculateDewPoint(tempC: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    
    return Math.round(dewPoint * 10) / 10;
  }
}

/**
 * @class ValidationUtils
 * @description Utility per validazione dati
 */
export class ValidationUtils {
  /**
   * @method isValidCity
   * @description Valida nome città
   * @param {string} cityName - Nome città
   * @returns {boolean} True se valido
   */
  static isValidCity(cityName: string): boolean {
    return typeof cityName === 'string' && 
           cityName.trim().length > 1 && 
           cityName.length < 100;
}


  /**
   * @method isValidCoordinates
   * @description Valida coordinate geografiche
   * @param {number} lat - Latitudine
   * @param {number} lon - Longitudine
   * @returns {boolean} True se valide
   */
  static isValidCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * @method isValidTemperature
   * @description Valida temperatura (plausibile)
   * @param {number} temp - Temperatura in Celsius
   * @returns {boolean} True se plausibile
   */
  static isValidTemperature(temp: number): boolean {
    return temp >= -89.2 && temp <= 56.7; // Estremi record terrestri
  }

  /**
   * @method isValidHumidity
   * @description Valida umidità
   * @param {number} humidity - Umidità (0-100)
   * @returns {boolean} True se valida
   */
  static isValidHumidity(humidity: number): boolean {
    return humidity >= 0 && humidity <= 100;
  }

  /**
   * @method isValidPressure
   * @description Valida pressione atmosferica
   * @param {number} pressure - Pressione in hPa
   * @returns {boolean} True se valida
   */
  static isValidPressure(pressure: number): boolean {
    return pressure >= 870 && pressure <= 1085; // Estremi record
  }

  /**
   * @method isValidWindSpeed
   * @description Valida velocità vento
   * @param {number} windSpeed - Velocità in km/h
   * @returns {boolean} True se valida
   */
  static isValidWindSpeed(windSpeed: number): boolean {
    return windSpeed >= 0 && windSpeed <= 500; // Tifone estremo
  }
}

/**
 * @class StringUtils
 * @description Utility per manipolazione stringhe
 */
export class StringUtils {
  /**
   * @method capitalize
   * @description Capitalizza prima lettera
   * @param {string} str - Stringa da capitalizzare
   * @returns {string} Stringa capitalizzata
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * @method truncate
   * @description Tronca stringa a lunghezza max
   * @param {string} str - Stringa da troncare
   * @param {number} maxLength - Lunghezza massima
   * @param {string} suffix - Suffisso (default '...')
   * @returns {string} Stringa troncata
   */
  static truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * @method slugify
   * @description Converte stringa a slug URL-safe
   * @param {string} str - Stringa da convertire
   * @returns {string} Slug
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * @method escapeHtml
   * @description Escapa caratteri HTML
   * @param {string} str - Stringa da escapare
   * @returns {string} Stringa escapata
   */
  static escapeHtml(str: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return str.replace(/[&<>"']/g, (char) => map[char]);
  }
}

/**
 * @class StorageUtils
 * @description Utility per localStorage
 */
export class StorageUtils {
  /**
   * @method setItem
   * @description Salva item in localStorage (con serializzazione)
   * @template T
   * @param {string} key - Chiave
   * @param {T} value - Valore
   * @returns {boolean} True se successo
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Errore salvataggio localStorage:', error);
      return false;
    }
  }

  /**
   * @method getItem
   * @description Recupera item da localStorage
   * @template T
   * @param {string} key - Chiave
   * @returns {T | null} Valore o null
   */
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Errore lettura localStorage:', error);
      return null;
    }
  }

  /**
   * @method removeItem
   * @description Rimuove item da localStorage
   * @param {string} key - Chiave
   * @returns {boolean} True se successo
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Errore rimozione localStorage:', error);
      return false;
    }
  }

  /**
   * @method clear
   * @description Pulisce tutto localStorage
   * @returns {boolean} True se successo
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Errore pulizia localStorage:', error);
      return false;
    }
  }

  /**
   * @method getAllKeys
   * @description Ritorna tutte le chiavi
   * @returns {string[]} Array di chiavi
   */
  static getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  /**
   * @method getSize
   * @description Calcola dimensione localStorage in KB
   * @returns {number} Dimensione in KB
   */
  static getSize(): number {
    let size = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return Math.round((size / 1024) * 100) / 100;
  }
}

/**
 * @class LoggerUtils
 * @description Utility per logging (development only)
 */
export class LoggerUtils {
  private static isDev = !(/^(https?:)?\/\/.+\.[a-z]{2,}$/.test(window.location.href));

  /**
   * @method log
   * @description Log message in console
   * @param {string} message - Messaggio
   * @param {any[]} args - Argomenti aggiuntivi
   */
  static log(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.log(`[🌤️ Meteo] ${message}`, ...args);
    }
  }

  /**
   * @method error
   * @description Log errore in console
   * @param {string} message - Messaggio
   * @param {any[]} args - Argomenti aggiuntivi
   */
  static error(message: string, ...args: any[]): void {
    console.error(`[❌ Meteo Error] ${message}`, ...args);
  }

  /**
   * @method warn
   * @description Log warning in console
   * @param {string} message - Messaggio
   * @param {any[]} args - Argomenti aggiuntivi
   */
  static warn(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.warn(`[⚠️ Meteo Warning] ${message}`, ...args);
    }
  }

  /**
   * @method info
   * @description Log informazione in console
   * @param {string} message - Messaggio
   * @param {any[]} args - Argomenti aggiuntivi
   */
  static info(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.info(`[ℹ️ Meteo Info] ${message}`, ...args);
    }
  }

  /**
   * @method table
   * @description Log tabella in console
   * @param {any} data - Dati da visualizzare
   */
  static table(data: any): void {
    if (this.isDev) {
      console.table(data);
    }
  }

  /**
   * @method time
   * @description Avvia timer performance
   * @param {string} label - Etichetta timer
   */
  static time(label: string): void {
    if (this.isDev) {
      console.time(`[⏱️ ${label}]`);
    }
  }

  /**
   * @method timeEnd
   * @description Termina timer performance
   * @param {string} label - Etichetta timer
   */
  static timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(`[⏱️ ${label}]`);
    }
  }
}

export default {
  DateFormatter,
  WeatherUtils,
  ValidationUtils,
  StringUtils,
  StorageUtils,
  LoggerUtils,
};
