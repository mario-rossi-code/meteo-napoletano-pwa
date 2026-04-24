/**
 * @fileoverview Servizio PWA per Service Worker e notifiche
 * @author Meteo Napulitano PWA
 *
 * @description Gestisce:
 * - Registrazione Service Worker
 * - Notifiche push
 * - Aggiornamenti app
 * - Installazione PWA
 */

import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { tap, switchMap, catchError, filter } from 'rxjs/operators';

/**
 * @interface UpdateNotification
 * @description Notifica di aggiornamento disponibile
 */
interface UpdateNotification {
  available: boolean;
  message: string;
}

/**
 * @class PwaService
 * @description Servizio per PWA features e Service Worker
 */
@Injectable({
  providedIn: 'root',
})
export class PwaService {
  /** @private Injector di SwUpdate (opzionale) */
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  /** @private Soggetto per notifiche aggiornamento */
  private updateAvailableSubject = new BehaviorSubject<UpdateNotification>({
    available: false,
    message: '',
  });

  /** @public Osservabile notifiche aggiornamento */
  updateAvailable$ = this.updateAvailableSubject.asObservable();

  /** @private Soggetto per stato installazione */
  private installPromptSubject = new BehaviorSubject<Event | null>(null);
  /** @public Osservabile prompt installazione */
  installPrompt$ = this.installPromptSubject.asObservable();

  /** @private Flag app in standalone mode */
  private isStandalone = false;

  /** @private Deferrable install prompt */
  private deferredPrompt: Event | null = null;

  /** @private Flag per verificare se siamo in ambiente browser */
  private isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

  constructor() {
    // Verifica se siamo in ambiente browser prima di inizializzare
    if (this.isBrowser) {
      this.initializePwa();
      this.setupInstallPrompt();

      // Inizializza controlli aggiornamenti solo se SwUpdate è disponibile
      if (this.swUpdate && this.swUpdate.isEnabled) {
        this.checkForUpdates();
      } else {
        console.log('ℹ️ Service Worker non disponibile - PWA features limitate');
      }
    } else {
      console.log('ℹ️ Ambiente non browser - PWA features disabilitate');
    }
  }

  /**
   * @method initializePwa
   * @description Inizializza la PWA
   * @private
   */
  private initializePwa(): void {
    // Controlla se app è in standalone mode
    this.isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    console.log(`📱 PWA Mode: ${this.isStandalone ? 'Standalone' : 'Browser'}`);

    // Registra Service Worker se supportato
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
  }

