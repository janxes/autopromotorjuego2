import React from 'react';
import { GameState } from '../types/game';
import {
  RotateCcw,
  Sparkles,
  BookOpen,
  LineChart,
  Wind,
  Home,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HUDHeaderProps {
  state: GameState;
  activeTab: 'game' | 'lcc' | 'blower' | 'catalog' | 'certificate';
  setActiveTab: (tab: 'game' | 'lcc' | 'blower' | 'catalog' | 'certificate') => void;
  onRestart: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  state,
  activeTab,
  setActiveTab,
  onRestart,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  isSpeaking,
  onToggleSpeech,
}) => {
  const formatoEuros = (val: number) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';

  const desvioSign = state.desvioAcumuladoEuros > 0 ? '+' : '';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      {/* Top 3-Zone Clean Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('game');
              }}
              className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 hover:text-emerald-700 transition"
            >
              La Odisea del Autopromotor
            </a>
            <span className="hidden lg:inline text-xs text-slate-500 font-normal ml-2">
              · De la Parcela al Hogar Passivhaus
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single line) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('game')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'game'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Aventura RPG
          </button>

          <button
            onClick={() => setActiveTab('lcc')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'lcc'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Coste a 30 Años (LCC)
          </button>

          <button
            onClick={() => setActiveTab('blower')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'blower'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Test Blower Door
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Catálogo Viviendas
          </button>
        </nav>

        {/* Zone 3: Accessibility Toolbar & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio speech reader */}
          <button
            onClick={onToggleSpeech}
            title={isSpeaking ? 'Detener lectura en voz alta' : 'Escuchar en voz alta'}
            aria-label={isSpeaking ? 'Detener lectura' : 'Escuchar narración'}
            className={`p-2 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              isSpeaking
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
            <span className="hidden xl:inline text-xs font-semibold">
              {isSpeaking ? 'Detener' : 'Escuchar'}
            </span>
          </button>

          {/* Font Size Selector */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs font-bold text-slate-700">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-white shadow-xs text-emerald-800' : 'hover:text-black'}`}
              title="Tamaño normal de texto"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded text-sm ${fontSize === 'large' ? 'bg-white shadow-xs text-emerald-800' : 'hover:text-black'}`}
              title="Tamaño grande de texto"
            >
              A+
            </button>
          </div>

          {/* High contrast toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Alternar contraste accesible"
            aria-label="Alternar alto contraste"
            className={`p-2 rounded-lg border text-xs transition ${
              highContrast
                ? 'bg-black text-white border-black font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset button */}
          <button
            onClick={onRestart}
            title="Reiniciar partida"
            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav pills */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-3 py-2 bg-slate-50 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('game')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'game' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600'}`}
        >
          Aventura
        </button>
        <button
          onClick={() => setActiveTab('lcc')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'lcc' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600'}`}
        >
          LCC 30 Años
        </button>
        <button
          onClick={() => setActiveTab('blower')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'blower' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600'}`}
        >
          Blower Door
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'catalog' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600'}`}
        >
          Catálogo
        </button>
      </div>

      {/* Spacious, Highly Legible Dashboard Strip */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Presupuesto */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Presupuesto Restante</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {formatoEuros(state.presupuestoRestante)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {state.desvioAcumuladoEuros === 0 ? (
                <span className="text-emerald-700 font-semibold">Desvío: 0 €</span>
              ) : (
                <span className="text-rose-700 font-semibold">
                  {desvioSign}{formatoEuros(state.desvioAcumuladoEuros)} ({state.desvioAcumuladoPorcentaje.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>

          {/* 2. Plazos */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Tiempo Transcurrido</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Semana {state.tiempoSemanas}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Plazo previsto: Semana {state.tiempoPrevistoSemanas}
            </div>
          </div>

          {/* 3. Estrés */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Salud Mental / Estrés</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                  state.estresPorcentaje <= 20
                    ? 'bg-emerald-100 text-emerald-900'
                    : state.estresPorcentaje <= 45
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-900 animate-pulse'
                }`}
              >
                {state.estresPorcentaje}%
              </span>
            </div>

            {/* Visual stress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  state.estresPorcentaje <= 20
                    ? 'bg-emerald-600'
                    : state.estresPorcentaje <= 45
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, state.estresPorcentaje))}%` }}
              />
            </div>

            <div className="text-[11px] font-semibold text-slate-700 truncate mt-1.5" title={state.estadoEstres}>
              {state.estresPorcentaje <= 20 ? '🧘 ' : state.estresPorcentaje <= 45 ? '⚡ ' : '🔥 '}
              {state.estadoEstres}
            </div>
          </div>

          {/* 4. Factura Energética */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Factura Energética</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {state.facturaEnergeticaMes} €/mes
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {state.facturaEnergeticaMes <= 45 ? 'Consumo casi nulo (Passiv)' : 'Sobrecoste en calefacción'}
            </div>
          </div>

          {/* 5. Confort y Salubridad */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-slate-500 block">Confort y Aire Interior</span>
            <div className="text-sm sm:text-base font-bold text-emerald-800 mt-0.5 truncate" title={state.confortYAire}>
              {state.confortYAire}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Hermeticidad n50: {state.blowerDoorN50} h⁻¹
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
