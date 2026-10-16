import React, { useState, useMemo } from 'react';
import { calculateLCC } from '../utils/gameLogic';
import {
  TrendingUp,
  Zap,
  ShieldAlert,
  Trees,
  CheckCircle,
  PiggyBank,
  Flame,
  Snowflake,
  Wind,
} from 'lucide-react';

export const LCCSimulatorView: React.FC = () => {
  const [areaM2, setAreaM2] = useState<number>(140);
  const [costeKWh, setCosteKWh] = useState<number>(0.22);
  const [inflacionPorc, setInflacionPorc] = useState<number>(4);
  const [years, setYears] = useState<number>(30);

  const lcc = useMemo(() => {
    return calculateLCC({
      areaM2,
      costeKWh,
      inflacionEnergeticaAnual: inflacionPorc / 100,
      years,
    });
  }, [areaM2, costeKWh, inflacionPorc, years]);

  const formatoEuros = (val: number) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';

  const chartHeight = 280;
  const chartWidth = 720;
  const padding = { top: 25, right: 35, bottom: 45, left: 75 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = Math.max(
    ...lcc.chartData.map((d) =>
      Math.max(d.costeAcumuladoTradicional, d.costeAcumuladoIndustrializado)
    )
  );
  const minVal = Math.min(
    ...lcc.chartData.map((d) =>
      Math.min(d.costeAcumuladoTradicional, d.costeAcumuladoIndustrializado)
    )
  );

  const getX = (year: number) =>
    padding.left + ((year - 1) / (years - 1 || 1)) * innerWidth;
  const getY = (val: number) =>
    padding.top + innerHeight - ((val - minVal) / (maxVal - minVal || 1)) * innerHeight;

  const pointsTrad = lcc.chartData.map((d) => `${getX(d.year)},${getY(d.costeAcumuladoTradicional)}`).join(' ');
  const pointsIndus = lcc.chartData.map((d) => `${getX(d.year)},${getY(d.costeAcumuladoIndustrializado)}`).join(' ');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Introduction: Clean, white, airy */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
              Dolor 3: Coste a Largo Plazo
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simulador de Coste del Ciclo de Vida (LCC a 30 Años)
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
              El 75% del coste total de tu vivienda se define durante los 30 años posteriores a la
              entrega de llaves. Compara matemáticamente la factura y el mantenimiento de una
              construcción convencional frente al estándar Passivhaus industrializado en madera.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center shrink-0">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              Ahorro Neto Acumulado
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800 block mt-1">
              {formatoEuros(lcc.ahorroTotal30Anos)}
            </span>
            <span className="text-xs text-emerald-700 block mt-0.5 font-medium">
              Amortizado en el Año {lcc.paybackAnos}
            </span>
          </div>
        </div>

        {/* Accessible Sliders Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* 1. Superficie */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Superficie útil:</span>
              <strong className="text-slate-900 font-bold">{areaM2} m²</strong>
            </div>
            <input
              type="range"
              min="90"
              max="280"
              step="10"
              value={areaM2}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              aria-label="Superficie de la vivienda en metros cuadrados"
              className="w-full accent-emerald-700 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>90 m²</span>
              <span>280 m²</span>
            </div>
          </div>

          {/* 2. Coste kWh */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Coste de la luz:</span>
              <strong className="text-slate-900 font-bold">{costeKWh.toFixed(2)} €/kWh</strong>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.35"
              step="0.01"
              value={costeKWh}
              onChange={(e) => setCosteKWh(Number(e.target.value))}
              aria-label="Coste de la electricidad en euros por kilovatio hora"
              className="w-full accent-emerald-700 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0.15 €</span>
              <span>0.35 €</span>
            </div>
          </div>

          {/* 3. Inflación energética */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Inflación anual:</span>
              <strong className="text-slate-900 font-bold">{inflacionPorc}% anual</strong>
            </div>
            <input
              type="range"
              min="2"
              max="7"
              step="0.5"
              value={inflacionPorc}
              onChange={(e) => setInflacionPorc(Number(e.target.value))}
              aria-label="Inflación anual de la energía"
              className="w-full accent-emerald-700 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>2%</span>
              <span>7%</span>
            </div>
          </div>

          {/* 4. Horizonte temporal */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Periodo analizado:</span>
              <strong className="text-slate-900 font-bold">{years} años</strong>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="5"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              aria-label="Años del ciclo de vida"
              className="w-full accent-emerald-700 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>10 años</span>
              <span>30 años</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Comparative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Tradicional */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Obra Tradicional Húmeda</h3>
              <p className="text-xs text-slate-500">Ladrillo, hormigón y aislamiento estándar CTE</p>
            </div>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
              +18.5% Desvío Real
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Presupuestado Inicial</span>
              <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                {formatoEuros(lcc.capexInicialTradicional)}
              </strong>
            </div>
            <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200">
              <span className="text-rose-900 font-medium block">Coste Real con Desvíos</span>
              <strong className="text-sm font-bold text-rose-900 block mt-0.5">
                {formatoEuros(lcc.capexRealConDesvioTradicional)}
              </strong>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Demanda energética:</span>
              <strong className="text-slate-900">95 kWh/m²/año</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Factura clima mensual (Año 1):</span>
              <strong className="text-rose-700">
                ~{formatoEuros((lcc.consumoAnualKWhTradicional * costeKWh) / 12)}/mes
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Reparaciones de moho y grietas (30 años):</span>
              <strong className="text-rose-700">~38.500 €</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Huella ecológica emitida:</span>
              <strong className="text-slate-800">+{lcc.co2EmbebidoTradicionalTons.toFixed(1)} tCO2</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Passivhaus Industrializada */}
        <div className="bg-white border-2 border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Industrializado Madera Passivhaus</h3>
              <p className="text-xs text-slate-500">Madera técnica, triple vidrio, VMC y n50 ≤ 0.6</p>
            </div>
            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
              0% Desvío Notarial
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
              <span className="text-emerald-900 font-medium block">Contrato Llave en Mano</span>
              <strong className="text-sm font-bold text-emerald-950 block mt-0.5">
                {formatoEuros(lcc.capexInicialIndustrializado)}
              </strong>
            </div>
            <div className="bg-emerald-100/60 p-3.5 rounded-xl border border-emerald-200">
              <span className="text-emerald-900 font-medium block">Desvío Económico</span>
              <strong className="text-sm font-bold text-emerald-800 block mt-0.5">0 € (Blindado)</strong>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Demanda energética:</span>
              <strong className="text-emerald-800">16 kWh/m²/año (-83%)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Factura clima mensual (Año 1):</span>
              <strong className="text-emerald-800">
                ~{formatoEuros((lcc.consumoAnualKWhPassivhaus * costeKWh) / 12)}/mes
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Patologías de humedad:</span>
              <strong className="text-emerald-800">0 € (VMC continua)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Carbono fijado biogénicamente:</span>
              <strong className="text-emerald-800">{lcc.co2SecuestradoMaderaTons.toFixed(1)} tCO2</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Multi-Year Chart: Light, clean, airy */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              Evolución del Coste Total Acumulado (Construcción + Energía + Mantenimiento)
            </h3>
            <p className="text-xs text-slate-500">
              La inversión en Passivhaus se amortiza por completo en el <strong>Año {lcc.paybackAnos}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500 rounded" />
              <span className="text-slate-700">Tradicional</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-600 rounded" />
              <span className="text-slate-700">Madera Passivhaus</span>
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto pt-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[550px]">
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const yPos = padding.top + innerHeight * (1 - ratio);
              const val = minVal + ratio * (maxVal - minVal);
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={chartWidth - padding.right}
                    y2={yPos}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    className="text-[11px] font-sans fill-slate-500"
                  >
                    {Math.round(val / 1000)}k €
                  </text>
                </g>
              );
            })}

            {/* X Axis years */}
            {lcc.chartData
              .filter((d) => d.year === 1 || d.year % 5 === 0 || d.year === years)
              .map((d) => (
                <text
                  key={d.year}
                  x={getX(d.year)}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="text-[11px] font-sans fill-slate-500 font-medium"
                >
                  Año {d.year}
                </text>
              ))}

            {/* Line Tradicional (Rose) */}
            <polyline
              fill="none"
              stroke="#e11d48"
              strokeWidth="3"
              points={pointsTrad}
            />

            {/* Line Industrializado (Emerald) */}
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              points={pointsIndus}
            />

            {/* Payback marker vertical dashed line */}
            {lcc.paybackAnos > 0 && (
              <g>
                <line
                  x1={getX(lcc.paybackAnos)}
                  y1={padding.top}
                  x2={getX(lcc.paybackAnos)}
                  y2={padding.top + innerHeight}
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(lcc.paybackAnos)}
                  cy={getY(lcc.chartData[lcc.paybackAnos - 1]?.costeAcumuladoIndustrializado || 0)}
                  r="6"
                  fill="#d97706"
                />
                <text
                  x={getX(lcc.paybackAnos) + 8}
                  y={padding.top + 20}
                  className="text-xs font-bold font-sans fill-amber-700"
                >
                  Amortizado: Año {lcc.paybackAnos}
                </text>
              </g>
            )}
          </svg>
        </div>
      </section>
    </div>
  );
};
