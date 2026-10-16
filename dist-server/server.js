import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "10mb" }));
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
const SYSTEM_INSTRUCTION = `Eres el Game Master oficial y asesor pedag\xF3gico implacable, t\xE9cnico y con humor realista de "La Odisea del Autopromotor: De la Parcela al Hogar".
Tu misi\xF3n es guiar al usuario (un autopromotor novato con parcela y 250.000 \u20AC de presupuesto inicial) a trav\xE9s de un juego de rol interactivo por turnos de 5 niveles.

Debes ense\xF1ar de forma pr\xE1ctica, transparente y con humor realista los 3 grandes dolores del autopromotor:
1. La incertidumbre de los presupuestos tradicionales (tiempos de espera excesivos, partidas abiertas y desv\xEDos econ\xF3micos del 15% al 25%).
2. La lentitud e imprevistos de la obra h\xFAmeda in situ frente al montaje r\xE9cord en seco de los componentes industrializados en f\xE1brica.
3. El coste a largo plazo (Life Cycle Cost a 30 a\xF1os): c\xF3mo una envolvente t\xE9rmica estanca con triple vidrio y ventilaci\xF3n mec\xE1nica con recuperaci\xF3n de calor (VMC) garantiza salubridad, confort ac\xFAstico/t\xE9rmico y facturas m\xEDnimas frente a patolog\xEDas de condensaci\xF3n y moho.

Niveles del juego:
- Nivel 1: La Parcela y el Planteamiento Inicial (Presupuesto vs Fantas\xEDa, Cat\xE1logo vs A medida)
- Nivel 2: El Laberinto Burocr\xE1tico y la Licitaci\xF3n / Financiaci\xF3n (Partidas abiertas vs Contrato llave en mano cerrado)
- Nivel 3: La Obra: Barro y Lluvia vs Precisi\xF3n Milim\xE9trica en Taller (Obra h\xFAmeda in situ con rozas vs Montaje en seco con gr\xFAa en 5 d\xEDas de paneles de madera t\xE9cnica CLT/entramado)
- Nivel 4: La Envolvente T\xE9rmica y el Secreto Passivhaus (Test Blower Door n50 <= 0.6 h\u207B\xB9, VMC doble flujo >90% recuperaci\xF3n de calor, carpinter\xEDas triple vidrio vs condensaci\xF3n, moho y puentes t\xE9rmicos)
- Nivel 5: El Hogar a 30 A\xF1os (Life Cycle Cost TCO, facturas mensuales de 25\u20AC vs 280\u20AC, amortizaci\xF3n y certificado final de autopromotor)

Debes mantener y mostrar OBLIGATORIAMENTE un panel de estado al final de cada mensaje con el siguiente formato exacto:
\u{1F4CA} **ESTADO DEL AUTOPROMOTOR [NIVEL X/5: NOMBRE]**
- \u{1F4B0} Presupuesto Inicial: 250.000 \u20AC | Restante: XXX.XXX \u20AC
- \u{1F4C8} Desv\xEDo Econ\xF3mico Acumulado: +X% (X.XXX \u20AC)
- \u23F3 Tiempo Transcurrido: X meses (vs X meses previstos)
- \u{1F9E0} Nivel de Estr\xE9s / Salud Mental: XX/100 [Estado]
- \u{1F321}\uFE0F Confort T\xE9rmico & Salubridad: XX/100 [Estado]
- \u{1F332} Huella de Carbono: -XX tCO2 eq (Madera fijadora) / +XX tCO2 (Hormig\xF3n/Ladrillo)
- \u{1F3F7}\uFE0F Modelo Constructivo: [Industrializado Madera Passivhaus / Obra H\xFAmeda Tradicional / Mixto Indeciso]

Matem\xE1tica rigurosa:
- Temperatura requerida: 0.1, Top P: 0.95.
- Si el usuario toma atajos en obra tradicional o abarata en aislamiento, incrementa el desv\xEDo econ\xF3mico (+15% a +25%), el tiempo (+6 a +12 meses de retraso) y el estr\xE9s (+20 a +35).
- Si opta por componentes industrializados en madera t\xE9cnica por cat\xE1logo con est\xE1ndar Passivhaus, premia con desv\xEDos del 0%, tiempos r\xE9cord (5-6 meses), estr\xE9s bajo y confort t\xE9rmico 95-100 con huella de carbono negativa (secuestro biog\xE9nico).`;
app.post("/api/game/turn", async (req, res) => {
  try {
    const { history, userMessage, currentGameState, selectedOption } = req.body;
    const promptText = `
Contexto del estado actual de la partida:
${JSON.stringify(currentGameState, null, 2)}

Acci\xF3n o decisi\xF3n tomada por el autopromotor:
${selectedOption ? `Opci\xF3n seleccionada: "${selectedOption.label}" - ${selectedOption.description}` : userMessage || "Continuar la aventura"}

Instrucci\xF3n para el Game Master:
1. Narra con tono mordaz, divertido y pedag\xF3gicamente riguroso las consecuencias inmediatas de la decisi\xF3n del autopromotor.
2. Explica claramente la lecci\xF3n t\xE9cnica (sobrecostes de partidas abiertas, tiempos de fraguado vs montaje en seco, o balance Passivhaus/LCC).
3. Calcula con precisi\xF3n el nuevo estado num\xE9rico (presupuesto, desv\xEDo, meses, estr\xE9s, confort, huella de carbono, nivel 1-5).
4. Genera al final OBLIGATORIAMENTE el panel de estado formateado con exactitud:
\u{1F4CA} **ESTADO DEL AUTOPROMOTOR [NIVEL X/5: NOMBRE]**
- \u{1F4B0} Presupuesto Inicial: 250.000 \u20AC | Restante: XXX.XXX \u20AC
- \u{1F4C8} Desv\xEDo Econ\xF3mico Acumulado: +X% (X.XXX \u20AC)
- \u23F3 Tiempo Transcurrido: X meses (vs X meses previstos)
- \u{1F9E0} Nivel de Estr\xE9s / Salud Mental: XX/100 [Estado]
- \u{1F321}\uFE0F Confort T\xE9rmico & Salubridad: XX/100 [Estado]
- \u{1F332} Huella de Carbono: -XX tCO2 eq (Madera fijadora) / +XX tCO2 (Hormig\xF3n/Ladrillo)
- \u{1F3F7}\uFE0F Modelo Constructivo: [Industrializado Madera Passivhaus / Obra H\xFAmeda Tradicional / Mixto Indeciso]
5. Proporciona 2 a 3 nuevas opciones para el siguiente turno.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narration: {
              type: Type.STRING,
              description: "Narraci\xF3n del Game Master con humor y realismo."
            },
            didacticTip: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                impact: { type: Type.STRING }
              },
              required: ["title", "explanation", "impact"]
            },
            statusPanelMarkdown: {
              type: Type.STRING,
              description: "El panel exacto obligatorio comenzando con \u{1F4CA} **ESTADO DEL AUTOPROMOTOR [NIVEL X/5: NOMBRE]**"
            },
            updatedGameState: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.INTEGER },
                levelName: { type: Type.STRING },
                presupuestoRestante: { type: Type.NUMBER },
                desvioAcumuladoEuros: { type: Type.NUMBER },
                desvioAcumuladoPorcentaje: { type: Type.NUMBER },
                tiempoTranscurridoMeses: { type: Type.NUMBER },
                tiempoPrevistoMeses: { type: Type.NUMBER },
                estresSaludMental: { type: Type.NUMBER },
                estadoEstres: { type: Type.STRING },
                confortSalubridad: { type: Type.NUMBER },
                estadoConfort: { type: Type.STRING },
                huellaCarbono: { type: Type.NUMBER },
                modeloConstructivo: { type: Type.STRING },
                blowerDoorN50: { type: Type.NUMBER },
                vmcInstalado: { type: Type.BOOLEAN },
                tripleVidrio: { type: Type.BOOLEAN },
                gameOver: { type: Type.BOOLEAN },
                gameVictory: { type: Type.BOOLEAN }
              },
              required: [
                "level",
                "levelName",
                "presupuestoRestante",
                "desvioAcumuladoEuros",
                "desvioAcumuladoPorcentaje",
                "tiempoTranscurridoMeses",
                "estresSaludMental",
                "confortSalubridad",
                "huellaCarbono",
                "modeloConstructivo"
              ]
            },
            nextChoices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  recommended: { type: Type.BOOLEAN }
                },
                required: ["id", "label", "description"]
              }
            }
          },
          required: ["narration", "statusPanelMarkdown", "updatedGameState", "nextChoices"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.warn("Gemini API call failed or timed out, returning structured fallback:", error?.message);
    return res.status(500).json({
      error: "Gemini request error",
      details: error?.message
    });
  }
});
async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
