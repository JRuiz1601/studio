
import type { LatLngExpression } from 'leaflet';
import { Sun, Cloud, Zap, Umbrella, Snowflake, Thermometer, Wind, Droplets } from 'lucide-react'; // Import specific icons

export interface RiskZone {
  id: string;
  center: LatLngExpression;
  radius: number; // in meters
  level: 'high' | 'medium';
  type: string; // e.g., "Inundación", "Deslizamiento", "Actividad Sísmica"
  description: string; // More details for the popup
}

export interface WeatherData {
  current: {
    temperature: number; // Celsius
    feelsLike: number;
    humidity: number; // percentage
    windSpeed: number; // km/h
    condition: string; // e.g., "Soleado", "Nublado"
    icon: React.ComponentType<{ className?: string }>;
  };
  hourlyForecast: Array<{
    time: string; // e.g., "14:00"
    temperature: number;
    condition: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  dailyTrend: Array<{ hour: number; temperature: number }>; // For the simple chart
}

// Sample Risk Zones in Cali, Colombia
export const riskZonesCali: RiskZone[] = [
  // High Risk Zones (5-7)
  { id: 'hr1', center: [3.4400, -76.5200], radius: 700, level: 'high', type: 'Inundación Frecuente', description: 'Zona propensa a inundaciones durante temporada de lluvias intensas.' },
  { id: 'hr2', center: [3.4650, -76.5450], radius: 500, level: 'high', type: 'Deslizamiento de Tierra', description: 'Ladera inestable con historial de deslizamientos.' },
  { id: 'hr3', center: [3.4210, -76.5100], radius: 600, level: 'high', type: 'Actividad Delictiva Alta', description: 'Índices elevados de robos y hurtos reportados.' },
  { id: 'hr4', center: [3.4800, -76.5000], radius: 800, level: 'high', type: 'Contaminación Industrial', description: 'Cercanía a fuentes de emisión contaminante.' },
  { id: 'hr5', center: [3.4000, -76.5500], radius: 550, level: 'high', type: 'Falla Geológica Activa', description: 'Proximidad a falla con actividad sísmica registrada.' },
  // Medium Risk Zones (8-10)
  { id: 'mr1', center: [3.4550, -76.5050], radius: 1000, level: 'medium', type: 'Congestión Vehicular Crítica', description: 'Altos niveles de tráfico en horas pico, riesgo de accidentes.' },
  { id: 'mr2', center: [3.4300, -76.5350], radius: 900, level: 'medium', type: 'Infraestructura Eléctrica Antigua', description: 'Posibilidad de cortes de energía o sobrecargas.' },
  { id: 'mr3', center: [3.4700, -76.5150], radius: 850, level: 'medium', type: 'Deficiencia Drenaje Pluvial', description: 'Acumulación de agua en calles durante lluvias moderadas.' },
  { id: 'mr4', center: [3.4100, -76.5000], radius: 1100, level: 'medium', type: 'Ruido Urbano Elevado', description: 'Niveles de ruido constantes que pueden afectar la salud.' },
  { id: 'mr5', center: [3.4900, -76.5250], radius: 950, level: 'medium', type: 'Escasez Hídrica Ocasional', description: 'Sectores con reportes de interrupciones en el suministro de agua.' },
  { id: 'mr6', center: [3.4250, -76.5550], radius: 800, level: 'medium', type: 'Vientos Fuertes Estacionales', description: 'Ráfagas de viento que pueden causar daños menores.' },
  { id: 'mr7', center: [3.4600, -76.4900], radius: 1000, level: 'medium', type: 'Susceptibilidad a Incendios Forestales (Periferia)', description: 'Cercanía a zonas verdes con riesgo en temporada seca.' },
  { id: 'mr8', center: [3.4050, -76.5280], radius: 750, level: 'medium', type: 'Calidad del Aire Moderada', description: 'Concentraciones de partículas que pueden afectar a personas sensibles.' },
];


// Sample Weather Data for Cali
export const weatherDataCali: WeatherData = {
  current: {
    temperature: 28,
    feelsLike: 30,
    humidity: 75,
    windSpeed: 10,
    condition: 'Parcialmente Nublado',
    icon: Cloud, // Example icon
  },
  hourlyForecast: [
    { time: '13:00', temperature: 28, condition: 'Parcialmente Nublado', icon: Cloud },
    { time: '14:00', temperature: 29, condition: 'Soleado', icon: Sun },
    { time: '15:00', temperature: 30, condition: 'Soleado', icon: Sun },
    { time: '16:00', temperature: 29, condition: 'Posibles Lluvias', icon: Umbrella },
    { time: '17:00', temperature: 27, condition: 'Lluvias Dispersas', icon: Umbrella },
    { time: '18:00', temperature: 26, condition: 'Nublado', icon: Cloud },
    { time: '19:00', temperature: 25, condition: 'Nublado', icon: Cloud },
  ],
  dailyTrend: [ // Sample data for 24h trend
    { hour: 0, temperature: 22 }, { hour: 1, temperature: 21 }, { hour: 2, temperature: 21 },
    { hour: 3, temperature: 20 }, { hour: 4, temperature: 20 }, { hour: 5, temperature: 19 },
    { hour: 6, temperature: 20 }, { hour: 7, temperature: 22 }, { hour: 8, temperature: 24 },
    { hour: 9, temperature: 26 }, { hour: 10, temperature: 27 }, { hour: 11, temperature: 28 },
    { hour: 12, temperature: 29 }, { hour: 13, temperature: 28 }, { hour: 14, temperature: 29 },
    { hour: 15, temperature: 30 }, { hour: 16, temperature: 29 }, { hour: 17, temperature: 27 },
    { hour: 18, temperature: 26 }, { hour: 19, temperature: 25 }, { hour: 20, temperature: 24 },
    { hour: 21, temperature: 23 }, { hour: 22, temperature: 23 }, { hour: 23, temperature: 22 },
  ]
};
