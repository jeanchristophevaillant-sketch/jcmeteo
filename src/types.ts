import { LucideIcon } from "lucide-react";

export interface Spot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  active: boolean;
  order: number;
}

export interface SettingField {
  id: string;
  label: string;
  enabled: boolean;
}

export interface DisplaySettings {
  fields: SettingField[];
  forecastDays: number;
}

export interface WeatherData {
  daily?: {
    time: string[];
    temperature_2m_max?: number[];
    apparent_temperature_max?: number[];
    uv_index_max?: number[];
    weather_code?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    wind_direction_10m_dominant?: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    uv_index?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
    wind_gusts_10m?: number[];
    wind_direction_10m?: number[];
  };
  marine?: {
    daily: {
      time: string[];
      wave_height_max?: number[];
      wave_direction_dominant?: number[];
      wave_period_max?: number[];
    };
    hourly?: {
      time: string[];
      wave_height?: number[];
      wave_direction?: number[];
      wave_period?: number[];
    };
  };
}

export interface Alert {
  id: string;
  spotId: string;
  minWindSpeed: number;
  maxWindSpeed: number;
  allowedDirections: number[]; // Array of indices 0-15 representing 16 compass points
  active: boolean;
}

export type Screen = "forecasts" | "spots" | "settings" | "alerts";