  /**
   * @method registerServiceWorker
   * @description Registra il Service Worker
   * @private
   */
  private registerServiceWorker(): void {
    navigator.serviceWorker
      .register('/ngsw-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registrato:', registration);

        // Monitora i cambiamenti del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('🔄 Nuovo Service Worker attivato');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker non registrato (forse in sviluppo):', error);
      });
  }

  /**
   * @method checkForUpdates
   * @description Controlla aggiornamenti app con polling
   * @private
   */
  private checkForUpdates(): void {
    // Verifica che SwUpdate sia disponibile e abilitato
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      console.log('ℹ️ SwUpdate non disponibile, skip aggiornamenti automatici');
      return;
    }

    // Controlla immediatamente
    this.checkForUpdateSafe();

    // Poi ogni ora
    interval(60 * 60 * 1000)
      .pipe(
        switchMap(() => this.checkForUpdateSafe()),
        catchError((error) => {
          console.warn('⚠️ Errore controllo aggiornamenti:', error);
          return of(undefined);
        }),
      )
      .subscribe();

    // Ascolta aggiornamenti disponibili
    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        this.updateAvailableSubject.next({
          available: true,
          message: 'Nuovo aggiornamento disponibile!',
        });

        console.log('🔄 Aggiornamento disponibile');

        // Auto-aggiorna dopo 5 secondi
        setTimeout(() => {
          this.activateUpdate();
        }, 5000);
      }
    });
  }

  /**
   * @method checkForUpdateSafe
   * @description Controllo aggiornamenti sicuro (senza errori)
   * @private
   */
  private async checkForUpdateSafe(): Promise<void> {
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      return;
    }

    try {
      await this.swUpdate.checkForUpdate();
    } catch (error) {
      // Ignora l'errore di Service Worker non disponibile
      if (error instanceof Error && !error.message.includes('disabled or not supported')) {
        console.warn('⚠️ Errore controllo aggiornamenti:', error);
      }
    }
  }

  /**
   * @method activateUpdate
   * @description Attiva aggiornamento e ricarica la pagina
   */
  async activateUpdate(): Promise<void> {
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      console.warn('⚠️ Impossibile attivare aggiornamento: SwUpdate non disponibile');
      return;
    }

    try {
      await this.swUpdate.activateUpdate();
      console.log('✅ Aggiornamento attivato, ricarico...');
      window.location.reload();
    } catch (error) {
      console.error('❌ Errore attivazione aggiornamento:', error);
    }
  }

  /**
   * @method setupInstallPrompt
   * @description Imposta il prompt di installazione PWA
   * @private
   */
  private setupInstallPrompt(): void {
    // Previene il prompt automatico del browser
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.installPromptSubject.next(event);
      console.log('📦 Install prompt disponibile');
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installata');
      this.deferredPrompt = null;
      this.installPromptSubject.next(null);
    });
  }

  /**
   * @method installApp
   * @description Mostra il prompt di installazione
   * @returns {Promise<boolean>} True se installata con successo
   * @example
   * const installed = await this.pwaService.installApp();
   * if (installed) {
   *   console.log('App installata!');
   * }
   */
  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt non disponibile');
      return false;
    }

    try {
      (this.deferredPrompt as any).prompt();
      const choiceResult = await (this.deferredPrompt as any).userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log("✅ Utente ha accettato l'installazione");
        this.deferredPrompt = null;
        return true;
      } else {
        console.log("❌ Utente ha rifiutato l'installazione");
        return false;
      }
    } catch (error) {
      console.error('Errore installazione:', error);
      return false;
    }
  }

  /**
   * @method isAppInstallable
   * @description Controlla se app è installabile
   * @returns {boolean} True se installabile
   */
  isAppInstallable(): boolean {
    return !!this.deferredPrompt;
  }

  /**
   * @method isRunningStandalone
   * @description Controlla se app è in standalone mode
   * @returns {boolean} True se standalone
   */
  isRunningStandalone(): boolean {
    return this.isStandalone;
  }

  /**
   * @method sendNotification
   * @description Invia notifica push all'utente
   * @param {string} title - Titolo notifica
   * @param {NotificationOptions} options - Opzioni notifica
   * @returns {Promise<void>}
   * @example
   * this.pwaService.sendNotification('Meteo Napoli', {
   *   body: 'Piove! Portati l\'ombrello!',
   *   icon: '/assets/icons/rainy.png',
   *   badge: '/assets/icons/badge.png',
   *   tag: 'meteo-alert'
   * });
   */
  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isBrowser) {
      console.warn('Notifiche non supportate in questo ambiente');
      return;
    }

    if (!('Notification' in window)) {
      console.warn('Notifiche non supportate');
      return;
    }

    // Richiedi permesso se necessario
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          icon: '/assets/icons/icon-192x192.png',
          badge: '/assets/icons/badge-72x72.png',
          ...options,
        });
      }
    }
  }

  /**
   * @method requestNotificationPermission
   * @description Richiede permesso per notifiche
   * @returns {Promise<NotificationPermission>} Permesso ottenuto
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isBrowser) {
      console.warn('Notifiche non supportate in questo ambiente');
      return 'denied';
    }

    if (!('Notification' in window)) {
      console.warn('Notifiche non supportate');
      return 'denied';
    }

    if (Notification.permission !== 'granted') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * @method sharePage
   * @description Usa Web Share API per condividere
   * @param {ShareData} data - Dati da condividere
   * @returns {Promise<void>}
   * @example
   * this.pwaService.sharePage({
   *   title: 'Meteo Napoli',
   *   text: 'Guarda il meteo di Napoli!',
   *   url: window.location.href
   * });
   */
  async sharePage(data: ShareData): Promise<void> {
    if (!this.isBrowser || !navigator.share) {
      console.warn('Web Share API non supportata');
      return;
    }

    try {
      await navigator.share(data);
      console.log('✅ Condivisione avvenuta');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Errore condivisione:', error);
      }
    }
  }

  /**
   * @method isOnline
   * @description Controlla se dispositivo è online
   * @returns {boolean} True se online
   */
  isOnline(): boolean {
    return this.isBrowser ? navigator.onLine : true;
  }

  /**
   * @method getNetworkStatus
   * @description Monitora lo stato della rete
   * @returns {Observable<boolean>} Observable dello stato online/offline
   */
  getNetworkStatus(): Observable<boolean> {
    if (!this.isBrowser) {
      return of(true);
    }

    return new Observable((observer) => {
      observer.next(navigator.onLine);

      const onlineListener = () => observer.next(true);
      const offlineListener = () => observer.next(false);

      window.addEventListener('online', onlineListener);
      window.addEventListener('offline', offlineListener);

      return () => {
        window.removeEventListener('online', onlineListener);
        window.removeEventListener('offline', offlineListener);
      };
    });
  }

  /**
   * @method getDeviceInfo
   * @description Ottiene informazioni sul dispositivo
   * @returns {Object} Informazioni dispositivo
   */
  getDeviceInfo(): {
    userAgent: string;
    platform: string;
    language: string;
    onLine: boolean;
    standalone: boolean;
  } {
    if (!this.isBrowser) {
      return {
        userAgent: 'Server Side',
        platform: 'server',
        language: 'it',
        onLine: true,
        standalone: false,
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      onLine: navigator.onLine,
      standalone: this.isStandalone,
    };
  }
}
