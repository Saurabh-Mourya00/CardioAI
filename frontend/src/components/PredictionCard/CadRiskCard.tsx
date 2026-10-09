import React from 'react';
import {
  SinglePrediction,
  getRiskCategory,
  getRiskLabel,
  getRiskColorHex,
  getRiskBadgeClasses
} from '../../types/prediction';
import { HeartPulse, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

interface CadRiskCardProps {
  prediction?: SinglePrediction | null;
  isLoading: boolean;
}

export const CadRiskCard: React.FC<CadRiskCardProps> = ({
  prediction,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#e6e5e0] rounded-xl p-5 border border-[rgba(38,37,30,0.1)] animate-pulse">
        <div className="h-4 bg-[#ebeae5] rounded w-1/3 mb-3" />
        <div className="h-8 bg-[#ebeae5] rounded w-1/2 mb-4" />
        <div className="h-2 bg-[#ebeae5] rounded w-full" />
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-[#e6e5e0] rounded-xl p-5 border border-[rgba(38,37,30,0.1)] text-center text-[#26251e]">
        <Shield className="w-8 h-8 text-[rgba(38,37,30,0.4)] mx-auto mb-2" />
        <h4 className="font-semibold text-sm">No Active Prediction</h4>
        <p className="text-xs text-[rgba(38,37,30,0.6)] mt-1">
          Complete patient evaluation form and submit to run CAD assessment.
        </p>
      </div>
    );
  }

  const prob = prediction.probability;
  const riskCategory = getRiskCategory(prob);
  const riskLabel = getRiskLabel(riskCategory);
  const colorHex = getRiskColorHex(prob);
  const badgeClasses = getRiskBadgeClasses(riskCategory);
  const isCad = prediction.label === 'CAD';

  return (
    <div className="bg-[#e6e5e0] rounded-xl p-5 border border-[rgba(38,37,30,0.12)] shadow-sm text-[#26251e]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-[#f54e00]" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[rgba(38,37,30,0.65)]">
            Coronary Artery Disease (CAD)
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${badgeClasses.bg} ${badgeClasses.border}`}
        >
          {prediction.label}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1 mb-3">
        <div>
          <span className="font-mono text-3xl font-extrabold tracking-tight" style={{ color: colorHex }}>
            {Math.round(prob * 100)}%
          </span>
          <span className="text-xs text-[rgba(38,37,30,0.6)] ml-1 font-mono">
            CAD Probability
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold block text-[#26251e]">
            {riskLabel}
          </span>
          <span className="text-[10px] text-[rgba(38,37,30,0.55)]">
            {isCad ? 'High Likelihood of Significant CAD' : 'Low Obstructive Disease Likelihood'}
          </span>
        </div>
      </div>

      {/* Probability bar with risk cutoffs */}
      <div className="space-y-1">
        <div className="w-full bg-[#ebeae5] h-2.5 rounded-full overflow-hidden border border-[rgba(38,37,30,0.08)]">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.round(prob * 100)}%`,
              backgroundColor: colorHex
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-[rgba(38,37,30,0.5)] px-0.5">
          <span>0%</span>
          <span>30% (Mod)</span>
          <span>60% (High)</span>
          <span>80% (V.High)</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
