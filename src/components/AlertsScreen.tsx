import React from 'react';
import { Spot, Alert } from '../types';
import { Bell, Trash2, Plus, X, Wind, Compass } from 'lucide-react';
import { cn } from '../utils';

interface AlertsScreenProps {
  spots: Spot[];
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  onBack: () => void;
}

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'
];

export default function AlertsScreen({ spots, alerts, setAlerts, onBack }: AlertsScreenProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingAlertId, setEditingAlertId] = React.useState<string | null>(null);
  const [newAlert, setNewAlert] = React.useState<Partial<Alert>>({
    spotId: spots[0]?.id || '',
    minWindSpeed: 15,
    maxWindSpeed: 30,
    allowedDirections: [],
    active: true
  });

  const handleAddAlert = () => {
    if (!newAlert.spotId || (newAlert.allowedDirections?.length || 0) === 0) return;
    
    if (editingAlertId) {
      setAlerts(alerts.map(a => a.id === editingAlertId ? {
        ...a,
        spotId: newAlert.spotId as string,
        minWindSpeed: newAlert.minWindSpeed || 0,
        maxWindSpeed: newAlert.maxWindSpeed || 100,
        allowedDirections: newAlert.allowedDirections || [],
      } : a));
    } else {
      const alert: Alert = {
        id: Math.random().toString(36).substr(2, 9),
        spotId: newAlert.spotId as string,
        minWindSpeed: newAlert.minWindSpeed || 0,
        maxWindSpeed: newAlert.maxWindSpeed || 100,
        allowedDirections: newAlert.allowedDirections || [],
        active: true
      };
      setAlerts([...alerts, alert]);
    }

    setIsAdding(false);
    setEditingAlertId(null);
    resetForm();
  };

  const resetForm = () => {
    setNewAlert({
      spotId: spots[0]?.id || '',
      minWindSpeed: 15,
      maxWindSpeed: 30,
      allowedDirections: [],
      active: true
    });
  };

  const handleEditAlert = (alert: Alert) => {
    setNewAlert({
      spotId: alert.spotId,
      minWindSpeed: alert.minWindSpeed,
      maxWindSpeed: alert.maxWindSpeed,
      allowedDirections: alert.allowedDirections,
      active: alert.active
    });
    setEditingAlertId(alert.id);
    setIsAdding(true);
  };

  const toggleDirection = (idx: number) => {
    const current = newAlert.allowedDirections || [];
    if (current.includes(idx)) {
      setNewAlert({ ...newAlert, allowedDirections: current.filter(i => i !== idx) });
    } else {
      setNewAlert({ ...newAlert, allowedDirections: [...current, idx] });
    }
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const toggleAlertActive = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
          <X size={20} />
        </button>
        <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Mes Alertes</h1>
        <button 
          onClick={() => {
            resetForm();
            setEditingAlertId(null);
            setIsAdding(true);
          }}
          className="p-2 -mr-2 text-primary"
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-4 space-y-6">
        {isAdding && (
          <div className="bg-white dark:bg-slate-900/50 border border-primary/30 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingAlertId ? "Modifier l'alerte" : "Nouvelle Alerte"}
              </h2>
              <button onClick={() => {
                setIsAdding(false);
                setEditingAlertId(null);
              }} className="text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Choisir un spot</label>
                <select 
                  value={newAlert.spotId}
                  onChange={(e) => setNewAlert({...newAlert, spotId: e.target.value})}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100"
                >
                  {spots.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Vent Min (nds)</label>
                  <input 
                    type="number"
                    value={newAlert.minWindSpeed}
                    onChange={(e) => setNewAlert({...newAlert, minWindSpeed: parseInt(e.target.value)})}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Vent Max (nds)</label>
                  <input 
                    type="number"
                    value={newAlert.maxWindSpeed}
                    onChange={(e) => setNewAlert({...newAlert, maxWindSpeed: parseInt(e.target.value)})}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Orientation du vent (Secteurs)</label>
                <div className="grid grid-cols-4 gap-2">
                  {COMPASS_POINTS.map((point, idx) => (
                    <button
                      key={point}
                      onClick={() => toggleDirection(idx)}
                      className={cn(
                        "py-2 rounded-lg text-[10px] font-bold border transition-all",
                        (newAlert.allowedDirections || []).includes(idx)
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                      )}
                    >
                      {point}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddAlert}
                disabled={!newAlert.spotId || (newAlert.allowedDirections?.length || 0) === 0}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {editingAlertId ? "Enregistrer les modifications" : "Créer l'alerte"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500">Aucune alerte configurée.</p>
              <button 
                onClick={() => {
                  resetForm();
                  setEditingAlertId(null);
                  setIsAdding(true);
                }}
                className="mt-4 text-primary font-bold text-sm"
              >
                Créer ma première alerte
              </button>
            </div>
          ) : (
            alerts.map(alert => {
              const spot = spots.find(s => s.id === alert.spotId);
              return (
                <div 
                  key={alert.id}
                  onClick={() => handleEditAlert(alert)}
                  className={cn(
                    "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:border-primary/30",
                    !alert.active && "opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{spot?.name || 'Spot inconnu'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Conditions souhaitées</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={alert.active}
                          onChange={() => toggleAlertActive(alert.id)}
                        />
                        <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAlert(alert.id);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Wind size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Vent</p>
                        <p className="text-xs font-bold">{alert.minWindSpeed}-{alert.maxWindSpeed} nds</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Compass size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Directions</p>
                        <p className="text-[10px] font-bold truncate">
                          {(alert.allowedDirections || []).map(i => COMPASS_POINTS[i]).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
