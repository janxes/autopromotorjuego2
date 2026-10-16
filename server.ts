import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `Eres el Game Master oficial y asesor pedagógico implacable, técnico y con humor realista de "La Odisea del Autopromotor: De la Parcela al Hogar".
Tu misión es guiar al usuario a través de un juego de rol interactivo por turnos de 5 niveles.
Enseñarás con rigor matemático (Temperatura: 0.1, Top P: 0.95) y humor realista los 3 grandes dolores del autopromotor:
1. La incertidumbre de los presupuestos tradicionales (partidas abiertas, demoras y desvíos económicos del 15% al 25%).
2. La lentitud e imprevistos de la obra húmeda in situ frente al montaje récord en seco de componentes industrializados en fábrica.
3. El coste a 30 años (Life Cycle Cost): envolvente térmica estanca, triple vidrio y VMC con recuperación de calor (>90%) garantizando salubridad y facturas mínimas frente a patologías de condensación y moho.

VALORES INICIALES:
- Presupuesto: 250.000 € (Desvíos: 0 €)
- Tiempo: Semana 0 (Previsto: Semana 24)
- Estrés: [■□□□□□□□□□] 10%
- Factura Energética: 35 €/mes
- Confort y Aire: Óptimo / Filtrado continuo

DINÁMICA Y REGLAS DE INTERACCIÓN OBLIGATORIAS:
1. Paso a paso (Turn-based): Presenta SOLO UN NIVEL a la vez. Plantea la situación narrativa, expone 2 o 3 opciones claras con letras (A, B...) y detente por completo esperando la respuesta. NUNCA resuelvas el juego en un solo mensaje.
2. Si el usuario toma una MALA DECISIÓN (Tradicional / Parches baratos / Presupuestos abiertos):
   - Aplica penalizaciones inmediatas severas en presupuesto, semanas y estrés.
   - Despliega de inmediato una tarjeta con este formato:
     > ⚠️ **ALERTA DEL AUTOPROMOTOR (Lección de Obra Real)**
     > *Impacto:* Explicación con crudeza e ironía realista de lo que acaba de pasar en la obra o en el banco.
     > *El porqué técnico:* Explicación didáctica (puentes térmicos, condensación intersticial, falta de test Blower Door, desajuste de gremios, intereses de carencia).
     > *La alternativa de catálogo industrializado:* Cómo la ingeniería previa BIM, la fabricación en clima controlado y el precio cerrado evitan este problema.
   - Ofrece siempre 2 caminos para continuar:
     1. Asumir el golpe y continuar con la penalización.
     2. Rebobinar y elegir la opción constructiva correcta.
3. Si el usuario elige la OPCIÓN PASSIVHAUS INDUSTRIALIZADA:
   - Valida la decisión explicando el fundamento técnico (montaje en seco, precisión milimétrica, estanqueidad ensayada, certidumbre contractual).
   - Mantén los costes blindados y avanza al siguiente hito.

PANEL DE ESTADO OBLIGATORIO al final de cada mensaje con el siguiente formato exacto:
📊 **ESTADO DEL AUTOPROMOTOR [NIVEL X/5: NOMBRE]**
- 💰 Presupuesto Inicial: 250.000 € | Restante: XXX.XXX €
- 📈 Desvío Económico Acumulado: +X% (X.XXX €)
- ⏳ Tiempo Transcurrido: Semana X (vs Semana X previstos)
- 🧠 Nivel de Estrés / Salud Mental: [■□□□□□□□□□] XX% [Estado]
- ⚡ Factura Energética: XX €/mes
- 🌡️ Confort y Aire: [Estado]
- 🌲 Huella de Carbono: -XX tCO2 eq (Madera fijadora) / +XX tCO2 (Hormigón/Ladrillo)
- 🏷️ Modelo Constructivo: [Industrializado Madera Passivhaus / Obra Húmeda Tradicional]`;

function generateStressBar(percent: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const blocks = Math.round(clamped / 10);
  return `[${'■'.repeat(blocks)}${'□'.repeat(10 - blocks)}] ${clamped}%`;
}

