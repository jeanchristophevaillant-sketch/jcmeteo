import React from 'react';
import { Screen } from '../types';
import { CloudRain, MapPin, Settings, Bell } from 'lucide-react';
import { cn } from '../utils';

interface NavigationProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

export default function Navigation({ currentScreen, setCurrentScreen }: NavigationProps) {
  const navItems: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'forecasts', label: 'Prévisions', icon: <CloudRain size={24} /> },
    { id: 'spots', label: 'Spots', icon: <MapPin size={24} /> },
    { id: 'alerts', label: 'Alertes', icon: <Bell size={24} /> },
    { id: 'settings', label: 'Réglages', icon: <Settings size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg px-4 pb-6 pt-2 z-50">
      <div className="flex gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              currentScreen === item.id ? "text-primary" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <div className="flex h-8 items-center justify-center">
              {item.icon}
            </div>
            <p className="text-[10px] font-medium leading-normal">{item.label}</p>
          </button>
        ))}
      </div>
    </nav>
  );
}
