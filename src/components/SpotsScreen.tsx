import React from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Spot } from '../types';
import { MapPin, Trash2, GripVertical, Plus, Save, X } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { cn } from '../utils';

// Fix for default marker icons in Leaflet with Vite
import 'leaflet/dist/leaflet.css';

// Custom marker icon using a divIcon to avoid asset path issues
const createCustomIcon = (color: string = '#2b8cee', size: number = 32) => {
  return L.divIcon({
    html: `<div style="color: ${color}; width: ${size}px; height: ${size}px; display: flex; justify-content: center; align-items: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    className: '', 
    iconSize: [size, size],
    iconAnchor: [size / 2, size * (22 / 24)], 
  });
};

interface SpotsScreenProps {
  spots: Spot[];
  setSpots: React.Dispatch<React.SetStateAction<Spot[]>>;
}

const MapResizer = () => {
  const map = useMap();
  
  React.useEffect(() => {
    // Initial resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // Watch for container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    const container = map.getContainer();
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
};

export default function SpotsScreen({ spots, setSpots }: SpotsScreenProps) {
  const [newSpotName, setNewSpotName] = React.useState('');
  const [selectedCoords, setSelectedCoords] = React.useState<[number, number] | null>(null);
  const [zoom, setZoom] = React.useState(2);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setSelectedCoords([e.latlng.lat, e.latlng.lng]);
      },
      zoomend(e) {
        setZoom(e.target.getZoom());
      }
    });
    return null;
  };

  // Calculate dynamic icon size based on zoom
  // Base size 32 at zoom 10, scales between 16 and 64
  const dynamicSize = Math.max(16, Math.min(64, 24 + (zoom - 2) * 2));
  const defaultIcon = createCustomIcon('#2b8cee', dynamicSize);
  const selectedIcon = createCustomIcon('#ef4444', dynamicSize);

  const handleAddSpot = () => {
    if (!newSpotName || !selectedCoords) return;
    const newSpot: Spot = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSpotName,
      lat: selectedCoords[0],
      lng: selectedCoords[1],
      active: true,
      order: spots.length,
    };
    setSpots([...spots, newSpot]);
    setNewSpotName('');
    setSelectedCoords(null);
  };

  const handleDeleteSpot = (id: string) => {
    setSpots(spots.filter(s => s.id !== id));
  };

  const toggleSpotActive = (id: string) => {
    setSpots(spots.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Gérer mes spots</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-4 space-y-6">
        <section className="space-y-4">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-200 dark:bg-slate-800">
            <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} className="h-full w-full">
              <MapResizer />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler />
              {selectedCoords && (
                <Marker 
                  position={selectedCoords} 
                  icon={selectedIcon} 
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      setSelectedCoords([position.lat, position.lng]);
                    },
                  }}
                />
              )}
              {spots.filter(s => s.active).map(spot => (
                <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={defaultIcon} />
              ))}
            </MapContainer>
          </div>
          
          <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Ajouter un nouveau lieu</p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary px-3 py-2 text-slate-900 dark:text-slate-100"
                placeholder="Nom du spot (ex: Almanarre)"
                type="text"
                value={newSpotName}
                onChange={(e) => setNewSpotName(e.target.value)}
              />
              <button 
                onClick={handleAddSpot}
                disabled={!newSpotName || !selectedCoords}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
            {!selectedCoords && (
              <p className="text-[10px] text-slate-500 mt-1 italic">Cliquez sur la carte pour placer un point</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 dark:text-slate-100 text-base font-bold">Mes lieux enregistrés</h2>
            <span className="text-[10px] text-slate-500 font-medium uppercase">Glisser pour réorganiser</span>
          </div>

          <Reorder.Group axis="y" values={spots} onReorder={setSpots} className="space-y-3">
            {spots.map((spot) => (
              <Reorder.Item
                key={spot.id}
                value={spot}
                className={cn(
                  "flex items-center gap-3 p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl",
                  !spot.active && "opacity-60"
                )}
              >
                <button className="text-slate-400 cursor-grab active:cursor-grabbing">
                  <GripVertical size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-900 dark:text-slate-100 font-semibold truncate text-sm">{spot.name}</h3>
                  <p className="text-xs text-slate-500">
                    {spot.lat.toFixed(2)}°, {spot.lng.toFixed(2)}°
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={spot.active}
                      onChange={() => toggleSpotActive(spot.id)}
                    />
                    <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <button 
                    onClick={() => handleDeleteSpot(spot.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </section>
      </main>
    </div>
  );
}
