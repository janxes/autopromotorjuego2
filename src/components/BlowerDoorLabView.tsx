import React, { useState } from 'react';
import {
  Wind,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Layers,
  Gauge,
} from 'lucide-react';

export const BlowerDoorLabView: React.FC = () => {
  const [tapeSealed, setTapeSealed] = useState<boolean>(true);
  const [pipesSealed, setPipesSealed] = useState<boolean>(true);
  const [blindsSealed, setBlindsSealed] = useState<boolean>(true);
  const [windowsQuality, setWindowsQuality] = useState<'triple' | 'double_standard' | 'sliding'>('triple');
  const [vmcFlow, setVmcFlow] = useState<boolean>(true);
  const [pressurePa, setPressurePa] = useState<number>(50);

  let calculatedN50 = 0.35;
  if (!tapeSealed) calculatedN50 += 1.8;
  if (!pipesSealed) calculatedN50 += 1.2;
  if (!blindsSealed) calculatedN50 += 1.6;
  if (windowsQuality === 'double_standard') calculatedN50 += 0.9;
  if (windowsQuality === 'sliding') calculatedN50 += 2.4;
  if (!vmcFlow) calculatedN50 += 1.4;

  const isPassivhaus = calculatedN50 <= 0.6;
  const isAceptable = calculatedN50 <= 2.0;

  const houseVolumeM3 = 350;
  const airLeakageM3h = calculatedN50 * houseVolumeM3 * Math.sqrt(Math.abs(pressurePa) / 50);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner: Clean, white, airy */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
              Test Blower Door & Hermeticidad (ISO 9972)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Laboratorio Passivhaus Interactivo
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
              El Blower Door somete la casa a 50 Pascales de presión. En el estándar Passivhaus,
              el valor <strong>n50 no puede superar 0,6 renovaciones/hora</strong>. Descubre cómo las cintas
              y pasamuros sellados evitan que tu casa se convierta en un colador térmico.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border-2 text-center shrink-0 transition ${
              isPassivhaus
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                : isAceptable
                ? 'bg-amber-50 border-amber-500 text-amber-950'
                : 'bg-rose-50 border-rose-500 text-rose-950'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider block">
              Resultado n50 medido
            </span>
            <strong className="text-3xl font-black block mt-0.5">
              {calculatedN50.toFixed(2)} <span className="text-sm font-normal">ren/h</span>
            </strong>
            <span className="text-xs font-bold block mt-1">
              {isPassivhaus ? '✅ Passivhaus Certificado' : isAceptable ? '⚠️ CTE Básico' : '❌ Colador Térmico'}
            </span>
          </div>
        </div>

        {/* The 5 Principles: Clean cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { num: '1', title: 'Aislamiento Continuo', desc: 'Sin cortes térmicos' },
            { num: '2', title: 'Sin Puentes Térmicos', desc: 'Cálculo isotérmico' },
            { num: '3', title: 'Triple Vidrio Argón', desc: 'Vidrio bajo emisivo' },
            { num: '4', title: 'Hermeticidad n50', desc: 'Cintas continuas' },
            { num: '5', title: 'VMC con Recuperador', desc: 'Aire puro 24/7' },
          ].map((p) => (
            <div key={p.num} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-xs font-bold text-emerald-800 block">{p.title}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{p.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Testing Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Toggles (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-emerald-700" />
            Puntos Críticos de Fuga en la Envolvente
          </h3>

          {/* Toggle 1: Cintas */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">
                1. Cintas de Estanqueidad en Solera y Muros
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">Sellado elástico continuo Siga/ProClima</p>
            </div>
            <button
              onClick={() => setTapeSealed(!tapeSealed)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                tapeSealed ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
              }`}
            >
              {tapeSealed ? 'Sellado (+0.0)' : 'Sin sellar (+1.8)'}
            </button>
          </div>

          {/* Toggle 2: Pasamuros */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">
                2. Pasatubos de Saneamiento y Electricidad
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">Manguitos de EPDM vs hueco con espuma vieja</p>
            </div>
            <button
              onClick={() => setPipesSealed(!pipesSealed)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                pipesSealed ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
              }`}
            >
              {pipesSealed ? 'Manguito (+0.0)' : 'Hueco abierto (+1.2)'}
            </button>
          </div>

          {/* Toggle 3: Cajas de persiana */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">
                3. Cajas de Persiana
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">Persiana exterior hermética vs caja con pasacintas</p>
            </div>
            <button
              onClick={() => setBlindsSealed(!blindsSealed)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                blindsSealed ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
              }`}
            >
              {blindsSealed ? 'Exterior (+0.0)' : 'Caja con cinta (+1.6)'}
            </button>
          </div>

          {/* Selector: Vidrio */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <strong className="text-sm font-bold text-slate-900 block">4. Calidad de Carpinterías</strong>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setWindowsQuality('triple')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  windowsQuality === 'triple'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Triple Vidrio (+0.0)
              </button>
              <button
                onClick={() => setWindowsQuality('double_standard')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  windowsQuality === 'double_standard'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Doble CTE (+0.9)
              </button>
              <button
                onClick={() => setWindowsQuality('sliding')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  windowsQuality === 'sliding'
                    ? 'bg-rose-700 text-white border-rose-700'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Corredera (+2.4)
              </button>
            </div>
          </div>

          {/* Toggle: VMC */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">
                5. Ventilación: VMC vs Rejillas Abiertas
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">VMC de doble flujo vs agujeros directos a fachada</p>
            </div>
            <button
              onClick={() => setVmcFlow(!vmcFlow)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                vmcFlow ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
              }`}
            >
              {vmcFlow ? 'VMC Cerrada (+0.0)' : 'Rejillas Abiertas (+1.4)'}
            </button>
          </div>
        </div>

        {/* Manometer & Fan (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
              <Gauge className="w-5 h-5 text-emerald-700" />
              Presión del Ensayo Blower Door
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-600">Diferencia de presión (ΔP):</span>
                <strong className="text-slate-900 font-bold">{pressurePa} Pascales (Pa)</strong>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={pressurePa}
                onChange={(e) => setPressurePa(Number(e.target.value))}
                aria-label="Presión del ventilador en Pascales"
                className="w-full accent-emerald-700 bg-slate-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>10 Pa</span>
                <span className="text-emerald-800 font-bold">50 Pa (Norma Passivhaus)</span>
                <span>70 Pa</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 mt-4">
              <span className="text-xs font-medium text-slate-500 block uppercase">Caudal de fuga estimado</span>
              <strong className="text-2xl sm:text-3xl font-black text-slate-900 block">
                {Math.round(airLeakageM3h)} m³/h
              </strong>
              <span className="text-xs text-slate-500 block">para un volumen interior de 350 m³</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl text-xs leading-relaxed border ${
              isPassivhaus
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-rose-50 text-rose-950 border-rose-200'
            }`}
          >
            {isPassivhaus ? (
              <p>
                ✅ <strong>Envolvente Hermética Ejemplar:</strong> No se producen corrientes parásitas.
                El aire no se escapa por las paredes ni se forman condensaciones ocultas.
              </p>
            ) : (
              <p>
                ❌ <strong>Peligro de Condensación:</strong> Con un n50 de {calculatedN50.toFixed(2)} ren/h,
                el calor se escapa continuamente y el vapor de agua genera moho negro en los encuentros fríos.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
