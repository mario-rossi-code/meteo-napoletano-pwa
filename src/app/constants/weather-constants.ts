/**
 * @fileoverview Costanti meteorologiche e mappature WMO codes
 * @author Meteo Napulitano PWA
 */

import { WeatherCondition } from "../models/weather.model";


/**
 * @constant NEAPOLITAN_DESCRIPTIONS
 * @description Descrizioni napoletane per ogni condizione meteorologica
 * @type {Record<WeatherCondition, string[]>}
 */
export const NEAPOLITAN_DESCRIPTIONS: Record<WeatherCondition, string[]> = {
  [WeatherCondition.CLEAR]: [
    "Che bell' tiempo!",
    "Nun ce sta na nuvolella",
    "O sole sta a fa' 'a festa",
    "Tutto cielo e sole",
    "Pare 'na jurnata 'e primmavera",
    "Pare 'nu quadro 'e Posillipo",
  ],
  [WeatherCondition.FEW_CLOUDS]: [
    "O cielo è quasi tutto azzurro",
    "Quacche nuvola passeggera",
    "Cielo sereno cu quacche capriccio",
    "Tanto sole e na nuvola 'e contorno",
    "Nuvole sparse comme 'e stelle",
    "Ce stanno 'e nuvolelle, ma 'o sole nun s'arrende!",
    "Sta piglianno nu poco 'e capriccio, ma niente 'e serio.",
  ],
  [WeatherCondition.CLOUDS]: [
    "Stanno arrivanno 'e nuvole",
  ],
  [WeatherCondition.LIGHT_DRIZZLE]: [
    "Schizzichea",
    "Sta chiovenn' a spizziche e bocconi.",
  ],
  [WeatherCondition.DRIZZLE]: [
    "Schizzichea",
  ],
  [WeatherCondition.RAIN]: [
    "Chiove! Port l'umbrell!",
  ],
  [WeatherCondition.RAIN_HEAVY]: [
    "Chiove a catinelle! Port l'umbrell!",
    "O pata pata e l'acqua!",
  ],
  [WeatherCondition.FOG]: [
    "Par e' sta a Milano, tutta 'na nebbia",
  ],
  [WeatherCondition.FOG_DENSE]: [
    "Nun s' ver nient!",
  ],
  [WeatherCondition.THUNDERSTORM]: [
    "O pata pata e l'acqua!",
  ],
  [WeatherCondition.SNOW]: [
    "A' Neve!",
    "'A città pare 'nu presepe",
    "Fiocche e neve comme 'o zucchero",
  ],
  [WeatherCondition.DEFAULT]: [
    "Comme vene vene, speramm' ca nun chiove",
  ],
};

/**
 * @constant WEATHER_DESCRIPTIONS_IT
 * @description Descrizioni italiane ufficiali
 * @type {Record<WeatherCondition, string>}
 */
export const WEATHER_DESCRIPTIONS_IT: Record<WeatherCondition, string> = {
  [WeatherCondition.CLEAR]: 'Sereno',
  [WeatherCondition.FEW_CLOUDS]: 'Poco nuvoloso',
  [WeatherCondition.CLOUDS]: 'Nuvoloso',
  [WeatherCondition.LIGHT_DRIZZLE]: 'Pioggia leggera',
  [WeatherCondition.DRIZZLE]: 'Pioggia leggera',
  [WeatherCondition.RAIN]: 'Pioggia',
  [WeatherCondition.RAIN_HEAVY]: 'Pioggia forte',
  [WeatherCondition.FOG]: 'Nebbia',
  [WeatherCondition.FOG_DENSE]: 'Nebbia fitta',
  [WeatherCondition.THUNDERSTORM]: 'Temporale',
  [WeatherCondition.SNOW]: 'Neve',
  [WeatherCondition.DEFAULT]: '',
};

/**
 * @constant CURIOSITIES
 * @description Spiegazioni e curiosità napoletane
 * @type {Record<string, string>}
 */
