import React from 'react';
import { Spot, DisplaySettings, WeatherData, Alert } from '../types';
import { fetchWeather } from '../services/weatherService';
import * as Icons from 'lucide-react';
import { cn } from '../utils';
import { WeatherIcon } from './WeatherIcon';

interface ForecastScreenProps {
  spots: Spot[];
  settings: DisplaySettings;
  alerts: Alert[];
}

const getDirectionName = (degree: number) => {
  const directions = [
    'Nord', 'Nord-Nord-Est', 'Nord-Est', 'Est-Nord-Est', 
    'Est', 'Est-Sud-Est', 'Sud-Est', 'Sud-Sud-Est', 
    'Sud', 'Sud-Sud-Ouest', 'Sud-Ouest', 'Ouest-Sud-Ouest', 
    'Ouest', 'Ouest-Nord-Ouest', 'Nord-Ouest', 'Nord-Nord-Ouest'
  ];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
};

export default function ForecastScreen({ spots, settings, alerts }: ForecastScreenProps) {
  const [weatherData, setWeatherData] = React.useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = React.useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = React.useState(0);

  React.useEffect(() => {
    const activeSpots = spots.filter(s => s.active);
    if (activeSpots.length === 0) {
      setLoading(false);
      return;
    }

    const loadWeather = async () => {
      setLoading(true);
      const data: Record<string, WeatherData> = {};
      await Promise.all(activeSpots.map(async (spot) => {
        try {
          const res = await fetchWeather(spot.lat, spot.lng, settings.forecastDays);
          data[spot.id] = res;
        } catch (e) {
          console.error(e);
        }
      }));
      setWeatherData(data);
      setLoading(false);
    };

    loadWeather();
  }, [spots, settings.forecastDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Icons.Loader2 className="animate-spin text-slate-400" size={48} />
      </div>
    );
  }

  const activeSpots = spots.filter(s => s.active);
  
  // Get dates from the first available spot data
  const firstSpotId = Object.keys(weatherData)[0];
  const dates = weatherData[firstSpotId]?.daily?.time || [];

  // Check for triggered alerts
  interface TriggeredAlert {
    time: string;
    message: string;
  }
  
  const triggeredAlertsList: TriggeredAlert[] = [];
  alerts.filter(a => a.active).forEach(alert => {
    const spot = spots.find(s => s.id === alert.spotId);
    const data = weatherData[alert.spotId];
    if (spot && data?.hourly) {
      // Group by day to avoid duplicate alerts for the same day, or just show the best hour?
      // Actually, let's just find all matching hours and list them.
      const matchingHoursByDay: Record<string, number[]> = {};
      
      data.hourly.time.forEach((time, i) => {
        const rawWindSpeed = data.hourly?.wind_speed_10m?.[i] || 0;
        const windSpeed = Math.round(rawWindSpeed);
        const windDir = data.hourly?.wind_direction_10m?.[i] || 0;
        const hour = new Date(time).getHours();
        
        // Only consider daytime hours for alerts (8h - 20h)
        if (hour < 8 || hour > 20) return;

        const sectorIdx = Math.round(windDir / 22.5) % 16;
        
        if (
          windSpeed >= alert.minWindSpeed && 
          windSpeed <= alert.maxWindSpeed &&
          (alert.allowedDirections || []).includes(sectorIdx)
        ) {
          const dateKey = time.split('T')[0];
          if (!matchingHoursByDay[dateKey]) matchingHoursByDay[dateKey] = [];
          matchingHoursByDay[dateKey].push(i);
        }
      });

      Object.entries(matchingHoursByDay).forEach(([dateKey, indices]) => {
        const date = new Date(dateKey);
        const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        
        // Get the hours as strings
        const hoursStr = indices.map(idx => {
          const t = new Date(data.hourly.time[idx]);
          return t.getHours() + 'h';
        }).join(', ');

        // Find max wind speed in these hours for the message
        const maxWind = Math.max(...indices.map(idx => data.hourly.wind_speed_10m[idx]));
        const avgDir = indices[0] !== undefined ? data.hourly.wind_direction_10m[indices[0]] : 0;

        triggeredAlertsList.push({
          time: dateKey,
          message: `Alerte ${spot.name} : ${Math.round(maxWind)} nds (${getDirectionName(avgDir)}) prévu le ${dateStr} à ${hoursStr}.`
        });
      });
    }
  });

  // Sort by date
  const sortedAlerts = triggeredAlertsList.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 flex flex-col bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="size-10" />
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">Prévisions Spots</h1>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Météo Marine</p>
          </div>
          <div className="size-10" />
        </div>

        {/* Date Selection Bar */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4 pt-2 overscroll-x-contain">
          {dates.map((time, i) => {
            const date = new Date(time);
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            const isSelected = selectedDateIndex === i;

            return (
              <button
                key={time}
                onClick={() => setSelectedDateIndex(i)}
                className={cn(
                  "flex flex-col items-center min-w-[60px] py-2 rounded-xl border transition-all",
                  isSelected 
                    ? "bg-primary text-white border-primary shadow-md scale-105" 
                    : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500"
                )}
              >
                <span className="text-[10px] font-bold uppercase">
                  {i === 0 ? "Auj." : dayName}
                </span>
                <span className="text-xs font-bold mt-1">
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {/* Triggered Alerts Section */}
        {sortedAlerts.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/20 border-y border-slate-100 dark:border-slate-800 py-3 px-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Icons.BellRing size={16} className="text-slate-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Alertes ({settings.forecastDays} jours)
              </span>
            </div>
            <div className="space-y-2">
              {sortedAlerts.slice(0, 5).map((alert, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              ))}
              {sortedAlerts.length > 5 && (
                <p className="text-[10px] text-slate-400 italic">+{sortedAlerts.length - 5} autres alertes...</p>
              )}
            </div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {activeSpots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Aucun spot actif. Ajoutez des spots dans l'onglet Spots.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeSpots.map(spot => {
                const data = weatherData[spot.id];
                if (!data) return null;

                return (
                  <SpotCard 
                    key={spot.id} 
                    spot={spot} 
                    data={data} 
                    settings={settings} 
                    dateIndex={selectedDateIndex} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface SpotCardProps {
  spot: Spot;
  data: WeatherData;
  settings: DisplaySettings;
  dateIndex: number;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, data, settings, dateIndex }) => {
  const daily = data.daily;
  const hourly = data.hourly;
  const marineDaily = data.marine?.daily;
  const marineHourly = data.marine?.hourly;

  if (!daily || !hourly) return null;

  // Filter hourly data for the selected date
  const selectedDateStr = daily.time[dateIndex];
  const hourlyIndices = hourly.time.reduce((acc: number[], time, idx) => {
    if (time.startsWith(selectedDateStr)) acc.push(idx);
    return acc;
  }, []);

  const activeFields = settings.fields.filter(f => f.enabled);

  // Calculate daily averages for wind (for the selected day)
  const dayWindSpeeds = hourlyIndices.map(idx => hourly.wind_speed_10m?.[idx] || 0);
  const avgWindSpeed = dayWindSpeeds.length > 0 ? dayWindSpeeds.reduce((a, b) => a + b, 0) / dayWindSpeeds.length : 0;
  const avgWindDir = daily.wind_direction_10m_dominant?.[dateIndex] || 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Spot Header */}
      <div className="p-4 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/20">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{spot.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              <Icons.Wind size={12} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500">{Math.round(avgWindSpeed)} nds</span>
              <Icons.Navigation 
                size={10} 
                className="text-slate-400" 
                style={{ transform: `rotate(${(avgWindDir + 180) % 360}deg)` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400">{spot.lat.toFixed(2)}°, {spot.lng.toFixed(2)}°</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WeatherIcon code={daily.weather_code?.[dateIndex] || 0} size={24} />
          <Icons.Star className="text-slate-300 dark:text-slate-600" size={20} />
        </div>
      </div>

      {/* Hourly Forecast Table */}
      <div className="overflow-x-auto no-scrollbar overscroll-x-contain">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800">
              <th className="py-2 px-3 text-[10px] font-bold uppercase text-slate-400">Heure</th>
              {activeFields.map(field => (
                <th key={field.id} className="py-2 px-3 text-[10px] font-bold uppercase text-slate-400 text-center">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hourlyIndices.map((idx) => {
              const time = new Date(hourly.time[idx]);
              const hour = time.getHours().toString().padStart(2, '0') + ':00';
              const windSpeed = hourly.wind_speed_10m?.[idx] || 0;
              
              // Filter: only show between 8h and 20h
              if (time.getHours() < 8 || time.getHours() > 20) return null;

              return (
                <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="py-2 px-3 text-[10px] font-bold text-slate-500">{hour}</td>
                  {activeFields.map(field => {
                    switch (field.id) {
                      case 'weatherIcon':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center">
                            <div className="flex justify-center">
                              <WeatherIcon code={hourly.weather_code?.[idx] || 0} size={16} />
                            </div>
                          </td>
                        );
                      case 'temperature':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center text-xs font-bold">
                            {Math.round(hourly.temperature_2m?.[idx] || 0)}°
                          </td>
                        );
                      case 'apparentTemperature':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center text-[10px] text-slate-400">
                            {Math.round(hourly.apparent_temperature?.[idx] || 0)}°
                          </td>
                        );
                      case 'windSpeed':
                        let windColorClass = "text-slate-900 dark:text-slate-100";
                        if (windSpeed >= 13 && windSpeed < 20) windColorClass = "text-green-600 font-bold";
                        else if (windSpeed >= 20 && windSpeed < 30) windColorClass = "text-yellow-600 font-bold";
                        else if (windSpeed >= 30 && windSpeed < 40) windColorClass = "text-orange-600 font-bold";
                        else if (windSpeed >= 40) windColorClass = "text-red-600 font-bold";
                        return (
                          <td key={field.id} className={cn("py-2 px-3 text-center text-xs", windColorClass)}>
                            {Math.round(windSpeed)}
                          </td>
                        );
                      case 'windGusts':
                        const windGust = hourly.wind_gusts_10m?.[idx] || 0;
                        return (
                          <td key={field.id} className="py-2 px-3 text-center text-[10px] font-bold text-orange-500">
                            {Math.round(windGust)}
                          </td>
                        );
                      case 'windDirection':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center">
                            <div className="flex justify-center">
                              <Icons.Navigation 
                                size={12} 
                                className="text-slate-400" 
                                style={{ transform: `rotate(${( (hourly.wind_direction_10m?.[idx] || 0) + 180) % 360}deg)` }} 
                              />
                            </div>
                          </td>
                        );
                      case 'waveHeight':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center text-xs font-bold text-slate-500">
                            {marineHourly?.wave_height?.[idx]?.toFixed(1) || '-'}m
                          </td>
                        );
                      case 'waveDirection':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center">
                            <div className="flex justify-center">
                              {marineHourly?.wave_direction?.[idx] !== undefined && (
                                <Icons.ArrowUp 
                                  size={12} 
                                  className="text-slate-400" 
                                  style={{ transform: `rotate(${(marineHourly.wave_direction[idx] + 180) % 360}deg)` }} 
                                />
                              )}
                            </div>
                          </td>
                        );
                      case 'wavePeriod':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center text-[10px] font-medium text-slate-500">
                            {Math.round(marineHourly?.wave_period?.[idx] || 0)}s
                          </td>
                        );
                      case 'uvIndex':
                        return (
                          <td key={field.id} className="py-2 px-3 text-center text-[10px] font-medium text-yellow-600">
                            {hourly.uv_index?.[idx]?.toFixed(1) || '-'}
                          </td>
                        );
                      default:
                        return <td key={field.id}></td>;
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
