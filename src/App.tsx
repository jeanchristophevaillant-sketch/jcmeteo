import React from 'react';
import { Spot, DisplaySettings, Screen, Alert, SettingField } from './types';
import ForecastScreen from './components/ForecastScreen';
import SpotsScreen from './components/SpotsScreen';
import SettingsScreen from './components/SettingsScreen';
import AlertsScreen from './components/AlertsScreen';
import Navigation from './components/Navigation';

const DEFAULT_SPOTS: Spot[] = [
  { id: '1', name: 'Tarifa - Los Lances', lat: 36.0143, lng: -5.6044, active: true, order: 0 },
  { id: '2', name: 'Hookipa Beach', lat: 20.9333, lng: -156.3667, active: true, order: 1 },
];

const DEFAULT_FIELDS: SettingField[] = [
  { id: 'weatherIcon', label: 'Météo', enabled: true },
  { id: 'temperature', label: 'Temp.', enabled: true },
  { id: 'apparentTemperature', label: 'Ressenti', enabled: true },
  { id: 'windSpeed', label: 'Vent', enabled: true },
  { id: 'windGusts', label: 'Rafales', enabled: true },
  { id: 'windDirection', label: 'Dir. Vent', enabled: true },
  { id: 'waveHeight', label: 'Houle', enabled: true },
  { id: 'waveDirection', label: 'Dir. Houle', enabled: true },
  { id: 'wavePeriod', label: 'Période', enabled: true },
  { id: 'uvIndex', label: 'UV', enabled: false },
];

const DEFAULT_SETTINGS: DisplaySettings = {
  fields: DEFAULT_FIELDS,
  forecastDays: 7,
};

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('forecasts');
  const [spots, setSpots] = React.useState<Spot[]>(() => {
    const saved = localStorage.getItem('spots');
    return saved ? JSON.parse(saved) : DEFAULT_SPOTS;
  });
  const [settings, setSettings] = React.useState<DisplaySettings>(() => {
    const saved = localStorage.getItem('settings');
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      // Migration: if it's the old format (booleans), convert to the new format (fields array)
      if (parsed.showTemperature !== undefined) {
        return {
          forecastDays: parsed.forecastDays || 7,
          fields: [
            { id: 'weatherIcon', label: 'Météo', enabled: parsed.showWeatherIcon ?? true },
            { id: 'temperature', label: 'Temp.', enabled: parsed.showTemperature ?? true },
            { id: 'apparentTemperature', label: 'Ressenti', enabled: parsed.showApparentTemperature ?? true },
            { id: 'windSpeed', label: 'Vent', enabled: parsed.showWindSpeed ?? true },
            { id: 'windGusts', label: 'Rafales', enabled: true },
            { id: 'windDirection', label: 'Dir. Vent', enabled: parsed.showWindDirection ?? true },
            { id: 'waveHeight', label: 'Houle', enabled: parsed.showWaveHeight ?? true },
            { id: 'waveDirection', label: 'Dir. Houle', enabled: parsed.showWaveDirection ?? true },
            { id: 'wavePeriod', label: 'Période', enabled: parsed.showWavePeriod ?? true },
            { id: 'uvIndex', label: 'UV', enabled: parsed.showUVIndex ?? false },
          ]
        };
      }
      // Migration: ensure windGusts exists in fields
      if (parsed.fields && !parsed.fields.find((f: any) => f.id === 'windGusts')) {
        const fields = [...parsed.fields];
        const windIdx = fields.findIndex(f => f.id === 'windSpeed');
        fields.splice(windIdx + 1, 0, { id: 'windGusts', label: 'Rafales', enabled: true });
        return { ...parsed, fields };
      }
      return parsed;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });
  const [alerts, setAlerts] = React.useState<Alert[]>(() => {
    const saved = localStorage.getItem('alerts');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Migration: ensure all alerts have allowedDirections
      return parsed.map((alert: any) => ({
        ...alert,
        allowedDirections: alert.allowedDirections || []
      }));
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('spots', JSON.stringify(spots));
  }, [spots]);

  React.useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    localStorage.setItem('alerts', JSON.stringify(alerts));
  }, [alerts]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex justify-center">
      <div className="relative w-full bg-white dark:bg-background-dark overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          {currentScreen === 'forecasts' && <ForecastScreen spots={spots} settings={settings} alerts={alerts} />}
          {currentScreen === 'spots' && <SpotsScreen spots={spots} setSpots={setSpots} />}
          {currentScreen === 'settings' && <SettingsScreen settings={settings} setSettings={setSettings} />}
          {currentScreen === 'alerts' && (
            <AlertsScreen 
              spots={spots} 
              alerts={alerts} 
              setAlerts={setAlerts} 
              onBack={() => setCurrentScreen('forecasts')} 
            />
          )}
        </div>
        <Navigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      </div>
    </div>
  );
}