export const CURIOSITIES: Record<string, string> = {
  "Che bell' tiempo!":
    "Espressione classica per descrivere una giornata perfetta, ideale per uscire o fare una passeggiata.",
  "Nun ce sta na nuvolella":
    "Il cielo è completamente sereno senza nuvole. Una rarità che fa subito pensare al mare.",
  "O sole sta a fa' 'a festa":
    "Quando il sole splende così tanto che sembra stia celebrando qualcosa.",
  "Tutto cielo e sole":
    "Un modo per dire che non c'è nulla che disturba: solo azzurro e calore.",
  "Pare 'na jurnata 'e primmavera":
    "Giornata mite, dolce, che ricorda la primavera anche se capita in piena estate o inverno.",
  "Pare 'nu quadro 'e Posillipo":
    "Così bello da sembrare dipinto, come i paesaggi da cartolina di Posillipo.",
  "O cielo è quasi tutto azzurro":
    "C'è solo qualche nuvola a disturbare un cielo che resta limpido.",
  "Quacche nuvola passeggera":
    "Nuvole che passano veloci, senza portare problemi o pioggia.",
  "Cielo sereno cu quacche capriccio":
    "Il tempo è bello, ma c'è qualche nuvola qua e là.",
  "Tanto sole e na nuvola 'e contorno":
    "Il sole resta protagonista, con solo un po' di contorno nuvoloso.",
  "Nuvole sparse comme 'e stelle":
    "Le nuvole sembrano disseminate qua e là, quasi decorative.",
  "Ce stanno 'e nuvolelle, ma 'o sole nun s'arrende!":
    "Anche con qualche nuvola, il sole continua a splendere.",
  "Sta piglianno nu poco 'e capriccio, ma niente 'e serio.":
    "Il tempo sembra incerto, ma non dà segni di veri guai.",
  "Stanno arrivanno 'e nuvole":
    "Quando il cielo si riempie di nuvole e ti chiedi se venga a piovere.",
  "Chiove! Port l'umbrell!":
    "Piove forte, e uscire senza ombrello non è la migliore delle idee.",
  "Chiove a catinelle! Port l'umbrell!":
    "Pioggia molto forte e insistente. Meglio stare al riparo!",
  "Schizzichea":
    "Sta piovigginando, abbastanza fastidioso da bagnarti senza accorgertene.",
  "Sta chiovenn' a spizziche e bocconi.":
    "Pioggia leggera e intermittente, che va e viene a suo piacimento.",
  "Par e' sta a Milano, tutta 'na nebbia":
    "Nebbia fitta, sembra di essere al Nord... ma restando a Napoli.",
  "Nun s' ver nient!":
    "La nebbia è così densa che non riesci a vedere nemmeno la tua mano.",
  "A' Neve!":
    "Quando cade la neve a Napoli è sempre un evento speciale, quasi magico.",
  "'A città pare 'nu presepe":
    "Con la neve, Napoli sembra un presepe vivente, tutta una poesia.",
  "Fiocche e neve comme 'o zucchero":
    "I fiocchi leggeri sembrano zucchero a velo che decora tutto.",
  "O pata pata e l'acqua!":
    "Temporale forte, con tuoni, lampi e tanta pioggia.",
  "Comme vene vene, speramm' ca nun chiove":
    "Quando il cielo non promette niente di buono, ma speri che non piova.",
};

/**
 * @constant WEATHER_ICONS
 * @description Mappatura condizioni meteo a icone FontAwesome
 * @type {Record<WeatherCondition, string>}
 */
export const WEATHER_ICONS: Record<WeatherCondition, string> = {
  [WeatherCondition.CLEAR]: 'fa-sun',
  [WeatherCondition.FEW_CLOUDS]: 'fa-cloud-sun',
  [WeatherCondition.CLOUDS]: 'fa-cloud',
  [WeatherCondition.RAIN]: 'fa-cloud-showers-heavy',
  [WeatherCondition.RAIN_HEAVY]: 'fa-cloud-showers-heavy',
  [WeatherCondition.LIGHT_DRIZZLE]: 'fa-cloud-sun-rain',
  [WeatherCondition.DRIZZLE]: 'fa-cloud-rain',
  [WeatherCondition.THUNDERSTORM]: 'fa-cloud-bolt',
  [WeatherCondition.SNOW]: 'fa-snowflake',
  [WeatherCondition.FOG]: 'fa-smog',
  [WeatherCondition.FOG_DENSE]: 'fa-smog',
  [WeatherCondition.DEFAULT]: 'fa-cloud',
};

