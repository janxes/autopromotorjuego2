import React, { useState, useEffect } from 'react';
import { GameState, TurnMessage, ChoiceOption, DiceOutcome } from './types/game';
import {
  INITIAL_GAME_STATE,
  formatStatusPanelMarkdown,
  GAME_SCENARIOS_V2,
  generateStressBar,
  updateStressStatus,
} from './utils/gameLogic';
import { HUDHeader } from './components/HUDHeader';
import { GameNarrativeView } from './components/GameNarrativeView';
import { LCCSimulatorView } from './components/LCCSimulatorView';
import { BlowerDoorLabView } from './components/BlowerDoorLabView';
import { CatalogView } from './components/CatalogView';
import { CertificateModal } from './components/CertificateModal';

const STORAGE_KEY = 'autopromotor_odisea_save_v3';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load saved game state', e);
    }
    return INITIAL_GAME_STATE;
  });

  const [activeTab, setActiveTab] = useState<'game' | 'lcc' | 'blower' | 'catalog' | 'certificate'>('game');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Accessibility States
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Update root font size for accessibility
  useEffect(() => {
    const sizeMap = {
      normal: '16px',
      large: '18px',
      xlarge: '20px',
    };
    document.documentElement.style.setProperty('--app-font-size', sizeMap[fontSize]);
  }, [fontSize]);

  // Update high contrast class
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Initial welcome message with Calibration phase
  const [messages, setMessages] = useState<TurnMessage[]>(() => {
    const level0 = GAME_SCENARIOS_V2[0];
    const initialStatus = formatStatusPanelMarkdown(INITIAL_GAME_STATE);
    return [
      {
        id: 'msg-calib-init',
        role: 'assistant',
        text: level0.gameMasterNarration,
        statusPanelMarkdown: initialStatus,
        timestamp: Date.now(),
        choices: level0.options,
        gameStateSnapshot: INITIAL_GAME_STATE,
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      // ignore
    }
  }, [gameState]);

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const currentChoices = lastAssistantMsg?.choices || [];

  // Text-To-Speech helper
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura de voz');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!lastAssistantMsg?.text) return;

    window.speechSynthesis.cancel();
    const cleanText = lastAssistantMsg.text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleRestart = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    localStorage.removeItem(STORAGE_KEY);
    setGameState(INITIAL_GAME_STATE);
    const level0 = GAME_SCENARIOS_V2[0];
    const initialStatus = formatStatusPanelMarkdown(INITIAL_GAME_STATE);
    setMessages([
      {
        id: `msg-restart-${Date.now()}`,
        role: 'assistant',
        text: level0.gameMasterNarration,
        statusPanelMarkdown: initialStatus,
        timestamp: Date.now(),
        choices: level0.options,
        gameStateSnapshot: INITIAL_GAME_STATE,
      },
    ]);
    setActiveTab('game');
  };

  const handleRewindChoice = () => {
    if (!gameState.rewindStateBackup) return;

    const restoredState: GameState = {
      ...(gameState.rewindStateBackup as GameState),
      alertaActiva: undefined,
      lastDiceRoll: undefined,
    };

    setGameState(restoredState);

    const levelDef = GAME_SCENARIOS_V2[restoredState.level];
    const statusMarkdown = formatStatusPanelMarkdown(restoredState);

    const rewindNoticeMsg: TurnMessage = {
      id: `ai-rewind-${Date.now()}`,
      role: 'assistant',
      text: `🔄 **¡Decisión Rebobinada con Éxito!**

Has evitado la trampa a tiempo antes de que los sobrecostes y los retrasos quedaran sellados en el contrato. Volvemos al punto de decisión de: **${levelDef?.faseNombre || 'Nivel ' + restoredState.level}**.

Elige ahora la opción constructiva con certidumbre técnica:`,
      statusPanelMarkdown: statusMarkdown,
      timestamp: Date.now(),
      choices: levelDef?.options || [],
      gameStateSnapshot: restoredState,
    };

    setMessages((prev) => [...prev, rewindNoticeMsg]);
  };

  const handleDiceRollOutcome = (outcome: DiceOutcome) => {
    const backupState = { ...gameState };
    const penalizacionEur = outcome.penaltyMoney;
    const desvioEur = gameState.desvioAcumuladoEuros + penalizacionEur;
    const desvioPorc = (desvioEur / gameState.presupuestoInicial) * 100;
    const nuevoRestante = Math.max(0, gameState.presupuestoRestante - (30000 + penalizacionEur));
    const nuevasSemanas = gameState.tiempoSemanas + outcome.penaltyWeeks + 4;
    const nuevoEstres = Math.min(100, gameState.estresPorcentaje + outcome.penaltyStress);

    const alertData = {
      impacto: outcome.description,
      porqueTecnico: outcome.whyTechnical,
      alternativaIndustrializada:
        'El catálogo industrializado con gemelo BIM y precio notarial cerrado elimina este riesgo.',
      penalizacionPresupuesto: penalizacionEur,
      penalizacionSemanas: outcome.penaltyWeeks,
      penalizacionEstres: outcome.penaltyStress,
    };

    const badState: GameState = {
      ...gameState,
      presupuestoRestante: nuevoRestante,
      desvioAcumuladoEuros: desvioEur,
      desvioAcumuladoPorcentaje: desvioPorc,
      tiempoSemanas: nuevasSemanas,
      estresPorcentaje: nuevoEstres,
      estresBarra: generateStressBar(nuevoEstres),
      estadoEstres: updateStressStatus(nuevoEstres),
      facturaEnergeticaMes: gameState.level >= 3 ? 180 : gameState.facturaEnergeticaMes,
      confortYAire: gameState.level >= 3 ? 'Corrientes y Condensaciones' : gameState.confortYAire,
      blowerDoorN50: gameState.level >= 3 ? 5.8 : gameState.blowerDoorN50,
      modeloConstructivo: 'Obra Húmeda Tradicional',
      huellaCarbono: +32.0,
      alertaActiva: alertData,
      rewindStateBackup: backupState,
      lastDiceRoll: outcome,
      turnNumber: gameState.turnNumber + 1,
    };

    setGameState(badState);
    const statusMarkdown = formatStatusPanelMarkdown(badState);

    const currentScenario = GAME_SCENARIOS_V2[gameState.level];
    const aiMsg: TurnMessage = {
      id: `ai-dice-${Date.now()}`,
      role: 'assistant',
      text: `🎲 **Tirada de Azar Tradicional:** ${outcome.title}\n\n${outcome.description}`,
      alertaAutopromotor: alertData,
      statusPanelMarkdown: statusMarkdown,
      timestamp: Date.now(),
      choices: currentScenario?.options || [],
      gameStateSnapshot: badState,
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleSelectChoice = async (choice: ChoiceOption) => {
    const userMsg: TurnMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: choice.label,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const backupState = { ...gameState };

    try {
      const response = await fetch('/api/game/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.slice(-4),
          userMessage: choice.label,
          currentGameState: gameState,
          selectedOption: choice,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawUpdated = data.updatedGameState;

        const updatedState: GameState = {
          ...gameState,
          ...rawUpdated,
          level: (rawUpdated.level ?? gameState.level) as 0 | 1 | 2 | 3 | 4 | 5,
          faseNombre: rawUpdated.faseNombre || `Nivel ${rawUpdated.level || gameState.level}`,
          estresPorcentaje: rawUpdated.estresPorcentaje ?? gameState.estresPorcentaje,
          estresBarra: generateStressBar(rawUpdated.estresPorcentaje ?? gameState.estresPorcentaje),
          estadoEstres:
            rawUpdated.estadoEstres ||
            updateStressStatus(rawUpdated.estresPorcentaje ?? gameState.estresPorcentaje),
          facturaEnergeticaMes: rawUpdated.facturaEnergeticaMes ?? gameState.facturaEnergeticaMes,
          confortYAire: rawUpdated.confortYAire ?? gameState.confortYAire,
          turnNumber: gameState.turnNumber + 1,
          alertaActiva: data.alertaAutopromotor,
          rewindStateBackup: choice.isBadDecision ? backupState : undefined,
          gameOver: rawUpdated.level >= 5 || rawUpdated.gameOver,
        };

        setGameState(updatedState);

        const aiMsg: TurnMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: data.narration,
          alertaAutopromotor: data.alertaAutopromotor,
          statusPanelMarkdown: data.statusPanelMarkdown || formatStatusPanelMarkdown(updatedState),
          timestamp: Date.now(),
          choices: data.nextChoices || [],
          gameStateSnapshot: updatedState,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API error caught, running deterministic scenario engine', err);
    }

    // Fallback script engine
    executeScenarioStepV2(choice, backupState);
    setIsLoading(false);
  };

  const executeScenarioStepV2 = (choice: ChoiceOption, backupState: GameState) => {
    const currentLvl = gameState.level;

    if (currentLvl === 0) {
      const nextLevelDef = GAME_SCENARIOS_V2[1];
      const updatedState: GameState = {
        ...gameState,
        level: 1,
        levelName: nextLevelDef.title,
        faseNombre: nextLevelDef.faseNombre,
        calibration: {
          ubicacionParcela: choice.label,
          dormitorios: 3,
          calibrado: true,
        },
        tiempoSemanas: 0,
        turnNumber: 1,
      };

      setGameState(updatedState);
      const statusMarkdown = formatStatusPanelMarkdown(updatedState);

      const aiMsg: TurnMessage = {
        id: `ai-lvl1-${Date.now()}`,
        role: 'assistant',
        text: `📍 **Parcela Calibrada:** ${choice.label}.

${nextLevelDef.gameMasterNarration}`,
        statusPanelMarkdown: statusMarkdown,
        timestamp: Date.now(),
        choices: nextLevelDef.options,
        gameStateSnapshot: updatedState,
      };

      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    const currentScenario = GAME_SCENARIOS_V2[currentLvl];
    const isBad = choice.isBadDecision || choice.letter === 'A';
    const alertData = currentScenario?.badAlerts?.[choice.id];

    if (isBad && alertData) {
      const penalizacionEur = alertData.penalizacionPresupuesto;
      const desvioEur = gameState.desvioAcumuladoEuros + penalizacionEur;
      const desvioPorc = (desvioEur / gameState.presupuestoInicial) * 100;
      const nuevoRestante = Math.max(0, gameState.presupuestoRestante - (35000 + penalizacionEur));
      const nuevasSemanas = gameState.tiempoSemanas + alertData.penalizacionSemanas + 4;
      const nuevoEstres = Math.min(100, gameState.estresPorcentaje + alertData.penalizacionEstres);

      const badState: GameState = {
        ...gameState,
        presupuestoRestante: nuevoRestante,
        desvioAcumuladoEuros: desvioEur,
        desvioAcumuladoPorcentaje: desvioPorc,
        tiempoSemanas: nuevasSemanas,
        estresPorcentaje: nuevoEstres,
        estresBarra: generateStressBar(nuevoEstres),
        estadoEstres: updateStressStatus(nuevoEstres),
        facturaEnergeticaMes: currentLvl >= 3 ? 180 : gameState.facturaEnergeticaMes,
        confortYAire: currentLvl >= 3 ? 'Corrientes y Condensación en marcos' : gameState.confortYAire,
        blowerDoorN50: currentLvl >= 3 ? 5.8 : gameState.blowerDoorN50,
        vmcInstalado: currentLvl === 4 ? false : gameState.vmcInstalado,
        modeloConstructivo: 'Obra Húmeda Tradicional',
        huellaCarbono: +32.0,
        alertaActiva: alertData,
        rewindStateBackup: backupState,
        turnNumber: gameState.turnNumber + 1,
      };

      setGameState(badState);
      const statusMarkdown = formatStatusPanelMarkdown(badState);

      const aiMsg: TurnMessage = {
        id: `ai-alert-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ Has tomado la decisión tradicional con partidas abiertas o recortes aparentes. El impacto en obra es implacable:`,
        alertaAutopromotor: alertData,
        statusPanelMarkdown: statusMarkdown,
        timestamp: Date.now(),
        choices: [
          {
            id: `L${currentLvl}_CONTINUE_WITH_PENALTY`,
            label: '1. Asumir el golpe y continuar con la penalización',
            description: 'Aceptar el sobrecoste, las semanas extra de alquiler y seguir adelante.',
          },
          {
            id: `L${currentLvl}_REWIND_TO_SAFETY`,
            label: '2. Rebobinar y elegir la opción constructiva correcta',
            description: 'Volver atrás, blindar el presupuesto y optar por el estándar Passivhaus industrializado.',
            isRewindAction: true,
          },
        ],
        gameStateSnapshot: badState,
      };

      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    const nextLvl = Math.min(5, currentLvl + 1) as 1 | 2 | 3 | 4 | 5;
    const nextScenario = GAME_SCENARIOS_V2[nextLvl];

    const isGameOver = nextLvl === 5 && choice.id === 'L5_VER_BALANCE';

    const advancedState: GameState = {
      ...gameState,
      level: nextLvl,
      levelName: nextScenario.title,
      faseNombre: nextScenario.faseNombre,
      tiempoSemanas: gameState.tiempoSemanas + 4,
      presupuestoRestante: Math.max(0, gameState.presupuestoRestante - 28000),
      alertaActiva: undefined,
      rewindStateBackup: undefined,
      gameOver: isGameOver,
      gameVictory: isGameOver && gameState.desvioAcumuladoPorcentaje <= 5,
      turnNumber: gameState.turnNumber + 1,
    };

    setGameState(advancedState);
    const statusMarkdown = formatStatusPanelMarkdown(advancedState);

    const aiMsg: TurnMessage = {
      id: `ai-next-${Date.now()}`,
      role: 'assistant',
      text: nextScenario.gameMasterNarration,
      statusPanelMarkdown: statusMarkdown,
      timestamp: Date.now(),
      choices: nextScenario.options,
      gameStateSnapshot: advancedState,
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleSubmitCustomMessage = async (text: string) => {
    const userMsg: TurnMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/game/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.slice(-4),
          userMessage: text,
          currentGameState: gameState,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawUpdated = data.updatedGameState;

        const updatedState: GameState = {
          ...gameState,
          ...rawUpdated,
          level: (rawUpdated.level ?? gameState.level) as 0 | 1 | 2 | 3 | 4 | 5,
          faseNombre: rawUpdated.faseNombre || gameState.faseNombre,
          estresPorcentaje: rawUpdated.estresPorcentaje ?? gameState.estresPorcentaje,
          estresBarra: generateStressBar(rawUpdated.estresPorcentaje ?? gameState.estresPorcentaje),
          estadoEstres:
            rawUpdated.estadoEstres ||
            updateStressStatus(rawUpdated.estresPorcentaje ?? gameState.estresPorcentaje),
          turnNumber: gameState.turnNumber + 1,
        };

        setGameState(updatedState);

        const aiMsg: TurnMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: data.narration,
          alertaAutopromotor: data.alertaAutopromotor,
          statusPanelMarkdown: data.statusPanelMarkdown || formatStatusPanelMarkdown(updatedState),
          timestamp: Date.now(),
          choices: data.nextChoices || [],
          gameStateSnapshot: updatedState,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('API error during custom message, fallback response', e);
    }

    const localAdvisor = `El Aparejador te responde con claridad:

"${text}"

En obra nunca hay atajos mágicos. Si abres partidas sin precio cerrado, el constructor transferirá la inflación de materiales a tus certificaciones bancarias. Con edificación industrializada de madera técnica por catálogo, el gemelo digital BIM congela las tolerancias y la fábrica entrega precio cerrado notarial.

Elige la opción para este nivel:`;

    const statusMarkdown = formatStatusPanelMarkdown(gameState);
    const currentScenario = GAME_SCENARIOS_V2[gameState.level];

    const aiMsg: TurnMessage = {
      id: `ai-custom-${Date.now()}`,
      role: 'assistant',
      text: localAdvisor,
      statusPanelMarkdown: statusMarkdown,
      timestamp: Date.now(),
      choices: currentScenario?.options || [],
      gameStateSnapshot: gameState,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Accessible Header with Top-Bar Contract */}
      <HUDHeader
        state={gameState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRestart={handleRestart}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'game' && (
          <GameNarrativeView
            state={gameState}
            messages={messages}
            currentChoices={currentChoices}
            onSelectChoice={handleSelectChoice}
            onSubmitCustomMessage={handleSubmitCustomMessage}
            onRewindChoice={handleRewindChoice}
            onDiceRollOutcome={handleDiceRollOutcome}
            isLoading={isLoading}
            onOpenLCC={() => setActiveTab('lcc')}
            onOpenCatalog={() => setActiveTab('catalog')}
            onSpeakText={handleSpeakText}
          />
        )}

        {activeTab === 'lcc' && <LCCSimulatorView />}

        {activeTab === 'blower' && <BlowerDoorLabView />}

        {activeTab === 'catalog' && <CatalogView />}

        {activeTab === 'certificate' && (
          <CertificateModal
            state={gameState}
            onRestart={handleRestart}
            onClose={() => setActiveTab('game')}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-normal">
          <span>
            La Odisea del Autopromotor · Asesoría pedagógica en madera técnica y Passivhaus por catálogo
          </span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Accesibilidad WCAG AA</span>
            <span aria-hidden="true">·</span>
            <span>Alta legibilidad tipográfica</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