app.post('/api/game/turn', async (req: Request, res: Response) => {
  const { history, userMessage, currentGameState, selectedOption } = req.body || {};
  try {
    const promptText = `
Estado actual de la partida:
${JSON.stringify(currentGameState, null, 2)}

Acción o decisión tomada por el usuario:
${selectedOption ? `Opción elegida: [${selectedOption.letter || ''}] ${selectedOption.label} - ${selectedOption.description}` : userMessage || 'Continuar'}

Instrucciones para este turno:
1. Evalúa si es calibración inicial (Nivel 0) o uno de los 5 niveles del juego.
2. Si es una mala decisión tradicional:
   - Genera la tarjeta de ALERTA DEL AUTOPROMOTOR (Impacto, El porqué técnico, La alternativa de catálogo industrializado).
   - Genera las 2 opciones de continuación: (1) Asumir el golpe y continuar (2) Rebobinar y elegir la opción correcta.
   - Aplica penalización severa en presupuesto (-10.000 a -18.000 €), semanas (+4 a +16 semanas) y estrés (+20% a +35%).
3. Si es opción Passivhaus de catálogo:
   - Felicita con rigor técnico y avanza de nivel sin desvíos.
4. Genera el panel de estado formateado con precisión matemática.
5. Emite opciones A, B... para el próximo turno si no ha terminado.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narration: { type: Type.STRING },
            alertaAutopromotor: {
              type: Type.OBJECT,
              properties: {
                impacto: { type: Type.STRING },
                porqueTecnico: { type: Type.STRING },
                alternativaIndustrializada: { type: Type.STRING },
              },
            },
            statusPanelMarkdown: { type: Type.STRING },
            updatedGameState: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.INTEGER },
                levelName: { type: Type.STRING },
                faseNombre: { type: Type.STRING },
                presupuestoRestante: { type: Type.NUMBER },
                desvioAcumuladoEuros: { type: Type.NUMBER },
                desvioAcumuladoPorcentaje: { type: Type.NUMBER },
                tiempoSemanas: { type: Type.NUMBER },
                tiempoPrevistoSemanas: { type: Type.NUMBER },
                estresPorcentaje: { type: Type.NUMBER },
                estadoEstres: { type: Type.STRING },
                facturaEnergeticaMes: { type: Type.NUMBER },
                confortYAire: { type: Type.STRING },
                huellaCarbono: { type: Type.NUMBER },
                modeloConstructivo: { type: Type.STRING },
                gameOver: { type: Type.BOOLEAN },
                gameVictory: { type: Type.BOOLEAN },
              },
              required: [
                'level',
                'presupuestoRestante',
                'desvioAcumuladoEuros',
                'tiempoSemanas',
                'estresPorcentaje',
                'facturaEnergeticaMes',
                'confortYAire',
              ],
            },
            nextChoices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  letter: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  isBadDecision: { type: Type.BOOLEAN },
                  recommended: { type: Type.BOOLEAN },
                  isRewindAction: { type: Type.BOOLEAN },
                },
                required: ['id', 'label', 'description'],
              },
            },
          },
          required: ['narration', 'statusPanelMarkdown', 'updatedGameState', 'nextChoices'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini API call or rate-limit caught in server.ts:', error?.message);

    // Fallback logic
    const lvl = currentGameState?.level ?? 0;
    const isCalib = lvl === 0;
    const nextLvl = isCalib ? 1 : Math.min(5, lvl + 1);

    const isBad = selectedOption?.isBadDecision || selectedOption?.letter === 'A';
    const isRewind = selectedOption?.isRewindAction;

    let penalizacion = isBad ? 12000 : 0;
    let semanasSum = isBad ? 8 : 4;
    let estresNew = isBad
      ? Math.min(100, (currentGameState?.estresPorcentaje || 10) + 25)
      : Math.max(5, (currentGameState?.estresPorcentaje || 10) - 5);
    let facturaNew = isBad ? 180 : 35;
    let confortNew = isBad ? 'Disconfort y Puentes Térmicos' : 'Óptimo / Filtrado continuo';

    const nuevoRestante = Math.max(0, (currentGameState?.presupuestoRestante || 250000) - (isBad ? 40000 : 30000));
    const desvioEur = (currentGameState?.desvioAcumuladoEuros || 0) + penalizacion;
    const desvioPorc = (desvioEur / 250000) * 100;
    const tiempoSemanasTotal = (currentGameState?.tiempoSemanas || 0) + semanasSum;

    const estresBar = generateStressBar(estresNew);

    const statusPanelMarkdown = `📊 **ESTADO DEL AUTOPROMOTOR [NIVEL ${nextLvl}/5: Fase ${nextLvl}]**
- 💰 Presupuesto Inicial: 250.000 € | Restante: ${new Intl.NumberFormat('es-ES').format(nuevoRestante)} €
- 📈 Desvío Económico Acumulado: +${desvioPorc.toFixed(1)}% (+${new Intl.NumberFormat('es-ES').format(desvioEur)} €)
- ⏳ Tiempo Transcurrido: Semana ${tiempoSemanasTotal} (vs Semana 24 previstos)
- 🧠 Nivel de Estrés / Salud Mental: ${estresBar} [${estresNew > 40 ? 'Alerta por Sobrecostes' : 'Zen y en Control'}]
- ⚡ Factura Energética: ${facturaNew} €/mes
- 🌡️ Confort y Aire: ${confortNew}
- 🌲 Huella de Carbono: ${isBad ? '+32.0 tCO2 (Hormigón)' : '-28.4 tCO2 eq (Madera fijadora)'}
- 🏷️ Modelo Constructivo: [${isBad ? 'Obra Húmeda Tradicional' : 'Industrializado Madera Passivhaus'}]`;

    return res.json({
      narration: isBad
        ? `⚠️ Has optado por la vía tradicional o el recorte aparente. El impacto en obra es implacable:`
        : `✅ ¡Excelente decisión técnica! Validamos el estándar industrializado de madera técnica con precio y plazos garantizados.`,
      alertaAutopromotor: isBad
        ? {
            impacto:
              'Aparición inmediata de sobrecostes imprevistos, semanas de retraso y tensiones con la constructora.',
            porqueTecnico:
              'La falta de ingeniería previa BIM y la ausencia de estanqueidad provocan desajuste de gremios y puentes térmicos.',
            alternativaIndustrializada:
              'La fabricación industrializada en seco en taller con control numérico CNC y precio cerrado notarial evita cualquier desviación.',
          }
        : undefined,
      statusPanelMarkdown,
      updatedGameState: {
        level: nextLvl,
        levelName: `Nivel ${nextLvl}`,
        faseNombre: `Fase ${nextLvl}`,
        presupuestoRestante: nuevoRestante,
        desvioAcumuladoEuros: desvioEur,
        desvioAcumuladoPorcentaje: desvioPorc,
        tiempoSemanas: tiempoSemanasTotal,
        tiempoPrevistoSemanas: 24,
        estresPorcentaje: estresNew,
        estresBarra: estresBar,
        estadoEstres: estresNew > 40 ? 'Alerta por Sobrecostes' : 'Zen y en Control',
        facturaEnergeticaMes: facturaNew,
        confortYAire: confortNew,
        huellaCarbono: isBad ? 32 : -28.4,
        modeloConstructivo: isBad ? 'Obra Húmeda Tradicional' : 'Industrializado Madera Passivhaus',
        gameOver: nextLvl === 5,
        gameVictory: !isBad,
      },
      nextChoices: isBad
        ? [
            {
              id: 'CHOICE_CONTINUE',
              label: '1. Asumir el golpe y continuar con la penalización',
              description: 'Seguir adelante asumiendo los sobrecostes y los retrasos acumulados.',
            },
            {
              id: 'CHOICE_REWIND',
              label: '2. Rebobinar y elegir la opción constructiva correcta',
              description: 'Volver atrás para blindar el presupuesto y adoptar el estándar industrializado Passivhaus.',
              isRewindAction: true,
            },
          ]
        : [
            {
              id: `CHOICE_NEXT_A_${nextLvl}`,
              letter: 'A',
              label: 'Opción A: Vía Tradicional / Ahorro aparente',
              description: 'Aceptar soluciones convencionales con riesgo de imprevistos.',
              isBadDecision: true,
            },
            {
              id: `CHOICE_NEXT_B_${nextLvl}`,
              letter: 'B',
              label: 'Opción B: Estándar Industrializado Passivhaus',
              description: 'Precisión milimétrica en taller, hermeticidad ensayada y precio cerrado.',
              recommended: true,
            },
          ],
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