/**
 * @constant LOADING_PHRASES
 * @description Frasi di caricamento napoletane
 * @type {string[]}
 */
export const LOADING_PHRASES: string[] = [
  "Aspè, mo' interrogo 'o Vesuvio...",
  "Sto chiedendo informazioni a Pulcinella",
  "Mo' arriva... comme na' pizza",
  "Sto controllando 'a situazione...",
  "Mamma mia, famme vede'...",
  "Aspè na' poco...",
];

/**
 * @constant WMO_CODE_MAPPING
 * @description Mappatura WMO codes a condizioni meteorologiche
 * @see https://www.open-meteo.com/en/docs
 * @type {Record<number, WeatherCondition>}
 */
export const WMO_CODE_MAPPING: Record<number, WeatherCondition> = {
  0: WeatherCondition.CLEAR,
  1: WeatherCondition.FEW_CLOUDS,
  2: WeatherCondition.FEW_CLOUDS,
  3: WeatherCondition.CLOUDS,
  45: WeatherCondition.FOG,
  48: WeatherCondition.FOG_DENSE,
  51: WeatherCondition.LIGHT_DRIZZLE,
  53: WeatherCondition.DRIZZLE,
  55: WeatherCondition.DRIZZLE,
  61: WeatherCondition.RAIN,
  63: WeatherCondition.RAIN,
  65: WeatherCondition.RAIN,
  66: WeatherCondition.RAIN,
  67: WeatherCondition.RAIN,
  71: WeatherCondition.SNOW,
  73: WeatherCondition.SNOW,
  75: WeatherCondition.SNOW,
  77: WeatherCondition.SNOW,
  80: WeatherCondition.RAIN,
  81: WeatherCondition.RAIN,
  82: WeatherCondition.RAIN_HEAVY,
  85: WeatherCondition.SNOW,
  86: WeatherCondition.SNOW,
  95: WeatherCondition.THUNDERSTORM,
  96: WeatherCondition.THUNDERSTORM,
  99: WeatherCondition.THUNDERSTORM,
};

/**
 * @constant API_ENDPOINTS
 * @description Endpoint API principali
 * @type {Object}
 */
export const API_ENDPOINTS = {
  OPEN_METEO: 'https://api.open-meteo.com/v1/forecast',
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  OPENCAGE: 'https://api.opencagedata.com/geocode/v1/json',
} as const;

/**
 * @constant CACHE_CONFIG
 * @description Configurazione cache
 * @type {Object}
 */
export const CACHE_CONFIG = {
  WEATHER_TTL: 30 * 60 * 1000, // 30 minuti
  GEO_TTL: 24 * 60 * 60 * 1000, // 24 ore
  STORAGE_KEY_PREFIX: 'meteo_pwa_',
} as const;

/**
 * @constant DEFAULT_CITY
 * @description Città di default
 * @type {string}
 */
export const DEFAULT_CITY = 'Napoli';

/**
 * @constant FORECAST_DAYS
 * @description Numero giorni previsione
 * @type {number}
 */
export const FORECAST_DAYS = 6;

/**
 * @constant HOURLY_FORECAST_HOURS
 * @description Numero ore previsione oraria
 * @type {number}
 */
export const HOURLY_FORECAST_HOURS = 24;

/**
 * @constant NIGHT_HOUR_START
 * @description Ora inizio periodo notturno
 * @type {number}
 */
export const NIGHT_HOUR_START = 20;

/**
 * @constant NIGHT_HOUR_END
 * @description Ora fine periodo notturno
 * @type {number}
 */
export const NIGHT_HOUR_END = 6;
