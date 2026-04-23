/**
 * @fileoverview SEO Configuration
 * File: src/app/config/seo.ts
 * 
 * @description Meta tag management
 */

export class SEOService {
  /**
   * @method setMetaTags
   * @description Imposta meta tag
   * @static
   * @param {any} data - Dati meteo
   */
  static setMetaTags(data: any): void {
    const title = `Meteo ${data.city} - Previsioni Meteorologiche`;
    const description = `Previsioni meteo per ${data.city}. Temperatura ${data.temp}°C. Descrizioni in napoletano.`;
    const image = '/assets/icons/icon-512x512.png';

    // Title
    document.title = title;

    // OG Tags
    this.setMetaTag('og:title', title);
    this.setMetaTag('og:description', description);
    this.setMetaTag('og:image', image);
    this.setMetaTag('og:url', window.location.href);

    // Twitter Card
    this.setMetaTag('twitter:card', 'summary');
    this.setMetaTag('twitter:title', title);
    this.setMetaTag('twitter:description', description);
    this.setMetaTag('twitter:image', image);

    // Standard Meta
    this.setMetaTag('description', description);
    this.setMetaTag('keywords', `meteo,${data.city},napoletano,previsioni`);
  }

  /**
   * @method setMetaTag
   * @description Imposta singolo meta tag
   * @private
   * @static
   * @param {string} name - Nome tag
   * @param {string} content - Contenuto
   */
  private static setMetaTag(name: string, content: string): void {
  let element: HTMLMetaElement | null = document.querySelector(`meta[name="${name}"]`) ||
                                        document.querySelector(`meta[property="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:')) {
      element.setAttribute('property', name);
    } else if (name.startsWith('twitter:')) {
      element.setAttribute('name', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

  /**
   * @method setStructuredData
   * @description Imposta structured data (schema.org)
   * @static
   * @param {any} data - Dati meteo
   */
  static setStructuredData(data: any): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Meteo Napulitano',
    description: 'PWA meteorologica per Napoli',
    url: window.location.href,
    image: '/assets/icons/icon-512x512.png',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IT',
      addressRegion: 'Campania',
      addressLocality: 'Napoli',
    },
  };

  let script: HTMLScriptElement | null = document.querySelector('script[type="application/ld+json"]');
  
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(schema);
}
}