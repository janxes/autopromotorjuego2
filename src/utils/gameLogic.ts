import {
  GameState,
  AlertaAutopromotor,
  ChoiceOption,
  DiceOutcome,
  LCCComparisonInput,
  LCCResult,
  LCCYearData,
} from '../types/game';

export function generateStressBar(percent: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const blocks = Math.round(clamped / 10);
  const filled = '■'.repeat(blocks);
  const empty = '□'.repeat(10 - blocks);
  return `[${filled}${empty}] ${clamped}%`;
}

export const INITIAL_GAME_STATE: GameState = {
  level: 0,
  levelName: 'Fase Previa: Calibración del Usuario',
  faseNombre: 'Calibración Inicial',
  presupuestoInicial: 250000,
  presupuestoRestante: 250000,
  desvioAcumuladoEuros: 0,
  desvioAcumuladoPorcentaje: 0,
  tiempoSemanas: 0,
  tiempoPrevistoSemanas: 24, // 24 semanas = ~6 meses previsto para industrializado
  estresPorcentaje: 10,
  estresBarra: generateStressBar(10),
  estadoEstres: 'Zen e Ilusionado con la Parcela',
  facturaEnergeticaMes: 35,
  confortYAire: 'Óptimo / Filtrado continuo',
  confortPuntos: 90,
  huellaCarbono: 0,
  modeloConstructivo: 'Industrializado Madera Passivhaus',
  blowerDoorN50: 0.45,
  vmcInstalado: true,
  tripleVidrio: true,
  calibration: {
    ubicacionParcela: '',
    dormitorios: 3,
    calibrado: false,
  },
  turnNumber: 0,
  gameOver: false,
  gameVictory: false,
};

export function formatStatusPanelMarkdown(state: GameState): string {
  const formatoEuros = (val: number) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';

  const desvioSign = state.desvioAcumuladoEuros > 0 ? '+' : '';
  const carbonSign = state.huellaCarbono <= 0 ? '-' : '+';
  const carbonLabel =
    state.huellaCarbono <= 0
      ? `-${Math.abs(state.huellaCarbono).toFixed(1)} tCO2 eq (Madera fijadora)`
      : `+${state.huellaCarbono.toFixed(1)} tCO2 (Hormigón/Ladrillo)`;

  const lvlDisplay = state.level === 0 ? 'CALIBRACIÓN' : `${state.level}/5: ${state.faseNombre}`;

  return `📊 **ESTADO DEL AUTOPROMOTOR [NIVEL ${lvlDisplay}]**
- 💰 Presupuesto Inicial: ${formatoEuros(state.presupuestoInicial)} | Restante: ${formatoEuros(state.presupuestoRestante)}
- 📈 Desvío Económico Acumulado: ${desvioSign}${state.desvioAcumuladoPorcentaje.toFixed(1)}% (${desvioSign}${formatoEuros(state.desvioAcumuladoEuros)})
- ⏳ Tiempo Transcurrido: Semana ${state.tiempoSemanas} (vs Semana ${state.tiempoPrevistoSemanas} previstos)
- 🧠 Nivel de Estrés / Salud Mental: ${state.estresBarra} [${state.estadoEstres}]
- ⚡ Factura Energética: ${state.facturaEnergeticaMes} €/mes
- 🌡️ Confort y Aire: ${state.confortYAire}
- 🌲 Huella de Carbono: ${carbonLabel}
- 🏷️ Modelo Constructivo: [${state.modeloConstructivo}]`;
}

export function updateStressStatus(percent: number): string {
  if (percent <= 15) return 'Zen y en Control Total';
  if (percent <= 30) return 'Preocupado pero Funcional';
  if (percent <= 55) return 'Alerta Amarilla (Gastos Imprevistos)';
  if (percent <= 75) return 'Al Borde del Ictus con el Contratista';
  return 'Pánico Hipotecario y Agotamiento Extremo';
}

export interface ScenarioDefinition {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  title: string;
  faseNombre: string;
  badge: string;
  phaseGoal: string;
  dilemmaShort: string;
  gameMasterNarration: string;
  passivhausPerks: string[];
  options: ChoiceOption[];
  badAlerts?: Record<string, AlertaAutopromotor>;
  diceOutcomes?: Record<number, {
    diceValue: number;
    title: string;
    description: string;
    penaltyMoney: number;
    penaltyWeeks: number;
    penaltyStress: number;
    whyTechnical: string;
  }>;
}

