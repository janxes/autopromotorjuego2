import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState, TurnMessage, ChoiceOption, DiceOutcome } from '../types/game';
import { GAME_SCENARIOS_V2, CHECKLIST_PREGUNTAS_TRAMPA } from '../utils/gameLogic';
import { playVictorySound, playClickSound } from '../utils/audio';
import { BoardProgressMap } from './BoardProgressMap';
import { InteractiveDice } from './InteractiveDice';
import {
  ShieldCheck,
  Dices,
  Sparkles,
  RotateCcw,
  Building,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  ArrowRight,
  Target,
  Zap,
  TrendingDown,
  Clock,
  HeartPulse,
  Flame,
  Award,
} from 'lucide-react';

interface GameNarrativeViewProps {
  state: GameState;
  messages: TurnMessage[];
  currentChoices: ChoiceOption[];
  onSelectChoice: (choice: ChoiceOption) => void;
  onSubmitCustomMessage: (message: string) => void;
  onRewindChoice: () => void;
  onDiceRollOutcome?: (outcome: DiceOutcome) => void;
  isLoading: boolean;
  onOpenLCC: () => void;
  onOpenCatalog: () => void;
  onSpeakText?: (text: string) => void;
}

export const GameNarrativeView: React.FC<GameNarrativeViewProps> = ({
  state,
  messages,
  currentChoices,
  onSelectChoice,
  onSubmitCustomMessage,
  onRewindChoice,
  onDiceRollOutcome,
  isLoading,
  onOpenLCC,
  onOpenCatalog,
  onSpeakText,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const currentScenario = GAME_SCENARIOS_V2[state.level] || GAME_SCENARIOS_V2[1];

  // Fire confetti on victory / final level
  useEffect(() => {
    if (state.gameOver && state.gameVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  }, [state.gameOver, state.gameVictory]);

  const handleSelectPassivhaus = (choice: ChoiceOption) => {
    playVictorySound();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // ignore
    }
    onSelectChoice(choice);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isLoading) return;
    playClickSound();
    onSubmitCustomMessage(customInput.trim());
    setCustomInput('');
  };

  const formatoEuros = (val: number) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';

  const passivhausChoice = currentChoices.find((c) => c.recommended || c.letter === 'B');
  const traditionalChoice = currentChoices.find((c) => c.isBadDecision || c.letter === 'A');
  const rewindChoice = currentChoices.find((c) => c.isRewindAction);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Visual Board Progress Map */}
      <BoardProgressMap currentLevel={state.level} state={state} />

      {/* 2. Calibration Stage (Level 0) */}
      {state.level === 0 && (
        <section className="bg-white border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Paso 0: Calibra Tu Aventura
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¿Dónde vas a construir tu futuro hogar?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Dispones de <strong>250.000 €</strong> y la parcela escriturada. Elige el clima para calibrar
              el aislamiento térmico, la radiación solar y la demanda energética Passivhaus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {currentChoices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => {
                  playClickSound();
                  onSelectChoice(choice);
                }}
                disabled={isLoading}
                className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all duration-200 group flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs group-hover:bg-emerald-700 transition">
                    📍
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-800 transition">
                    {choice.label}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{choice.description}</p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Seleccionar entorno</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Main Gameplay Stages (Levels 1 to 4): Binary Duel & Interactive Dice */}
      {state.level >= 1 && state.level <= 4 && !state.gameOver && (
        <div className="space-y-6">
          {/* Phase Mission Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-lg flex items-center justify-center border border-emerald-500/30 shrink-0">
                  {state.level}
                </span>
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                    {currentScenario.badge}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentScenario.faseNombre}
                  </h2>
                </div>
              </div>

              {onSpeakText && (
                <button
                  onClick={() => onSpeakText(currentScenario.dilemmaShort)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition shrink-0"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Escuchar reto</span>
                </button>
              )}
            </div>

            {/* Victory Condition & Punchy Dilemma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs sm:text-sm">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Target className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 uppercase tracking-wider block text-[11px]">
                    ¿Cómo ganar esta fase?
                  </strong>
                  <p className="text-slate-200 mt-0.5 font-medium leading-snug">
                    {currentScenario.phaseGoal}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 uppercase tracking-wider block text-[11px]">
                    El dilema en juego:
                  </strong>
                  <p className="text-slate-200 mt-0.5 font-medium leading-snug">
                    {currentScenario.dilemmaShort}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DUEL ARENA: Two Big Cards Faced Against Each Other */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* CARD A: La Ruleta Tradicional (Dados del Azar) */}
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                      <Dices className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        Opción A: La Ruleta Tradicional
                      </h3>
                      <span className="text-xs text-rose-700 font-semibold">
                        Partidas abiertas · Gremios in situ · Azar meteorológico
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {traditionalChoice?.description ||
                    'Aceptar presupuestos abiertos sin precio cerrado vinculante. Si el clima se tuerce o los gremios fallan, tú pagas la fiesta.'}
                </p>

                {/* Interactive Dice Roller */}
                <InteractiveDice
                  currentLevel={state.level}
                  onRollComplete={(outcome) => {
                    if (onDiceRollOutcome) {
                      onDiceRollOutcome(outcome);
                    } else if (traditionalChoice) {
                      onSelectChoice(traditionalChoice);
                    }
                  }}
                  onRewindToPassivhaus={() => {
                    playVictorySound();
                    onRewindChoice();
                  }}
                  onAcceptPenaltyAndContinue={() => {
                    if (passivhausChoice) {
                      onSelectChoice(passivhausChoice);
                    }
                  }}
                  activeRoll={state.lastDiceRoll}
                  isLoading={isLoading}
                />
              </div>

              {/* Direct button to pick traditional without rolling */}
              {!state.lastDiceRoll && traditionalChoice && (
                <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
                  <span>O bien, arriesgarte directamente:</span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onSelectChoice(traditionalChoice);
                    }}
                    disabled={isLoading}
                    className="text-rose-700 hover:text-rose-900 font-bold hover:underline"
                  >
                    Elegir Opción A (Tradicional)
                  </button>
                </div>
              )}
            </div>

            {/* CARD B: El Blindaje Passivhaus (Certidumbre 100%) */}
            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border-2 border-emerald-600 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col justify-between space-y-4 relative ring-2 ring-emerald-500/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        Opción B: Blindaje Passivhaus por Catálogo
                      </h3>
                      <span className="text-xs text-emerald-800 font-semibold">
                        0% Azar · 100% Ingeniería BIM · Precio notarial cerrado
                      </span>
                    </div>
                  </div>

                  <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Recomendado
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {passivhausChoice?.description ||
                    'Modelo prediseñado en madera técnica con precio cerrado vinculante ante notario y fabricación en seco en nave.'}
                </p>

                {/* 4 Concrete Guarantees */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Garantías Certificadas para Ganar la Fase:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentScenario.passivhausPerks.map((perk, i) => (
                      <div
                        key={i}
                        className="bg-white/90 border border-emerald-300/80 rounded-xl p-2.5 flex items-start gap-2 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="text-slate-800 font-semibold leading-tight">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Big Winning CTA Button */}
              {passivhausChoice && (
                <div className="pt-4 border-t border-emerald-200">
                  <button
                    type="button"
                    onClick={() => handleSelectPassivhaus(passivhausChoice)}
                    disabled={isLoading}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-200" />
                    <span>🛡️ Activar Blindaje Passivhaus (Ganar Fase)</span>
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                  </button>
                  <span className="text-[11px] text-center block text-emerald-900 font-medium mt-1.5">
                    Garantiza 0 € de desvío, 0 semanas de retraso y salud interior óptima
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Technical Learning Pill (Accordion) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900"
            >
              <div className="flex items-center gap-2">
                <span>📚 Píldora Técnica de la Fase: ¿Por qué ocurre esto en la vida real?</span>
              </div>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnicalDetails && (
              <div className="pt-3 mt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong>En obra tradicional:</strong> La falta de integración previa mediante gemelo digital BIM
                  obliga a resolver encuentros complejos sobre la marcha. Esto provoca que el electricista o fontanero
                  rompa la capa aislante, o que las ventanas se fijen con espuma no estanca al aire, multiplicando por 4
                  las infiltraciones térmicas y generando puentes fríos donde anida el moho.
                </p>
                <p>
                  <strong>En catálogo industrializado Passivhaus:</strong> Cada pasamuro, cinta de estanqueidad y
                  panel de madera técnica CLT o entramado ligero se corta por control numérico CNC en fábrica climatizada.
                  El ensamblaje in situ se realiza en seco mediante tornillería estructural en cuestión de días,
                  superando holgadamente el Test Blower Door (n50 ≤ 0,6 ren/h).
                </p>
              </div>
            )}
          </div>

          {/* Custom Question input if user wants to ask something */}
          <form onSubmit={handleCustomSubmit} className="pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="¿Tienes una duda o quieres plantear una alternativa para esta fase?"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={!customInput.trim() || isLoading}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition"
              >
                Consultar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Level 5 (Game Over): Final Balance, 30-Year Audit & Trap Questions Checklist */}
      {state.gameOver && (
        <section className="space-y-6 pt-2">
          {/* Victory Banner */}
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-2xl mx-auto flex items-center justify-center">
              <Award className="w-8 h-8 text-emerald-300" />
            </div>

            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest block">
              ¡Odisea Completada con Éxito!
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Balance Definitivo del Hogar a 30 Años
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Has tomado las decisiones técnicas que marcan la diferencia entre un pozo sin fondo de averías
              o una vivienda blindada con confort absoluto y facturas casi nulas.
            </p>

            <div className="pt-2">
              <div className="inline-block bg-white/10 backdrop-blur-sm border border-emerald-400/30 px-6 py-3 rounded-2xl">
                <span className="text-xs text-emerald-200 block uppercase font-bold">
                  Tu Perfil de Autopromotor:
                </span>
                <span className="text-lg sm:text-xl font-black text-white block mt-0.5">
                  {state.desvioAcumuladoPorcentaje <= 3
                    ? '🏆 «Autopromotor Blindado Passivhaus»'
                    : state.desvioAcumuladoPorcentaje <= 12
                    ? '⚖️ «Superviviente Prudente de Gremios»'
                    : '🏚️ «Afectado por Partidas Abiertas y Humedades»'}
                </span>
              </div>
            </div>
          </div>

          {/* Comparative Table: Tu Proyecto vs Obra Tradicional */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                1. Comparativa: Tu Proyecto vs. Obra Tradicional Convencional
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs">
                    <th className="py-3 px-3 font-semibold">Parámetro Clave</th>
                    <th className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/60 rounded-t-lg">
                      Tu Proyecto
                    </th>
                    <th className="py-3 px-3 font-bold text-rose-800 bg-rose-50/60 rounded-t-lg">
                      Obra Tradicional Convencional
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-900">Desvío de Presupuesto</td>
                    <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/30">
                      +{state.desvioAcumuladoPorcentaje.toFixed(1)}% (+{formatoEuros(state.desvioAcumuladoEuros)})
                    </td>
                    <td className="py-3 px-3 text-rose-800 bg-rose-50/30">
                      +18.5% a +25% (+46.000 € a +62.000 €)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-900">Plazo Total de Construcción</td>
                    <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/30">
                      {state.tiempoSemanas} Semanas (~{Math.round(state.tiempoSemanas / 4)} meses)
                    </td>
                    <td className="py-3 px-3 text-rose-800 bg-rose-50/30">
                      78 - 96 Semanas (18-24 meses)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-900">Factura de Climatización</td>
                    <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/30">
                      {state.facturaEnergeticaMes} €/mes
                    </td>
                    <td className="py-3 px-3 text-rose-800 bg-rose-50/30">
                      220 - 320 €/mes
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-900">Hermeticidad Test Blower Door</td>
                    <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/30">
                      n50 = {state.blowerDoorN50} h⁻¹ (Passivhaus verificado)
                    </td>
                    <td className="py-3 px-3 text-rose-800 bg-rose-50/30">
                      n50 = 5,5 a 7,2 h⁻¹ (Colador térmico)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-900">Calidad de Aire & Moho</td>
                    <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/30">
                      0 moho (VMC doble flujo continua y filtros F7/HEPA)
                    </td>
                    <td className="py-3 px-3 text-rose-800 bg-rose-50/30">
                      Condensación en cajones de persiana y esquinas frías
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Trap Questions Checklist */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                2. «Guía de Preguntas Trampa para Constructores»
              </h3>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-300">
                Checklist Anti-Fraude
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Haz estas 4 preguntas técnicas a cualquier constructor antes de entregar un solo euro:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {CHECKLIST_PREGUNTAS_TRAMPA.map((item) => (
                <div key={item.num} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {item.num}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">
                      {item.pregunta}
                    </h4>
                  </div>
                  <p className="text-xs text-rose-900 pl-8">
                    <strong>Peligro tradicional:</strong> {item.porQue}
                  </p>
                  <p className="text-xs text-emerald-900 font-semibold pl-8">
                    <strong>Respuesta Passivhaus:</strong> {item.respuestaPassivhaus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-md">
            <h3 className="text-lg sm:text-2xl font-black tracking-tight">
              ¿Listo para dar el paso con certidumbre total?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Explora los modelos en madera técnica con precio cerrado o abre el simulador de amortización
              LCC a 30 años con tus propias variables.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={onOpenCatalog}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <span>Ver Catálogo de Viviendas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenLCC}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm border border-slate-700 transition cursor-pointer"
              >
                Simulador Coste a 30 Años (LCC)
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
