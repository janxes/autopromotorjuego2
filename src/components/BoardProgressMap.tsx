import React from 'react';
import { GameState } from '../types/game';
import { Check, Compass, Shield, CloudRain, Wind, HeartPulse, Trophy } from 'lucide-react';

interface BoardProgressMapProps {
  currentLevel: number;
  onSelectLevel?: (level: number) => void;
  state: GameState;
}

const STAGES = [
  {
    level: 0,
    title: 'Calibración',
    subtitle: 'Parcela & Necesidades',
    icon: Compass,
    reward: 'Punto de Partida',
  },
  {
    level: 1,
    title: 'Presupuesto',
    subtitle: 'Notaría & Banco',
    icon: Shield,
    reward: 'Precio Cerrado',
  },
  {
    level: 2,
    title: 'Estructura',
    subtitle: 'Lodo vs Fábrica',
    icon: CloudRain,
    reward: 'Montaje 5 Días',
  },
  {
    level: 3,
    title: 'Hermeticidad',
    subtitle: 'Ventanas & Blower Door',
    icon: Wind,
    reward: 'n50 ≤ 0.6 h⁻¹',
  },
  {
    level: 4,
    title: 'Salud & Aire',
    subtitle: 'VMC Doble Flujo',
    icon: HeartPulse,
    reward: 'Aire F7/HEPA',
  },
  {
    level: 5,
    title: 'Meta a 30 Años',
    subtitle: 'Auditoría & Certificado',
    icon: Trophy,
    reward: 'Ahorro +85.000 €',
  },
];

export const BoardProgressMap: React.FC<BoardProgressMapProps> = ({ currentLevel, state }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 block">
            Tablero de la Odisea
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            Camino de la Parcela al Hogar Passivhaus
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Progreso:</span>
          <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Fase {currentLevel} de 5
          </span>
        </div>
      </div>

      {/* Board track with connector lines */}
      <div className="relative">
        {/* Horizontal connector line on desktop */}
        <div className="hidden md:block absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative z-10">
          {STAGES.map((s) => {
            const isCompleted = state.level > s.level;
            const isCurrent = state.level === s.level;
            const isLocked = state.level < s.level;
            const Icon = s.icon;

            return (
              <div
                key={s.level}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-sm scale-102 ring-2 ring-emerald-600/20'
                    : isCompleted
                    ? 'bg-slate-50 border-emerald-300 text-slate-700'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-70'
                }`}
              >
                {/* Node icon circle */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs mb-2 transition shadow-xs ${
                    isCurrent
                      ? 'bg-emerald-700 text-white animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 text-emerald-700 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                </div>

                <span className="text-xs font-bold text-slate-900 block truncate w-full">
                  {s.level === 0 ? 'Inicio' : `Fase ${s.level}`}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 truncate w-full">
                  {s.title}
                </span>

                <span
                  className={`text-[9px] font-extrabold uppercase mt-1 px-1.5 py-0.5 rounded-md ${
                    isCurrent
                      ? 'bg-emerald-800 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCurrent ? '¡En Juego!' : s.reward}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
