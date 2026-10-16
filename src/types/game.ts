export type ConstructiveModel =
  | 'Industrializado Madera Passivhaus'
  | 'Obra Húmeda Tradicional'
  | 'Mixto Indeciso';

export interface AlertaAutopromotor {
  impacto: string;
  porqueTecnico: string;
  alternativaIndustrializada: string;
  penalizacionPresupuesto: number;
  penalizacionSemanas: number;
  penalizacionEstres: number;
  previousChoiceId?: string;
}

export interface CalibrationData {
  ubicacionParcela: string; // 'Montaña / Clima Frío' | 'Meseta / Clima Continental' | 'Costa / Clima Suave'
  dormitorios: number; // 2, 3 o 4
  calibrado: boolean;
}

export interface DiceOutcome {
  diceValue: number;
  title: string;
  description: string;
  penaltyMoney: number;
  penaltyWeeks: number;
  penaltyStress: number;
  whyTechnical: string;
}

export interface GameState {
  level: 0 | 1 | 2 | 3 | 4 | 5; // 0 = calibracion previa
  levelName: string;
  faseNombre: string;
  presupuestoInicial: number;
  presupuestoRestante: number;
  desvioAcumuladoEuros: number;
  desvioAcumuladoPorcentaje: number;
  tiempoSemanas: number;
  tiempoPrevistoSemanas: number;
  estresPorcentaje: number; // 10% initially
  estresBarra: string; // e.g. [■□□□□□□□□□] 10%
  estadoEstres: string;
  facturaEnergeticaMes: number; // 35 €/mes initially
  confortYAire: string; // 'Óptimo / Filtrado continuo'
  confortPuntos: number; // 0-100
  huellaCarbono: number; // tCO2 eq
  modeloConstructivo: ConstructiveModel;
  blowerDoorN50: number; // h⁻¹
  vmcInstalado: boolean;
  tripleVidrio: boolean;
  calibration: CalibrationData;
  alertaActiva?: AlertaAutopromotor;
  turnNumber: number;
  gameOver: boolean;
  gameVictory: boolean;
  rewindStateBackup?: Omit<GameState, 'rewindStateBackup'>;
  lastDiceRoll?: DiceOutcome;
}

export interface ChoiceOption {
  id: string;
  letter?: 'A' | 'B' | 'C';
  label: string;
  description: string;
  consequencesSummary?: string;
  isBadDecision?: boolean;
  recommended?: boolean;
  isRewindAction?: boolean;
}

export interface TurnMessage {
  id: string;
  role: 'system' | 'assistant' | 'user';
  text: string;
  statusPanelMarkdown?: string;
  alertaAutopromotor?: AlertaAutopromotor;
  timestamp: number;
  choices?: ChoiceOption[];
  gameStateSnapshot?: GameState;
}

export interface LCCComparisonInput {
  areaM2: number;
  costeKWh: number;
  inflacionEnergeticaAnual: number;
  years: number;
}

export interface LCCYearData {
  year: number;
  costeAcumuladoTradicional: number;
  costeAcumuladoIndustrializado: number;
  gastoEnergiaTradicional: number;
  gastoEnergiaIndustrializado: number;
  mantenimientoPatologiasTradicional: number;
  mantenimientoPatologiasIndustrializado: number;
  ahorroNetoAcumulado: number;
}

export interface LCCResult {
  capexInicialTradicional: number;
  capexRealConDesvioTradicional: number;
  capexInicialIndustrializado: number;
  consumoAnualKWhTradicional: number;
  consumoAnualKWhPassivhaus: number;
  ahorroEnergeticoPorcentaje: number;
  ahorroTotal30Anos: number;
  paybackAnos: number;
  co2EmbebidoTradicionalTons: number;
  co2SecuestradoMaderaTons: number;
  chartData: LCCYearData[];
}
