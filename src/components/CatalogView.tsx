import React, { useState } from 'react';
import {
  Trees,
  Check,
  Bed,
  Bath,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CatalogModel {
  id: string;
  name: string;
  tagline: string;
  surfaceM2: number;
  bedrooms: number;
  bathrooms: number;
  assemblyDays: number;
  priceTurnkey: number;
  co2SequesteredTons: number;
  energyDemand: number;
  structureType: string;
  features: string[];
}

const CATALOG_MODELS: CatalogModel[] = [
  {
    id: 'nordica-115',
    name: 'Nórdica Kompakt 115',
    tagline: 'Eficiencia extrema en una planta, ideal para presupuestos contenidos sin renunciar al estándar Passivhaus.',
    surfaceM2: 115,
    bedrooms: 3,
    bathrooms: 2,
    assemblyDays: 4,
    priceTurnkey: 215000,
    co2SequesteredTons: 24.5,
    energyDemand: 14,
    structureType: 'Entramado Ligero de Madera & SATE Fibra Madera 18 cm',
    features: [
      'Montaje de estructura y cubierta estanca en 4 días',
      'VMC de doble flujo con 92% de recuperación térmica',
      'Triple vidrio con argón y factor solar selectivo',
      'Precio 100% cerrado por contrato vinculante',
      'Blower Door garantizado n50 ≤ 0.5 h⁻¹',
    ],
  },
  {
    id: 'atelier-160',
    name: 'Atelier Bosque 160',
    tagline: 'Doble altura con forjados de madera contralaminada (CLT) vista y porches bioclimáticos.',
    surfaceM2: 160,
    bedrooms: 4,
    bathrooms: 2,
    assemblyDays: 6,
    priceTurnkey: 290000,
    co2SequesteredTons: 36.2,
    energyDemand: 12,
    structureType: 'Madera Contralaminada (CLT) 5 capas + Aislamiento Continuo',
    features: [
      'Paredes y techos en madera de pino nórdico PEFC vista interior',
      'Envolvente hermética continua ensayada en fábrica',
      'Protección solar pasiva mediante voladizos calculados para verano',
      'Montaje milimétrico mediante grúa de alta precisión',
      'Factura de climatización estimada en 22 €/mes',
    ],
  },
  {
    id: 'solar-210',
    name: 'Passiv Villa Solar 210',
    tagline: 'Edificio de energía positiva (Passivhaus Plus) con cubierta vegetal y pérgola fotovoltaica integrada.',
    surfaceM2: 210,
    bedrooms: 4,
    bathrooms: 3,
    assemblyDays: 7,
    priceTurnkey: 385000,
    co2SequesteredTons: 49.0,
    energyDemand: 10,
    structureType: 'Híbrido CLT + Entramado Avanzado + Cubierta Vegetal',
    features: [
      'Genera más energía de la que consume al cabo del año',
      'Secuestro masivo de 49 toneladas de CO2 biogénico',
      'Calidad del aire interior con sensor de CO2 y filtro HEPA F7',
      'Garantía estructural de 50 años sin patologías de condensación',
      'Entrega de llaves notarial en 5 meses exactos desde cimentación',
    ],
  },
];

export const CatalogView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<CatalogModel>(CATALOG_MODELS[0]);

  const formatoEuros = (val: number) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner: Clean, white, airy */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
              Catálogo Oficial de Viviendas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Modelos Passivhaus de Madera Técnica
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Componentes fabricados con precisión milimétrica en ambiente seco controlado.
              Ensamblaje en parcela en 4 a 7 días. Precio y fecha de entrega garantizados por contrato.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center shrink-0">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              Garantía Contractual
            </span>
            <strong className="text-2xl font-black text-emerald-800 block mt-1">0% Desvíos</strong>
            <span className="text-xs text-emerald-700 block mt-0.5">Penalización por retraso</span>
          </div>
        </div>

        {/* Model Cards Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {CATALOG_MODELS.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`text-left p-6 rounded-2xl border-2 transition-all space-y-3 ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-700 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{model.surfaceM2} m²</span>
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
                    {model.assemblyDays} días montaje
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg">{model.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {model.tagline}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5" />
                    {model.bedrooms} dorm
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5" />
                    {model.bathrooms} baños
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-slate-500 block">Precio Llave en Mano</span>
                  <strong className="text-lg font-bold text-slate-900 block">
                    {formatoEuros(model.priceTurnkey)}
                  </strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Model Deep Dive: Clean white card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{selectedModel.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedModel.structureType}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Precio notarial cerrado</span>
            <strong className="text-2xl font-black text-emerald-800">
              {formatoEuros(selectedModel.priceTurnkey)}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ventajas Constructivas Clave
            </h4>
            <div className="space-y-2.5">
              {selectedModel.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                  <span className="leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ficha Técnica de Rendimiento
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Demanda Climatización:</span>
                <strong className="text-emerald-800">{selectedModel.energyDemand} kWh/m²/año</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Carbono Secuestrado Biogénico:</span>
                <strong className="text-emerald-800">-{selectedModel.co2SequesteredTons} tCO2</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Hermeticidad Blower Door:</span>
                <strong className="text-slate-900">n50 ≤ 0.5 ren/h</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Plazo en seco en parcela:</span>
                <strong className="text-slate-900">{selectedModel.assemblyDays} días</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
