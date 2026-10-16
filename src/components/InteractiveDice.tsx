import React, { useState } from 'react';
import { playDiceShakeSound, playDisasterSound } from '../utils/audio';
import { DiceOutcome } from '../types/game';
import { Dices, AlertTriangle, RotateCcw, ArrowRight, ShieldAlert } from 'lucide-react';

interface InteractiveDiceProps {
  currentLevel: number;
  onRollComplete: (outcome: DiceOutcome) => void;
  onRewindToPassivhaus: () => void;
  onAcceptPenaltyAndContinue: () => void;
  activeRoll?: DiceOutcome;
  isLoading?: boolean;
}

// Visual dots mapping for a 6-sided die
const DICE_DOT_CONFIGS: Record<number, number[]> = {
  1: [4], // center
  2: [0, 8], // top-left, bottom-right
  3: [0, 4, 8], // diagonal
  4: [0, 2, 6, 8], // 4 corners
  5: [0, 2, 4, 6, 8], // 4 corners + center
  6: [0, 2, 3, 5, 6, 8], // 2 columns of 3
};

export const InteractiveDice: React.FC<InteractiveDiceProps> = ({
  currentLevel,
  onRollComplete,
  onRewindToPassivhaus,
  onAcceptPenaltyAndContinue,
  activeRoll,
  isLoading = false,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [displayedValue, setDisplayedValue] = useState<number>(activeRoll?.diceValue || 1);

  const handleRoll = () => {
    if (isRolling || isLoading) return;
    setIsRolling(true);
    playDiceShakeSound();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDisplayedValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        // Determine final value (1-6)
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDisplayedValue(finalVal);
        setIsRolling(false);
        playDisasterSound();

        // Import scenario outcomes
        import('../utils/gameLogic').then(({ GAME_SCENARIOS_V2 }) => {
          const scenario = GAME_SCENARIOS_V2[currentLevel] || GAME_SCENARIOS_V2[1];
          const outcome = scenario.diceOutcomes?.[finalVal] || scenario.diceOutcomes![1];
          onRollComplete(outcome);
        });
      }
    }, 90);
  };

  const renderDiceFace = (val: number) => {
    const activeDots = DICE_DOT_CONFIGS[val] || [4];
    return (
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md p-2.5 sm:p-3 grid grid-cols-3 grid-rows-3 gap-1 transition-transform duration-100 ${
          isRolling ? 'rotate-12 scale-110 shadow-lg animate-bounce' : 'rotate-0 hover:scale-105'
        }`}
      >
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {activeDots.includes(i) && (
              <span className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${val === 1 ? 'bg-rose-600' : 'bg-slate-800'} shadow-inner`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Dice Arena */}
      <div className="bg-gradient-to-br from-rose-50/70 via-amber-50/50 to-orange-50/40 border-2 border-rose-300/80 rounded-2xl p-5 sm:p-6 text-slate-900 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
              🎲
            </span>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                La Ruleta de la Obra Tradicional
              </h4>
              <span className="text-xs text-rose-800 font-medium">
                Probabilidades en contra: 100% azar, partidas abiertas y gremios
              </span>
            </div>
          </div>

          <span className="text-xs bg-rose-200/80 text-rose-900 font-bold px-2.5 py-1 rounded-full border border-rose-300">
            Riesgo Alto
          </span>
        </div>

        {/* Rolling interactive section if no roll yet */}
        {!activeRoll && (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start space-y-2 text-center sm:text-left">
              <p className="text-xs sm:text-sm text-slate-700 max-w-sm leading-relaxed">
                En la construcción tradicional sin precio cerrado, cada fase es una tirada de dados contra el clima,
                las huelgas, las roturas y los sobrecostes.
              </p>
              <span className="text-xs font-semibold text-rose-700">
                ¿Te atreves a comprobar qué le ocurre a tu dinero si te la juegas?
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <div onClick={handleRoll} className="cursor-pointer">
                {renderDiceFace(displayedValue)}
              </div>

              <button
                type="button"
                onClick={handleRoll}
                disabled={isRolling || isLoading}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition flex items-center gap-2"
              >
                <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'Lanzando dados...' : '¡Lanzar Dados del Azar!'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Outcome Display when rolled */}
        {activeRoll && (
          <div className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 p-4 rounded-xl border border-rose-200 shadow-xs">
              <div className="flex items-center gap-4">
                {renderDiceFace(activeRoll.diceValue)}
                <div>
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                    Resultado de tu tirada:
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {activeRoll.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    {activeRoll.description}
                  </p>
                </div>
              </div>

              {/* Losses pill meters */}
              <div className="flex sm:flex-col gap-2 shrink-0 self-stretch justify-around sm:justify-center border-t sm:border-t-0 sm:border-l border-rose-100 pt-2 sm:pt-0 sm:pl-4">
                <div className="text-center sm:text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Sobrecoste</span>
                  <span className="text-sm font-extrabold text-rose-700">
                    -{new Intl.NumberFormat('es-ES').format(activeRoll.penaltyMoney)} €
                  </span>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Demora</span>
                  <span className="text-sm font-extrabold text-amber-800">
                    +{activeRoll.penaltyWeeks} semanas
                  </span>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Estrés</span>
                  <span className="text-sm font-extrabold text-rose-800">
                    +{activeRoll.penaltyStress}% 🔥
                  </span>
                </div>
              </div>
            </div>

            {/* Why Technical Explanatory Note */}
            <div className="text-xs bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Por qué ocurre técnicamente: </strong>
                {activeRoll.whyTechnical}
              </div>
            </div>

            {/* Action Bar: Rewind vs Accept */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onRewindToPassivhaus}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rebobinar tirada y elegir Passivhaus (0 € desvíos)</span>
              </button>

              <button
                type="button"
                onClick={onAcceptPenaltyAndContinue}
                className="w-full sm:w-auto text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Asumir penalización y continuar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
