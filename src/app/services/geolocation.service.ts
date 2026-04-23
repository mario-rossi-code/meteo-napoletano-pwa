/**
 * @fileoverview Servizio di geolocalizzazione del browser
 * @author Meteo Napulitano PWA
 * 
 * @description Gestisce:
 * - Permessi di geolocalizzazione
 * - Recupero coordinate utente
 * - Error handling con fallback
 */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { LocationCoords } from '../models/weather.model';

/**
 * @class GeolocationService
 * @description Servizio per la geolocalizzazione del dispositivo
 */
@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  /**
   * @property {number} GEOLOCATION_TIMEOUT
   * @description Timeout in millisecondi per richiesta geolocalizzazione
   * @static
   */
  private static readonly GEOLOCATION_TIMEOUT = 10000;

  /**
   * @property {GeolocationCoordinates | null}
   * @description Cache coordinate attuali
   */
  private cachedCoordinates: LocationCoords | null = null;

  constructor() {}

  /**
   * @method getCurrentLocation
   * @description Recupera la posizione corrente dell'utente
   * @returns {Observable<LocationCoords>} Coordinate geografiche
   * @throws {Error} Se geolocalizzazione non supportata o permesso negato
   * @example
   * this.geolocationService.getCurrentLocation().subscribe(
   *   (coords) => console.log('Lat:', coords.latitude, 'Lon:', coords.longitude),
   *   (error) => console.error('Errore:', error.message)
   * );
   */
  getCurrentLocation(): Observable<LocationCoords> {
    return new Observable((observer) => {
      // Controllo supporto Geolocation API
      if (!navigator.geolocation) {
        observer.error(
          new Error('Geolocalizzazione non supportata dal browser')
        );
        return;
      }

      // Ritorna cache se disponibile
      if (this.cachedCoordinates) {
        observer.next(this.cachedCoordinates);
        observer.complete();
        return;
      }

      const options: PositionOptions = {
        timeout: GeolocationService.GEOLOCATION_TIMEOUT,
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000, // 5 minuti
      };

      /**
       * @callback onSuccess
       * @description Callback successo geolocalizzazione
       * @param {GeolocationPosition} position - Posizione ottenuta
       */
      const onSuccess = (position: GeolocationPosition) => {
        const coords: LocationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Salva in cache
        this.cachedCoordinates = coords;

        observer.next(coords);
        observer.complete();
      };

      /**
       * @callback onError
       * @description Callback errore geolocalizzazione
       * @param {GeolocationPositionError} error - Errore geolocalizzazione
       */
      const onError = (error: GeolocationPositionError) => {
        let errorMsg: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg =
              'Permesso di geolocalizzazione negato. Controlla le impostazioni.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Posizione non disponibile.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Timeout: geolocalizzazione ha impiegato troppo tempo.';
            break;
          default:
            errorMsg = 'Errore sconosciuto nella geolocalizzazione.';
        }

        observer.error(new Error(errorMsg));
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    });
  }

  /**
   * @method isGeolocationAvailable
   * @description Controlla se geolocalizzazione è disponibile
   * @returns {boolean} True se disponibile
   */
  isGeolocationAvailable(): boolean {
    return !!navigator.geolocation;
  }

  /**
   * @method watchLocation
   * @description Monitora la posizione in tempo reale
   * @param {Function} callback - Callback chiamato ad ogni cambio posizione
   * @param {Function} errorCallback - Callback errore
   * @returns {number} Watch ID per cancellare il monitoraggio
   * @example
   * const watchId = this.geolocationService.watchLocation(
   *   (coords) => console.log('Nuova posizione:', coords),
   *   (error) => console.error('Errore:', error.message)
   * );
   *
   * // Successivamente per stoppare:
   * this.geolocationService.clearWatch(watchId);
   */
  watchLocation(
    callback: (coords: LocationCoords) => void,
    errorCallback: (error: Error) => void
  ): number {
    if (!navigator.geolocation) {
      errorCallback(
        new Error('Geolocalizzazione non supportata dal browser')
      );
      return -1;
    }

    const options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: GeolocationService.GEOLOCATION_TIMEOUT,
      maximumAge: 0,
    };

    const onSuccess = (position: GeolocationPosition) => {
      const coords: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      this.cachedCoordinates = coords;
      callback(coords);
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMsg: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = 'Permesso di geolocalizzazione negato.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = 'Posizione non disponibile.';
          break;
        case error.TIMEOUT:
          errorMsg = 'Timeout nella geolocalizzazione.';
          break;
        default:
          errorMsg = 'Errore nella geolocalizzazione.';
      }

      errorCallback(new Error(errorMsg));
    };

    return navigator.geolocation.watchPosition(onSuccess, onError, options);
  }

  /**
   * @method clearWatch
   * @description Ferma il monitoraggio della posizione
   * @param {number} watchId - ID watch da cancellare
   */
  clearWatch(watchId: number): void {
    if (navigator.geolocation && watchId > -1) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * @method calculateDistance
   * @description Calcola distanza tra due coordinate (formula Haversine)
   * @param {LocationCoords} coord1 - Prima coordinata
   * @param {LocationCoords} coord2 - Seconda coordinata
   * @returns {number} Distanza in km
   * @example
   * const distance = this.geolocationService.calculateDistance(
   *   { latitude: 40.85, longitude: 14.27 }, // Napoli
   *   { latitude: 41.90, longitude: 12.50 }  // Roma
   * );
   * console.log(`Distanza: ${distance.toFixed(2)} km`);
   */
  calculateDistance(coord1: LocationCoords, coord2: LocationCoords): number {
    const R = 6371; // Raggio terrestre in km
    const dLat = this.toRad(coord2.latitude - coord1.latitude);
    const dLon = this.toRad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.latitude)) *
        Math.cos(this.toRad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * @method toRad
   * @description Converte gradi a radianti
   * @private
   * @param {number} degrees - Angolo in gradi
   * @returns {number} Angolo in radianti
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * @method getCachedCoordinates
   * @description Ritorna coordinate in cache
   * @returns {LocationCoords | null} Coordinate o null
   */
  getCachedCoordinates(): LocationCoords | null {
    return this.cachedCoordinates;
  }

  /**
   * @method clearCachedCoordinates
   * @description Pulisce la cache coordinate
   */
  clearCachedCoordinates(): void {
    this.cachedCoordinates = null;
  }
}
