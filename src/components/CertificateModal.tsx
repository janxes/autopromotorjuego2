import React, { useEffect } from 'react';
import { GameState } from '../types/game';
import confetti from 'canvas-confetti';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  Sparkles,
  Trees,
  TrendingUp,
  HeartPulse,
} from 'lucide-react';

interface CertificateModalProps {
  state: GameState;
  onRestart: () => void;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  state,
  onRestart,
  onClose,
}) => {
  const isPassivhausHero =
    state.confortPuntos >= 75 &&
    state.desvioAcumuladoPorcentaje <= 5 &&
    state.tiempoSemanas <= 30;

  useEffect(() => {
    if (isPassivhausHero) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isPassivhausHero]);

  const formatoEuros = (val: number) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';

  const rankTitle = isPassivhausHero
    ? '🏆 VISIONARIO PASSIVHAUS & MAESTRO DE LA INDUSTRIALIZACIÓN'
    : state.desvioAcumuladoPorcentaje > 15
    ? '🏚️ SUPERVIVIENTE HIPOTECADO CON PATOLOGÍAS Y ROZAS'
    : '⚖️ AUTOPROMOTOR PRAGMÁTICO (EN APRENDIZAJE)';

  const desvioSign = state.desvioAcumuladoEuros >= 0 ? '+' : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Diploma Card */}
      <div className="bg-white border-4 border-amber-900/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-800">
        {/* Decorative corner borders */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-700/60" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-700/60" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-700/60" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-700/60" />

        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-800 shadow-md">
            <Award className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-widest uppercase text-amber-800 font-bold">
              Tribunal Oficial del Game Master
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
              CERTIFICADO DE IDONEIDAD DEL AUTOPROMOTOR
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Evaluación Técnica sobre Edificación Industrializada, Madera Técnica y Estándar Passivhaus
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-block bg-slate-900 text-amber-300 font-mono font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow">
              {rankTitle}
            </span>
          </div>
        </div>

        {/* 3 Dolores Evaluation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
          {/* Dolor 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
              1. Control Presupuestario
            </span>
            <span
              className={`text-xl font-black font-mono block ${
                state.desvioAcumuladoPorcentaje <= 3
                  ? 'text-emerald-700'
                  : state.desvioAcumuladoPorcentaje <= 10
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {desvioSign}
              {state.desvioAcumuladoPorcentaje.toFixed(1)}% Desvío
            </span>
            <span className="text-[11px] text-slate-600 block">
              {state.desvioAcumuladoPorcentaje <= 3
                ? 'Contrato cerrado llave en mano respetado.'
                : `Sobrecoste de ${formatoEuros(state.desvioAcumuladoEuros)} en partidas abiertas.`}
            </span>
          </div>

          {/* Dolor 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
              2. Plazos y Montaje en Seco
            </span>
            <span className="text-xl font-black font-mono text-sky-800 block">
              Semana {state.tiempoSemanas}
            </span>
            <span className="text-[11px] text-slate-600 block">
              {state.tiempoSemanas <= 28
                ? 'Montaje récord en seco con grúa sin tiempos muertos por lluvia.'
                : 'Retrasos por fraguado, lluvia y descoordinación de gremios.'}
            </span>
          </div>

          {/* Dolor 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
              3. Confort Passivhaus y LCC
            </span>
            <span
              className={`text-xl font-black font-mono block ${
                state.confortPuntos >= 75 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {Math.round(state.confortPuntos)}/100 Pts
            </span>
            <span className="text-[11px] text-slate-600 block">
              Blower Door n50: {state.blowerDoorN50} h⁻¹ |{' '}
              {state.vmcInstalado ? 'VMC activa (0 moho)' : 'Ventilación natural precaria'}
            </span>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="mt-6 bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs space-y-2">
          <div className="flex justify-between border-b border-slate-800 pb-2 text-emerald-400 font-bold">
            <span>MÉTRICA FINAL</span>
            <span>RESULTADO ALCANZADO</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Presupuesto inicial / Gastado:</span>
            <span>
              {formatoEuros(state.presupuestoInicial)} /{' '}
              {formatoEuros(state.presupuestoInicial - state.presupuestoRestante)}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Salud Mental y Estrés final:</span>
            <span
              className={
                state.estresPorcentaje < 40 ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              {state.estresBarra} ({state.estadoEstres})
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Huella ecológica neta:</span>
            <span className={state.huellaCarbono <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
              {state.huellaCarbono <= 0
                ? `${state.huellaCarbono.toFixed(1)} tCO2 fijadas en madera (Sumidero)`
                : `+${state.huellaCarbono.toFixed(1)} tCO2 emitidas en hormigón/ladrillo`}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Modelo Constructivo Definitivo:</span>
            <span className="text-amber-300 font-bold">{state.modeloConstructivo}</span>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Certificado</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
            >
              <span>Volver a la Aventura</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl shadow transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar Otra Partida</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