export const GAME_SCENARIOS_V2: Record<number, ScenarioDefinition> = {
  0: {
    level: 0,
    title: 'Fase Previa: Calibración del Proyecto',
    faseNombre: 'Calibración de Parcela y Necesidades',
    badge: 'Inicio: Configuración',
    phaseGoal: 'Configurar tu parcela y tamaño para calcular tus costes y aislamiento exactos.',
    dilemmaShort: 'Tienes 250.000 € y la parcela escriturada. ¿En qué entorno vas a construir tu futuro hogar?',
    gameMasterNarration: `¡Bienvenido a "La Odisea del Autopromotor"!
Comienzas con 250.000 € y la ilusión intacta. Calibra tu parcela para arrancar la aventura:`,
    passivhausPerks: [
      'Estudio bioclimático previo adaptado al clima',
      'Memoria de calidades sin partidas abiertas',
      'Presupuesto notarial vinculante',
    ],
    options: [
      {
        id: 'CALIB_MONTAÑA_3D',
        label: 'Zona Fría / Montaña — 3 Dormitorios (135 m²)',
        description: 'Inviernos crudos con heladas continuas. Demanda aislamiento térmico extremo.',
      },
      {
        id: 'CALIB_MESETA_3D',
        label: 'Meseta Continental — 3 Dormitorios (140 m²)',
        description: 'Oscilación brutal: inviernos de -4°C y veranos a 41°C. Envolvente hermética clave.',
      },
      {
        id: 'CALIB_COSTA_4D',
        label: 'Zona Costa / Clima Suave — 4 Dormitorios (160 m²)',
        description: 'Humedad ambiental alta y riesgo crítico de moho en puentes térmicos.',
      },
    ],
  },
  1: {
    level: 1,
    title: 'NIVEL 1: «La Ruleta del Presupuesto y el Calendario»',
    faseNombre: 'La Ruleta del Presupuesto y el Calendario',
    badge: 'Fase 1: Presupuesto & Notaría',
    phaseGoal: 'Obtener la hipoteca autopromotor con precio cerrado y 0 € de desvíos.',
    dilemmaShort: 'El banco exige el presupuesto oficial para tasar la hipoteca. ¿Te la juegas a pedir presupuestos abiertos a contratas tradicionales, o blindas un modelo de catálogo con precio cerrado notarial?',
    gameMasterNarration: 'El banco pide números definitivos. Si abres partidas, juegas a la ruleta rusa. Si eliges catálogo, el precio es notarial.',
    passivhausPerks: [
      'Precio cerrado notarial sin partidas abiertas',
      'Gemelo digital BIM con mediciones exactas al 100%',
      'Aprobación bancaria exprés sin tasaciones a la baja',
      '0 € en intereses de carencia por demoras',
    ],
    options: [
      {
        id: 'L1_OPCION_A',
        letter: 'A',
        label: 'Opción A: La Ruleta Tradicional (Partidas Abiertas)',
        description: 'Pedir presupuestos a contratistas locales con partidas estimadas a liquidar según avance.',
        isBadDecision: true,
      },
      {
        id: 'L1_OPCION_B',
        letter: 'B',
        label: 'Opción B: Blindaje Passivhaus por Catálogo (Precio Cerrado)',
        description: 'Modelo de catálogo en madera técnica con precio notarial cerrado y memoria BIM vinculante.',
        isBadDecision: false,
        recommended: true,
      },
    ],
    badAlerts: {
      L1_OPCION_A: {
        impacto: 'Meses de silencio. Dos constructores quiebran, otro sube un 20% por inflación de materiales y los tipos suben. Pierdes 14 semanas y 11.500 € en intereses de carencia.',
        porqueTecnico: 'Los presupuestos tradicionales trasladan el riesgo al autopromotor mediante "precios contradictorios" y partidas alzadas una vez que estás pillado con la hipoteca.',
        alternativaIndustrializada: 'Un modelo por catálogo con gemelo BIM congela las compras de madera técnica en fábrica y fija un contrato llave en mano sin sorpresas.',
        penalizacionPresupuesto: 11500,
        penalizacionSemanas: 14,
        penalizacionEstres: 30,
      },
    },
    diceOutcomes: {
      1: {
        diceValue: 1,
        title: '⚀ Quiebra de Constructor & Subida de Tipos',
        description: 'El contratista principal se declara en concurso de acreedores con tu adelanto en el bolsillo. La hipoteca se encarece.',
        penaltyMoney: 16500,
        penaltyWeeks: 16,
        penaltyStress: 35,
        whyTechnical: 'Ausencia de avales bancarios afianzados en obra tradicional frente al seguro decenal y contrato llave en mano industrializado.',
      },
      2: {
        diceValue: 2,
        title: '⚁ La Sorpresa del Acero & Mediciones Alzadas',
        description: 'El constructor alega "alza imprevista de costes internacionales" y te exige firmar un anexo con sobrecostes.',
        penaltyMoney: 13000,
        penaltyWeeks: 12,
        penaltyStress: 28,
        whyTechnical: 'Las partidas abiertas permiten al contratista reclamar revisiones de precios en cualquier certificación mensual.',
      },
      3: {
        diceValue: 3,
        title: '⚂ Olvido Técnico de Acometidas en Proyecto',
        description: 'Las mediciones no incluían el enganche de agua ni saneamiento. Partida contradictoria urgente obligada.',
        penaltyMoney: 10500,
        penaltyWeeks: 8,
        penaltyStress: 22,
        whyTechnical: 'Falta de diseño integrado BIM; en catálogo industrializado todas las acometidas están modeladas al milímetro.',
      },
      4: {
        diceValue: 4,
        title: '⚃ Desajuste Bancario por Tasación a la Baja',
        description: 'El perito del banco recorta un 12% la tasación por dudas en las mediciones del constructor local.',
        penaltyMoney: 8000,
        penaltyWeeks: 6,
        penaltyStress: 18,
        whyTechnical: 'La banca penaliza proyectos con incertidumbre técnica frente a soluciones estandarizadas homologadas.',
      },
      5: {
        diceValue: 5,
        title: '⚄ Retraso de 4 Meses por Silencio de Gremios',
        description: 'Nadie quiere firmar plazos. Sigues pagando el alquiler de tu piso mientras se dilata el inicio.',
        penaltyMoney: 6500,
        penaltyWeeks: 5,
        penaltyStress: 15,
        whyTechnical: 'Escasez endémica de mano de obra en obra in situ frente a la producción estable y robotizada en taller.',
      },
      6: {
        diceValue: 6,
        title: '⚅ Falso Respiro (Pero con Cláusulas Trampa)',
        description: 'Encuentras constructor rápido, pero el contrato estipula liquidaciones mensuales con liquidación final abierta.',
        penaltyMoney: 4000,
        penaltyWeeks: 3,
        penaltyStress: 12,
        whyTechnical: 'El constructor "entra barato" para ganar la obra y cobra los beneficios en los modificados de ejecución.',
      },
    },
  },
  2: {
    level: 2,
    title: 'NIVEL 2: «Lodo en la Parcela vs. Precisión de Fábrica»',
    faseNombre: 'Lodo en la Parcela vs. Precisión de Fábrica',
    badge: 'Fase 2: Estructura & Clima',
    phaseGoal: 'Levantar la estructura completa y cerrar al agua en tiempo récord sin daños por temporal.',
    dilemmaShort: 'Otoño implacable: 3 semanas de lluvia torrencial. Las zanjas son una ciénaga. ¿Hormigonas entre el barro o montas paneles en seco mecanizados en fábrica?',
    gameMasterNarration: 'Temporal atlántico en la parcela. ¿Arriesgas los materiales bajo el barro o ensamblas la casa en 5 días con grúa?',
    passivhausPerks: [
      'Fabricación 100% en seco en nave climatizada bajo techo',
      'Precisión milimétrica CNC (tolerancia ±1 mm)',
      'Montaje de estructura y cierre al agua en solo 5 días',
      'Aislamiento térmico protegido y seco sin hongos',
    ],
    options: [
      {
        id: 'L2_OPCION_A',
        letter: 'A',
        label: 'Opción A: Obra Tradicional In Situ (Ladrillo y Hormigón)',
        description: 'Cuadrilla hormigonando bajo la lluvia y andamios facturando tarifa diaria mientras fragua la obra.',
        isBadDecision: true,
      },
      {
        id: 'L2_OPCION_B',
        letter: 'B',
        label: 'Opción B: Madera Técnica Industrializada en Taller',
        description: 'Estructura prefabricada en nave; montaje en seco con grúa en 5 días y cierre hermético inmediato.',
        isBadDecision: false,
        recommended: true,
      },
    ],
    badAlerts: {
      L2_OPCION_A: {
        impacto: 'Parón de obra. Palés de lana mineral empapados en el lodo. Andamios y casetas cobran alquiler diario. Pierdes 8 semanas y 16.000 € acumulados.',
        porqueTecnico: 'El hormigón in situ requiere semanas de curado y el agua atrapada en cerramientos genera eflorescencias y pérdida de resistencia del aislamiento.',
        alternativaIndustrializada: 'La madera técnica mecanizada en CNC se monta en seco en 5 días. La casa queda techada e impermeable antes de que caiga la primera gota.',
        penalizacionPresupuesto: 16000,
        penalizacionSemanas: 8,
        penalizacionEstres: 25,
      },
    },
    diceOutcomes: {
      1: {
        diceValue: 1,
        title: '⚀ Aislamiento Empapado & Ciénaga Total',
        description: 'Los palés de lana de roca quedan sumergidos en el barro. Pierden sus propiedades y hay que desecharlos enteros.',
        penaltyMoney: 18000,
        penaltyWeeks: 12,
        penaltyStress: 35,
        whyTechnical: 'El aislamiento térmico poroso saturado de agua pierde hasta el 70% de su capacidad aislante y cría colonias de hongos.',
      },
      2: {
        diceValue: 2,
        title: '⚁ Andamios Facturando con Obra Parada',
        description: '3 semanas de temporal con la cuadrilla en la caseta pero el alquiler de grúa y andamios facturando día a día.',
        penaltyMoney: 14000,
        penaltyWeeks: 8,
        penaltyStress: 26,
        whyTechnical: 'Costes indirectos fijos en obra húmeda artesanal mientras que el montaje industrializado dura menos de 1 semana.',
      },
      3: {
        diceValue: 3,
        title: '⚂ Hormigón Lavado por Lluvia Torrencial',
        description: 'El aguacero lava la lechada de cemento antes del fraguado. Ensayo de probetas no alcanza la resistencia estructural.',
        penaltyMoney: 11000,
        penaltyWeeks: 6,
        penaltyStress: 22,
        whyTechnical: 'La reacción exotérmica del hormigón requiere condiciones higrométricas controladas imposibles bajo lluvia atlántica.',
      },
      4: {
        diceValue: 4,
        title: '⚃ Cede el Terreno y Desalinea Forjado',
        description: 'Las zanjas se desmoronan por el fango. El forjado queda desalineado 4 cm respecto a planos.',
        penaltyMoney: 8500,
        penaltyWeeks: 5,
        penaltyStress: 18,
        whyTechnical: 'Falta de cimentación modular y control geotécnico riguroso propio de la construcción industrializada.',
      },
      5: {
        diceValue: 5,
        title: '⚄ Atasco de Camiones de Hormigonera',
        description: 'Las cubas de hormigón destrozan el camino y se quedan atascadas en la cuneta. Reclamación municipal de viales.',
        penaltyMoney: 6000,
        penaltyWeeks: 4,
        penaltyStress: 15,
        whyTechnical: 'El trasiego constante de decenas de hormigoneras destruye el entorno frente a solo 3 transportes de paneles secos.',
      },
      6: {
        diceValue: 6,
        title: '⚅ Parche con Plásticos (Humedad Atrapada)',
        description: 'Cubren la obra con lonas plásticas, pero la condensación interna moja la madera de encofrado.',
        penaltyMoney: 4500,
        penaltyWeeks: 3,
        penaltyStress: 12,
        whyTechnical: 'El vapor queda retenido en los muros sin barrera higrovariable, generando riesgo futuro de condensación intersticial.',
      },
    },
  },
  3: {
    level: 3,
    title: 'NIVEL 3: «El Enigma Invisible: Hermeticidad y Ventanas»',
    faseNombre: 'El Enigma Invisible: Hermeticidad y Ventanas',
    badge: 'Fase 3: Hermeticidad Passivhaus',
    phaseGoal: 'Garantizar estanqueidad al aire n50 ≤ 0.6 h⁻¹ y eliminar puentes térmicos en carpinterías.',
    dilemmaShort: 'La estructura está lista. Llegan las ventanas. ¿Abaratas con ventanas estándar pegadas con espuma corriente, o exiges triple vidrio, cintas elásticas y test Blower Door?',
    gameMasterNarration: 'El 40% del calor se pierde por infiltraciones invisibles. ¿Dejas la casa como un colador o la blindas como un submarino térmico?',
    passivhausPerks: [
      'Carpintería de madera-aluminio de alta gama con triple vidrio argón',
      'Capa continua hermética sellada con cintas elásticas ProClima/Siga',
      'Test Blower Door garantizado (n50 ≤ 0,6 ren/h)',
      '0 condensaciones en marcos ni riesgo de moho negro',
    ],
    options: [
      {
        id: 'L3_OPCION_A',
        letter: 'A',
        label: 'Opción A: Ahorro Aparente (Ventanas con Espuma Común sin Blower Door)',
        description: 'Ventanas convencionales fijadas con spray de espuma rígida de poliuretano sin cintas de estanqueidad.',
        isBadDecision: true,
      },
      {
        id: 'L3_OPCION_B',
        letter: 'B',
        label: 'Opción B: Envolvente Passivhaus Certificada (Triple Vidrio + Blower Door)',
        description: 'Triple vidrio bajo emisivo, membranas elásticas perimetrales y ensayo de presión Blower Door superado.',
        isBadDecision: false,
        recommended: true,
      },
    ],
    badAlerts: {
      L3_OPCION_A: {
        impacto: 'Silbidos de viento por los marcos. La espuma se fisura al dilatar. Esquinas frías a 11°C con manchas negras de moho tóxico. Test Blower Door desastroso: n50 = 6,2 h⁻¹.',
        porqueTecnico: 'La espuma rígida no tolera movimientos y no es hermética. El aire caliente húmedo se escapa, condensa en el puente térmico y pudre el yeso.',
        alternativaIndustrializada: 'Cintas elásticas especiales y premarcos mecánicos garantizan estanqueidad total n50 ≤ 0,6 h⁻¹ con factura de calefacción casi cero.',
        penalizacionPresupuesto: 12500,
        penalizacionSemanas: 4,
        penalizacionEstres: 20,
      },
    },
    diceOutcomes: {
      1: {
        diceValue: 1,
        title: '⚀ Casa Colador (n50 = 7.2 h⁻¹) & Moho Negro',
        description: 'La espuma se cuartea en las esquinas. Al llegar el invierno las cortinas se mueven solas y brota moho tóxico en los dinteles.',
        penaltyMoney: 15000,
        penaltyWeeks: 8,
        penaltyStress: 30,
        whyTechnical: 'Infiltraciones descontroladas de aire exterior que desplazan el punto de rocío al interior del tabique de cartón-yeso.',
      },
      2: {
        diceValue: 2,
        title: '⚁ Cajón de Persiana sin Aislar (Puente Térmico Masivo)',
        description: 'El cajón tradicional de PVC filtra aire gélido directo al techo del dormitorio. Pérdida masiva de confort.',
        penaltyMoney: 12000,
        penaltyWeeks: 6,
        penaltyStress: 24,
        whyTechnical: 'Los cajones de persiana estándar perforan la envolvente; Passivhaus exige cajones estancos exteriores o persianas venecianas motorizadas.',
      },
      3: {
        diceValue: 3,
        title: '⚂ Doble Vidrio con Intercalario Frío de Aluminio',
        description: 'El vidrio transpira gotas de agua en las mañanas frías. Condensación constante en el alféizar.',
        penaltyMoney: 9000,
        penaltyWeeks: 5,
        penaltyStress: 20,
        whyTechnical: 'Intercalario de aluminio convencional transmite el frío exterior provocando choque térmico perimetral en el cristal.',
      },
      4: {
        diceValue: 4,
        title: '⚃ Cintas Baratas Despegadas por Falta de Imprimación',
        description: 'El operario pegó cinta adhesiva de pintor sobre el polvo del ladrillo sin imprimar; se despega a los 15 días.',
        penaltyMoney: 7000,
        penaltyWeeks: 4,
        penaltyStress: 17,
        whyTechnical: 'La estanqueidad profesional exige imprimaciones poliméricas y cintas con certificación técnica de durabilidad a 50 años.',
      },
      5: {
        diceValue: 5,
        title: '⚄ Hueco de Obra Descuadrado (Holgura de 5 cm)',
        description: 'El albañil dejó el hueco torcido; rellenan el hueco con cascotes y pegotes de yeso.',
        penaltyMoney: 5500,
        penaltyWeeks: 3,
        penaltyStress: 15,
        whyTechnical: 'Tolerancias de obra tradicional de centímetros frente al milímetro de la madera contralaminada CLT o entramado ligero CNC.',
      },
      6: {
        diceValue: 6,
        title: '⚅ Sin Test Blower Door (Falsa Tranquilidad)',
        description: 'No haces la prueba para ahorrar 500 €; no ves las fugas pero pagarás 180 €/mes en calefacción toda la vida.',
        penaltyMoney: 4000,
        penaltyWeeks: 2,
        penaltyStress: 12,
        whyTechnical: 'Lo que no se mide no existe en obra; el test Blower Door es el único detector de mentiras objetivo del edificio.',
      },
    },
  },
  4: {
    level: 4,
    title: 'NIVEL 4: «Respirar o Ventilar: Salud y Confort Interior»',
    faseNombre: 'Respirar o Ventilar: Salud y Confort Interior',
    badge: 'Fase 4: Salud, VMC & Clima',
    phaseGoal: 'Garantizar aire puro continuo libre de CO2, humedad y polen con gasto energético mínimo.',
    dilemmaShort: 'Invierno gélido (1°C afuera). ¿Ventilas abriendo ventanas perdiendo todo el calor y respirando CO2 al dormir, o instalas VMC de doble flujo con recuperador de calor (>90%)?',
    gameMasterNarration: 'En invierno cada ventana abierta es dinero volando por la fachada. El aire puro con calor recuperado es la clave Passivhaus.',
    passivhausPerks: [
      'Ventilación mecánica controlada (VMC) de doble flujo con recuperación >90%',
      'Filtros F7/HEPA que retienen polen, ácaros, esporas y partículas PM2.5',
      'CO2 controlado siempre por debajo de 800 ppm en dormitorios',
      'Factura de calefacción de solo 35 €/mes',
    ],
    options: [
      {
        id: 'L4_OPCION_A',
        letter: 'A',
        label: 'Opción A: Prescindir de VMC (Abrir Ventanas Manualmente)',
        description: 'Abaratar la instalación abriendo ventanas 15 minutos por la mañana y noche.',
        isBadDecision: true,
      },
      {
        id: 'L4_OPCION_B',
        letter: 'B',
        label: 'Opción B: Passivhaus VMC Doble Flujo con Recuperación de Calor',
        description: 'Renovación constante 24/7 sin ruido, reteniendo el 92% de la energía térmica y filtrando el aire.',
        isBadDecision: false,
        recommended: true,
      },
    ],
    badAlerts: {
      L4_OPCION_A: {
        impacto: 'Tiras el calor acumulado en 10 minutos. La bomba de calor se dispara a 260 €/mes. El CO2 sube a 1.900 ppm por la noche (jaqueca matutina). En primavera entra todo el polen.',
        porqueTecnico: 'La ventilación manual no regula la humedad de duchas y cocina ni controla caudales, generando choques térmicos y condensaciones.',
        alternativaIndustrializada: 'La VMC cruza el aire viciado caliente con el aire fresco de la calle sin mezclarlos, recuperando más del 90% del calor con un consumo de apenas 25W.',
        penalizacionPresupuesto: 8000,
        penalizacionSemanas: 0,
        penalizacionEstres: 15,
      },
    },
    diceOutcomes: {
      1: {
        diceValue: 1,
        title: '⚀ Aire Saturado a 2.400 ppm CO2 & Moho Tóxico',
        description: 'Duermes con las ventanas cerradas por el frío. Te despiertas aturdido y el armario empotrado huele a humedad putrefacta.',
        penaltyMoney: 12000,
        penaltyWeeks: 4,
        penaltyStress: 30,
        whyTechnical: 'La acumulación de CO2 y vapor de respiración satura el ambiente en cerramientos sin ventilación equilibrada permanente.',
      },
      2: {
        diceValue: 2,
        title: '⚁ Factura Eléctrica de 285 €/mes en Invierno',
        description: 'Cada vez que abres para ventilar la caldera trabaja al 100% durante 2 horas para recuperar la temperatura de confort.',
        penaltyMoney: 9500,
        penaltyWeeks: 3,
        penaltyStress: 25,
        whyTechnical: 'Tirar aire a 21°C e introducir aire a 2°C multiplica por 6 el gasto térmico de calefacción.',
      },
      3: {
        diceValue: 3,
        title: '⚂ Alergias Severas y Entrada de Contaminación',
        description: 'En primavera el polen y el hollín entran directo al salón y dormitorios; noches de tos e insomnio.',
        penaltyMoney: 7000,
        penaltyWeeks: 2,
        penaltyStress: 20,
        whyTechnical: 'Sin filtros de clase F7/HEPA y circuito con presión positiva calibrada, los alérgenos colonizan la vivienda.',
      },
      4: {
        diceValue: 4,
        title: '⚃ Humedad Relativa al 85% y Ropa Húmeda',
        description: 'La ducha y la cocina generan vapor que no sale; las toallas nunca se secan y el espejo permanece empañado.',
        penaltyMoney: 5500,
        penaltyWeeks: 1,
        penaltyStress: 18,
        whyTechnical: 'Una familia de 4 personas genera de 8 a 12 litros de vapor diarios que deben ser evacuados de forma mecánica continua.',
      },
      5: {
        diceValue: 5,
        title: '⚄ Ruidos Exteriores y Pérdida de Descanso',
        description: 'Tener que abrir ventanas deja entrar el ruido del tráfico, ladridos de perros y molestias urbanas.',
        penaltyMoney: 4000,
        penaltyWeeks: 1,
        penaltyStress: 14,
        whyTechnical: 'La VMC permite mantener las ventanas cerradas con aislamiento acústico Rw > 42 dB mientras respiras aire 100% puro.',
      },
      6: {
        diceValue: 6,
        title: '⚅ Sensación de Corrientes Frías en el Cuello',
        description: 'Las rejillas de ventilación tradicionales en fachada crean chorros de aire helado directos a la cama y al sofá.',
        penaltyMoney: 2500,
        penaltyWeeks: 0,
        penaltyStress: 10,
        whyTechnical: 'Las rejillas pasivas por depresión no calientan el aire entrante y anulan el confort higrotérmico.',
      },
    },
  },
  5: {
    level: 5,
    title: 'NIVEL 5: «La Balanza a 30 Años: Facturas vs. Longevidad»',
    faseNombre: 'La Balanza a 30 Años (Life Cycle Cost)',
    badge: 'Meta: Balance a 30 Años',
    phaseGoal: 'Descubrir el balance económico acumulado, la huella de carbono y el certificado de tu hogar.',
    dilemmaShort: '¡Has completado el camino! Descubre la comparativa a 30 años entre la obra tradicional y tu proyecto Passivhaus.',
    gameMasterNarration: 'Auditoría a 30 años vista. Consulta el balance económico definitivo, tu perfil de autopromotor y la guía contra fraudes.',
    passivhausPerks: [
      'Más de 85.000 € ahorrados en energía y patologías a 30 años',
      'Huella de carbono negativa (madera técnica secuestradora de CO2)',
      'Valor patrimonial de reventa superior en el mercado inmobiliario',
    ],
    options: [
      {
        id: 'L5_VER_BALANCE',
        label: 'Ver Balance Final del Ciclo de Vida a 30 Años y Certificado',
        description: 'Generar la auditoría completa comparativa, perfil de autopromotor y checklist anti-trampas.',
        recommended: true,
      },
    ],
  },
};

