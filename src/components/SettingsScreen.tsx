import React from 'react';
import { DisplaySettings } from '../types';
import { 
  Thermometer, 
  ThermometerSnowflake, 
  Sun, 
  Cloud, 
  Wind, 
  Compass, 
  Waves, 
  Navigation, 
  Timer,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '../utils';

interface SettingsScreenProps {
  settings: DisplaySettings;
  setSettings: React.Dispatch<React.SetStateAction<DisplaySettings>>;
}

const ICONS: Record<string, React.ReactNode> = {
  weatherIcon: <Cloud size={20} />,
  temperature: <Thermometer size={20} />,
  apparentTemperature: <ThermometerSnowflake size={20} />,
  windSpeed: <Wind size={20} />,
  windGusts: <Wind size={20} className="opacity-60" />,
  windDirection: <Compass size={20} />,
  waveHeight: <Waves size={20} />,
  waveDirection: <Navigation size={20} />,
  wavePeriod: <Timer size={20} />,
  uvIndex: <Sun size={20} />,
};

export default function SettingsScreen({ settings, setSettings }: SettingsScreenProps) {
  const updateForecastDays = (value: number) => {
    setSettings(prev => ({ ...prev, forecastDays: value }));
  };

  const toggleField = (id: string) => {
    setSettings(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
    }));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...settings.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setSettings(prev => ({ ...prev, fields: newFields }));
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Réglages d'affichage</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 p-4 space-y-6">
        <section className="space-y-4">
          <h3 className="text-primary text-xs font-bold uppercase tracking-wider px-1">Durée des prévisions</h3>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Nombre de jours</span>
              <span className="text-primary font-bold text-sm">{settings.forecastDays} jours</span>
            </div>
            <input
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              max="10"
              min="1"
              type="range"
              value={settings.forecastDays}
              onChange={(e) => updateForecastDays(parseInt(e.target.value))}
            />
            <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
              <span>1 JOUR</span>
              <span>3 JRS</span>
              <span>5 JRS</span>
              <span>7 JRS</span>
              <span>10 JRS</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider">Ordre & Visibilité des colonnes</h3>
            <p className="text-[10px] text-slate-400 italic">Utilisez les flèches pour ordonner</p>
          </div>
          <div className="bg-white dark:bg-slate-800/30 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 shadow-sm border border-slate-100 dark:border-slate-800/50">
            {settings.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 px-3 py-3 justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-primary disabled:opacity-20"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button 
                      onClick={() => moveField(index, 'down')}
                      disabled={index === settings.fields.length - 1}
                      className="p-1 text-slate-400 hover:text-primary disabled:opacity-20"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-8">
                    {ICONS[field.id]}
                  </div>
                  <p className="text-sm font-medium truncate">{field.label}</p>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={field.enabled}
                    onChange={() => toggleField(field.id)}
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors peer-checked:bg-primary"></div>
                  <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform transform shadow-sm peer-checked:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
