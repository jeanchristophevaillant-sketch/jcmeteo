import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../utils';

interface WeatherIconProps {
  code: number;
  size?: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, size = 24, className }) => {
  // WMO Weather interpretation codes (WW)
  
  // Clear sky
  if (code === 0) {
    return <Icons.Sun size={size} className={cn("text-yellow-500", className)} stroke="#EAB308" />;
  }
  
  // Mainly clear, partly cloudy, and overcast
  if (code <= 3) {
    if (code === 1 || code === 2) {
      // Partly cloudy - Custom multi-color icon
      return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="overflow-visible"
          >
            {/* Sun part - Yellow */}
            <g stroke="#EAB308">
              <path d="M12 2v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="M20 12h2" />
              <path d="m19.07 4.93-1.41 1.41" />
              <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
            </g>
            {/* Cloud part - Gray */}
            <g stroke="#94A3B8">
              <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
            </g>
          </svg>
        </div>
      );
    }
    // Overcast (3)
    return <Icons.Cloud size={size} className={cn("text-slate-400", className)} stroke="#94A3B8" />;
  }
  
  // Fog and depositing rime fog
  if (code <= 48) {
    return <Icons.CloudFog size={size} className={cn("text-slate-400", className)} stroke="#94A3B8" />;
  }
  
  // Drizzle: Light, moderate, and dense intensity
  if (code <= 55) {
    return <Icons.CloudDrizzle size={size} className={cn("text-blue-400", className)} stroke="#60A5FA" />;
  }
  
  // Rain: Slight, moderate and heavy intensity
  if (code <= 65) {
    return <Icons.CloudRain size={size} className={cn("text-blue-500", className)} stroke="#3B82F6" />;
  }
  
  // Snow fall: Slight, moderate, and heavy intensity
  if (code <= 77) {
    return <Icons.CloudSnow size={size} className={cn("text-slate-300", className)} stroke="#CBD5E1" />;
  }
  
  // Rain showers: Slight, moderate, and violent
  if (code <= 82) {
    return <Icons.CloudRain size={size} className={cn("text-blue-500", className)} stroke="#3B82F6" />;
  }
  
  // Snow showers slight and heavy
  if (code <= 86) {
    return <Icons.CloudSnow size={size} className={cn("text-slate-300", className)} stroke="#CBD5E1" />;
  }
  
  // Thunderstorm: Slight or moderate
  if (code >= 95) {
    return <Icons.CloudLightning size={size} className={cn("text-yellow-600", className)} stroke="#CA8A04" />;
  }

  return <Icons.Cloud size={size} className={cn("text-slate-400", className)} />;
};
