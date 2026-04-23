import { APP_SETTINGS } from "./app-settings";

interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  silent?: boolean;
  vibrate?: number[];
}

export class NotificationManager {
  static async sendWeatherAlert(
    city: string,
    condition: string,
    message: string
  ): Promise<void> {
    if (!APP_SETTINGS.notificationsEnabled) return;

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker non supportato');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const options: ExtendedNotificationOptions = {
        body: message,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: `weather-alert-${city}`,
        requireInteraction: true,
        vibrate: [200, 100, 200], // Vibrazione per dispositivi mobili
      };

      // Aggiungi azioni solo se supportate
      const supportsActions = 'actions' in Notification.prototype;
      if (supportsActions) {
        options.actions = [
          { action: 'open', title: '🔍 Apri' },
          { action: 'close', title: '❌ Chiudi' },
        ];
      }

      await registration.showNotification(`⚠️ Allerta Meteo - ${city}`, options);
    } catch (error) {
      console.error('Errore nell\'invio della notifica:', error);
    }
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifiche non supportate');
      return 'denied';
    }
    return await Notification.requestPermission();
  }

  static isPermitted(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}