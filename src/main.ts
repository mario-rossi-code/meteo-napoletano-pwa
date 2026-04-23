import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Bootstrap dell'applicazione
 * @returns {Promise<ApplicationRef>}
 */
bootstrapApplication(AppComponent, appConfig).catch((err) => {
  console.error('❌ Errore bootstrap:', err);
});