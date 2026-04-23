/**
 * @fileoverview Performance Monitoring
 * File: src/app/config/performance.ts
 * 
 * @description Monitoraggio performance
 */

export class PerformanceMonitor {
  /**
   * @method measureWebVitals
   * @description Misura Web Vitals
   * @static
   */
  static measureWebVitals(): void {
  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    // Type guard per LCP
    if ('renderTime' in lastEntry || 'loadTime' in lastEntry) {
      const lcpEntry = lastEntry as any;
      console.log('LCP:', lcpEntry.renderTime || lcpEntry.loadTime);
    }
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Type guard per CLS
      if ('value' in entry && 'hadRecentInput' in entry) {
        const layoutShiftEntry = entry as any;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
          console.log('CLS:', clsValue);
        }
      }
    }
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const firstInput = list.getEntries()[0];
    // Type guard per FID
    if ('processingDuration' in firstInput) {
      const fidEntry = firstInput as any;
      console.log('FID:', fidEntry.processingDuration);
    }
  });
  fidObserver.observe({ entryTypes: ['first-input'] });
}

  /**
   * @method reportMetrics
   * @description Invia metriche a Analytics
   * @static
   */
  static reportMetrics(): void {
    // Leggi metrics da Navigation Timing API
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      const metrics = {
        dns: (perfData as any).domainLookupEnd - (perfData as any).domainLookupStart,
        tcp: (perfData as any).connectEnd - (perfData as any).connectStart,
        request: (perfData as any).responseStart - (perfData as any).requestStart,
        response: (perfData as any).responseEnd - (perfData as any).responseStart,
        dom: (perfData as any).domContentLoadedEventEnd - (perfData as any).domContentLoadedEventStart,
        load: (perfData as any).loadEventEnd - (perfData as any).loadEventStart,
      };

      console.table(metrics);

      // Invia a Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'page_view_performance', metrics);
      }
    }
  }

  /**
   * @method markPerformance
   * @description Segna punto performance
   * @static
   * @param {string} name - Nome mark
   */
  static mark(name: string): void {
    performance.mark(name);
  }

  /**
   * @method measurePerformance
   * @description Misura performance tra due mark
   * @static
   * @param {string} startMark - Mark inizio
   * @param {string} endMark - Mark fine
   * @returns {number} Durata in ms
   */
  static measure(startMark: string, endMark: string): number {
    const measureName = `${startMark}-${endMark}`;
    performance.measure(measureName, startMark, endMark);
    const measure = performance.getEntriesByName(measureName)[0];
    return measure.duration;
  }
}