export function rollTraditionalDice(level: number): { diceValue: number; outcome: DiceOutcome } {
  const diceValue = Math.floor(Math.random() * 6) + 1;
  const scenario = GAME_SCENARIOS_V2[level] || GAME_SCENARIOS_V2[1];
  const outcomes = scenario.diceOutcomes || GAME_SCENARIOS_V2[1].diceOutcomes!;
  const outcome = outcomes[diceValue] || outcomes[1];
  return { diceValue, outcome };
}

export const CHECKLIST_PREGUNTAS_TRAMPA = [
  {
    num: '1',
    pregunta: '¿El contrato estipula un precio cerrado con penalización económica diaria por retraso en la entrega?',
    porQue: 'Si el constructor no acepta penalización por demora, financiará tus retrasos con los adelantos de otros clientes.',
    respuestaPassivhaus: 'Sí, contrato notarial con precio cerrado y penalización estipulada.',
  },
  {
    num: '2',
    pregunta: '¿Vais a realizar un Test Blower Door con valor n50 ≤ 0,6 h⁻¹ certificado antes de colocar el pladur?',
    porQue: 'Si esperan a colocar el pladur para medir la estanqueidad, será imposible corregir las fugas en tubos y juntas.',
    respuestaPassivhaus: 'Obligatorio en fase de estructura y en fase final para certificar Passivhaus.',
  },
  {
    num: '3',
    pregunta: '¿Existe un modelo BIM con resolución previa de todos los encuentros y pasamuros de instalaciones?',
    porQue: 'En obra tradicional, los fontaneros y electricistas pican el ladrillo con radial rompiendo el aislamiento térmico.',
    respuestaPassivhaus: 'Todo pre-mecanizado en CNC en fábrica sin necesidad de picar rozas.',
  },
  {
    num: '4',
    pregunta: '¿Cómo garantizáis la ventilación continua y la ausencia de condensaciones en puentes térmicos?',
    porQue: 'Las rejillas tradicionales en fachadas introducen ruido, aire frío y crean condensaciones de moho en las esquinas.',
    respuestaPassivhaus: 'VMC de doble flujo con recuperador de calor >90% y filtros continuos F7/HEPA.',
  },
];

