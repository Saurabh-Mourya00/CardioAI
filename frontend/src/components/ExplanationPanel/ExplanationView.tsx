import React from 'react';
import { ExplanationResponse, VesselKey } from '../../types/prediction';
import { ExplanationStatus } from '../../hooks/usePrediction';
import {
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ExplanationViewProps {
  explanation?: ExplanationResponse | null;
  status: ExplanationStatus;
  selectedTarget: 'CAD' | VesselKey;
  onSelectTarget: (target: 'CAD' | VesselKey) => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  explanation,
  status,
  selectedTarget,
  onSelectTarget
}) => {
  const targets: Array<{ key: 'CAD' | VesselKey; label: string }> = [
    { key: 'CAD', label: 'Overall CAD' },
    { key: 'lad', label: 'LAD Artery' },
    { key: 'lcx', label: 'LCX Artery' },
    { key: 'rca', label: 'RCA Artery' }
  ];

  return (
    <div className="bg-[#e6e5e0] rounded-xl p-4 border border-[rgba(38,37,30,0.12)] shadow-sm text-[#26251e]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#cf2d56]" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[rgba(38,37,30,0.8)]">
            Model Explainability (SHAP Values)
          </h3>
        </div>

        {/* Target Tabs */}
        <div className="flex items-center gap-1 bg-[#ebeae5] p-0.5 rounded-lg border border-[rgba(38,37,30,0.08)]">
          {targets.map((t) => (
            <button
              key={t.key}
              onClick={() => onSelectTarget(t.key)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                selectedTarget === t.key
                  ? 'bg-[#26251e] text-[#f2f1ed] shadow-xs'
                  : 'text-[rgba(38,37,30,0.65)] hover:text-[#26251e]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[rgba(38,37,30,0.6)] mb-3 leading-relaxed">
        Feature attribution shows how individual clinical inputs push prediction risk higher
        (<span className="text-[#cf2d56] font-semibold">+Risk</span>) or lower
        (<span className="text-[#1f8a65] font-semibold">−Risk</span>) relative to baseline.
      </p>

      {/* State Rendering */}
      {status === 'loading' && (
        <div className="py-8 text-center text-xs text-[rgba(38,37,30,0.6)] space-y-2">
          <div className="w-6 h-6 border-2 border-[#26251e] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono">Computing SHAP feature attributions...</p>
        </div>
      )}

      {status === 'unavailable' && (
        <div className="py-6 px-4 bg-[#f2f1ed] rounded-lg border border-[rgba(38,37,30,0.1)] text-center">
          <Clock className="w-6 h-6 text-[rgba(38,37,30,0.4)] mx-auto mb-1.5" />
          <h4 className="text-xs font-semibold text-[#26251e]">Waiting for Model Explanation</h4>
          <p className="text-[11px] text-[rgba(38,37,30,0.6)] mt-1 max-w-sm mx-auto">
            The FastAPI endpoint <code className="font-mono text-[#26251e]">POST /explain</code> has not returned SHAP explanations for this target yet.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="py-4 px-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-[#cf2d56] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Failed to retrieve SHAP values from server.</span>
        </div>
      )}

      {status === 'success' && explanation && explanation.features.length > 0 && (
        <div className="space-y-2.5">
          {/* Legend */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[rgba(38,37,30,0.6)] pb-1 border-b border-[rgba(38,37,30,0.08)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-[#1f8a65]" />
              <span>Protective (Reduces Risk)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-[#cf2d56]" />
              <span>Risk Factor (Increases Risk)</span>
            </span>
          </div>

          {/* Divergent Horizontal SHAP Bars */}
          <div className="space-y-2 pt-1">
            {explanation.features.map((item, idx) => {
              const isPositive = item.shap_value >= 0;
              const absVal = Math.abs(item.shap_value);
              // Max scale normalization (assuming max shap around 0.35)
              const maxScale = 0.32;
              const barWidthPercent = Math.min(100, Math.round((absVal / maxScale) * 100));

              return (
                <div key={idx} className="bg-[#f2f1ed] p-2 rounded-lg border border-[rgba(38,37,30,0.06)]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#26251e]">
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-[#cf2d56] shrink-0" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-[#1f8a65] shrink-0" />
                      )}
                      <span className="truncate max-w-[180px] sm:max-w-[220px]" title={item.feature}>
                        {item.feature}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-[rgba(38,37,30,0.55)]">
                        val: {String(item.value)}
                      </span>
                      <span
                        className={`font-semibold ${
                          isPositive ? 'text-[#cf2d56]' : 'text-[#1f8a65]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {item.shap_value.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar with center line */}
                  <div className="relative w-full h-2 bg-[#ebeae5] rounded-full overflow-hidden flex items-center">
                    {/* Zero tick in middle */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[rgba(38,37,30,0.25)] z-10" />

                    {isPositive ? (
                      <div
                        className="h-full bg-[#cf2d56] rounded-r-full transition-all duration-500 absolute left-1/2"
                        style={{ width: `${barWidthPercent / 2}%` }}
                      />
                    ) : (
                      <div
                        className="h-full bg-[#1f8a65] rounded-l-full transition-all duration-500 absolute right-1/2"
                        style={{ width: `${barWidthPercent / 2}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model info footer */}
          <div className="text-[10px] text-[rgba(38,37,30,0.5)] pt-1 flex items-center justify-between">
            <span>Target: {explanation.target}</span>
            {explanation.base_value !== undefined && (
              <span>Model Expected Value (E[f(x)]): {explanation.base_value}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
