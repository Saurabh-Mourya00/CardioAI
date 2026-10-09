import React, { useState, useMemo } from 'react';
import { PatientData, FeatureCategory } from '../../types/patient';
import { FEATURE_SCHEMAS, CATEGORIES, FeatureMetadata } from '../../data/featureSchema';
import { PresetSelector } from './PresetSelector';
import { PredictionStatus } from '../../hooks/usePrediction';
import {
  Search,
  Activity,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
  Sliders,
  PanelLeftClose,
  ChevronLeft
} from 'lucide-react';

interface PatientFormProps {
  patientData: PatientData;
  activePresetId: string;
  predictionStatus: PredictionStatus;
  errorMessage: string | null;
  onUpdateField: (key: keyof PatientData, value: any) => void;
  onSelectPreset: (id: string) => void;
  onSubmit: () => void;
  onToggleCollapse?: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patientData,
  activePresetId,
  predictionStatus,
  errorMessage,
  onUpdateField,
  onSelectPreset,
  onSubmit,
  onToggleCollapse
}) => {
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('Demographics & Vitals');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter features based on search query or active category
  const visibleFeatures = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return FEATURE_SCHEMAS.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }
    return FEATURE_SCHEMAS.filter((f) => f.category === activeCategory);
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#e6e5e0] rounded-xl border border-[rgba(38,37,30,0.12)] p-3 sm:p-3.5 shadow-sm overflow-hidden text-[#26251e]">
      {/* Top Header with Collapse Button */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[rgba(38,37,30,0.1)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f54e00]" />
          <div>
            <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#26251e] leading-tight">
              Clinical Assessment
            </h2>
            <span className="text-[10px] text-[rgba(38,37,30,0.55)] font-mono">
              54 Features • Z-Alizadeh Sani
            </span>
          </div>
        </div>

        {/* Prominent Collapse Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar to maximize 3D heart view"
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#ebeae5] border border-[rgba(38,37,30,0.15)] text-[11px] font-mono font-medium text-[#26251e] hover:bg-[#26251e] hover:text-[#f2f1ed] transition-colors cursor-pointer shrink-0"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collapse</span>
          </button>
        )}
      </div>

      {/* Quick Patient Presets Bar */}
      <div className="shrink-0">
        <PresetSelector
          activePresetId={activePresetId}
          onSelectPreset={onSelectPreset}
        />
      </div>

      {/* Search and Category Tabs Bar */}
      <div className="shrink-0 space-y-2 mb-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgba(38,37,30,0.4)]" />
          <input
            type="text"
            placeholder="Search all 54 features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-[#f7f7f4] border border-[rgba(38,37,30,0.12)] rounded-lg text-xs placeholder:text-[rgba(38,37,30,0.4)] text-[#26251e] focus:outline-none focus:border-[#26251e]"
          />
        </div>

        {/* Category Pills (scrollable horizontally if needed) */}
        {!searchQuery && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              const count = FEATURE_SCHEMAS.filter((f) => f.category === cat).length;
              const shortLabel =
                cat === 'Demographics & Vitals'
                  ? 'Vitals'
                  : cat === 'History & Comorbidities'
                  ? 'History'
                  : cat === 'Symptoms & Exam'
                  ? 'Symptoms'
                  : cat === 'ECG Findings'
                  ? 'ECG'
                  : 'Labs & Echo';

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#26251e] text-[#f2f1ed] shadow-xs'
                      : 'bg-[#ebeae5] text-[rgba(38,37,30,0.7)] hover:text-[#26251e] hover:bg-[#e1e0db]'
                  }`}
                >
                  <span>{shortLabel}</span>
                  <span
                    className={`ml-1 px-1 py-0.1 rounded-full text-[9px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[rgba(38,37,30,0.6)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Scrollable Features Inputs Area (Fits screen height perfectly with flex-1 min-h-0) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {visibleFeatures.length === 0 ? (
          <div className="py-12 text-center text-xs text-[rgba(38,37,30,0.5)]">
            No clinical features matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visibleFeatures.map((schema) => {
              const currentValue = (patientData as any)[schema.key];

              return (
                <div
                  key={schema.key}
                  className="bg-[#f7f7f4] p-2 rounded-lg border border-[rgba(38,37,30,0.08)] flex flex-col justify-between"
                >
                  {/* Label & Unit */}
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <label
                      htmlFor={`input-${schema.key}`}
                      className="text-[11px] font-semibold text-[#26251e] truncate"
                      title={schema.description}
                    >
                      <span>{schema.label}</span>
                      {schema.unit && (
                        <span className="text-[10px] text-[rgba(38,37,30,0.5)] font-mono ml-0.5">
                          ({schema.unit})
                        </span>
                      )}
                    </label>
                    <span className="text-[8px] font-mono text-[rgba(38,37,30,0.4)] uppercase shrink-0">
                      {schema.key}
                    </span>
                  </div>

                  {/* Control */}
                  <div>
                    {schema.type === 'number' && (
                      <input
                        id={`input-${schema.key}`}
                        type="number"
                        min={schema.min}
                        max={schema.max}
                        step={schema.step || 1}
                        value={currentValue ?? ''}
                        onChange={(e) =>
                          onUpdateField(
                            schema.key,
                            e.target.value === '' ? 0 : parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-2 py-0.5 bg-[#ebeae5] border border-[rgba(38,37,30,0.12)] rounded text-xs font-mono text-[#26251e] focus:outline-none focus:border-[#26251e]"
                      />
                    )}

                    {schema.type === 'boolean_int' && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateField(schema.key, 0)}
                          className={`flex-1 py-0.5 text-[11px] rounded font-mono font-medium border transition-colors ${
                            currentValue === 0
                              ? 'bg-[#26251e] text-[#f2f1ed] border-[#26251e]'
                              : 'bg-[#ebeae5] text-[rgba(38,37,30,0.7)] border-[rgba(38,37,30,0.1)] hover:bg-[#e1e0db]'
                          }`}
                        >
                          0 (No)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateField(schema.key, 1)}
                          className={`flex-1 py-0.5 text-[11px] rounded font-mono font-medium border transition-colors ${
                            currentValue === 1
                              ? 'bg-[#cf2d56] text-white border-[#cf2d56]'
                              : 'bg-[#ebeae5] text-[rgba(38,37,30,0.7)] border-[rgba(38,37,30,0.1)] hover:bg-[#e1e0db]'
                          }`}
                        >
                          1 (Yes)
                        </button>
                      </div>
                    )}

                    {schema.type === 'boolean_str' && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateField(schema.key, 'N')}
                          className={`flex-1 py-0.5 text-[11px] rounded font-mono font-medium border transition-colors ${
                            currentValue === 'N'
                              ? 'bg-[#26251e] text-[#f2f1ed] border-[#26251e]'
                              : 'bg-[#ebeae5] text-[rgba(38,37,30,0.7)] border-[rgba(38,37,30,0.1)] hover:bg-[#e1e0db]'
                          }`}
                        >
                          No (N)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateField(schema.key, 'Y')}
                          className={`flex-1 py-0.5 text-[11px] rounded font-mono font-medium border transition-colors ${
                            currentValue === 'Y'
                              ? 'bg-[#cf2d56] text-white border-[#cf2d56]'
                              : 'bg-[#ebeae5] text-[rgba(38,37,30,0.7)] border-[rgba(38,37,30,0.1)] hover:bg-[#e1e0db]'
                          }`}
                        >
                          Yes (Y)
                        </button>
                      </div>
                    )}

                    {schema.type === 'select' && schema.options && (
                      <select
                        id={`input-${schema.key}`}
                        value={currentValue ?? ''}
                        onChange={(e) =>
                          onUpdateField(
                            schema.key,
                            isNaN(Number(e.target.value))
                              ? e.target.value
                              : Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-0.5 bg-[#ebeae5] border border-[rgba(38,37,30,0.12)] rounded text-xs font-mono text-[#26251e] focus:outline-none focus:border-[#26251e]"
                      >
                        {schema.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error notification banner if any */}
      {errorMessage && (
        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-[#cf2d56] flex items-start gap-1.5 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="leading-snug text-[11px]">{errorMessage}</span>
        </div>
      )}

      {/* Sticky Bottom Actions Bar */}
      <div className="mt-2.5 pt-2.5 border-t border-[rgba(38,37,30,0.1)] flex items-center justify-between gap-2 shrink-0">
        <div className="text-[10px] text-[rgba(38,37,30,0.55)] font-mono flex items-center gap-1">
          <Sliders className="w-3 h-3" />
          <span>Targets Excluded</span>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={predictionStatus === 'loading'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#26251e] text-[#f2f1ed] text-xs font-mono font-semibold tracking-wide hover:bg-[#cf2d56] active:scale-98 transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {predictionStatus === 'loading' ? (
            <>
              <div className="w-3 h-3 border-2 border-[#f2f1ed] border-t-transparent rounded-full animate-spin" />
              <span>Predicting...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Run Prediction</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