export function calculateLCC(input: LCCComparisonInput): LCCResult {
  const { areaM2, costeKWh, inflacionEnergeticaAnual, years } = input;

  const capexInicialTradicional = areaM2 * 1420;
  const desvioTradicionalPorc = 0.185;
  const desvioTradicionalEuros = capexInicialTradicional * desvioTradicionalPorc;
  const capexRealConDesvioTradicional = capexInicialTradicional + desvioTradicionalEuros;

  const capexInicialIndustrializado = areaM2 * 1750;

  const consumoAnualKWhTradicional = areaM2 * 95;
  const consumoAnualKWhPassivhaus = areaM2 * 16;

  const ahorroEnergeticoPorcentaje =
    ((consumoAnualKWhTradicional - consumoAnualKWhPassivhaus) / consumoAnualKWhTradicional) * 100;

  const co2EmbebidoTradicionalTons = (areaM2 * 380) / 1000;
  const co2SecuestradoMaderaTons = (areaM2 * -280) / 1000;

  const chartData: LCCYearData[] = [];

  let acumuladoTradicional = capexRealConDesvioTradicional;
  let acumuladoIndustrializado = capexInicialIndustrializado;
  let precioKWhActual = costeKWh;
  let paybackAnos = -1;

  for (let y = 1; y <= years; y++) {
    const gastoEnergiaTrad = consumoAnualKWhTradicional * precioKWhActual;
    const gastoEnergiaIndus = consumoAnualKWhPassivhaus * precioKWhActual;

    let mantenimientoTrad = 350;
    if (y >= 5) mantenimientoTrad += 1100 + y * 45;

    const mantenimientoIndus = 270;

    acumuladoTradicional += gastoEnergiaTrad + mantenimientoTrad;
    acumuladoIndustrializado += gastoEnergiaIndus + mantenimientoIndus;

    const ahorroNeto = acumuladoTradicional - acumuladoIndustrializado;

    if (ahorroNeto >= 0 && paybackAnos === -1) {
      paybackAnos = y;
    }

    chartData.push({
      year: y,
      costeAcumuladoTradicional: Math.round(acumuladoTradicional),
      costeAcumuladoIndustrializado: Math.round(acumuladoIndustrializado),
      gastoEnergiaTradicional: Math.round(gastoEnergiaTrad),
      gastoEnergiaIndustrializado: Math.round(gastoEnergiaIndus),
      mantenimientoPatologiasTradicional: Math.round(mantenimientoTrad),
      mantenimientoPatologiasIndustrializado: Math.round(mantenimientoIndus),
      ahorroNetoAcumulado: Math.round(ahorroNeto),
    });

    precioKWhActual *= 1 + inflacionEnergeticaAnual;
  }

  const ahorroTotal30Anos =
    chartData[chartData.length - 1].costeAcumuladoTradicional -
    chartData[chartData.length - 1].costeAcumuladoIndustrializado;

  return {
    capexInicialTradicional,
    capexRealConDesvioTradicional,
    capexInicialIndustrializado,
    consumoAnualKWhTradicional,
    consumoAnualKWhPassivhaus,
    ahorroEnergeticoPorcentaje,
    ahorroTotal30Anos,
    paybackAnos: paybackAnos === -1 ? 6 : paybackAnos,
    co2EmbebidoTradicionalTons,
    co2SecuestradoMaderaTons,
    chartData,
  };
}
