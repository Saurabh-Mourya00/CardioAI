import React from 'react';
import {
  VesselKey,
  SinglePrediction,
  getRiskCategory,
  getRiskLabel,
  getRiskColorHex,
  getRiskBadgeClasses
} from '../../types/prediction';
import { ChevronRight } from 'lucide-react';

interface VesselRiskCardProps {
  vesselKey: VesselKey;
  prediction?: SinglePrediction;
  isSelected: boolean;
  onSelect: () => void;
}

const VESSEL_TITLES: Record<VesselKey, { code: string; title: string }> = {
  lad: { code: 'LAD', title: 'Left Anterior Descending' },
  lcx: { code: 'LCX', title: 'Left Circumflex' },
  rca: { code: 'RCA', title: 'Right Coronary' }
};

export const VesselRiskCard: React.FC<VesselRiskCardProps> = ({
  vesselKey,
  prediction,
  isSelected,
  onSelect
}) => {
  const prob = prediction ? prediction.probability : 0.2;
  const riskCategory = getRiskCategory(prob);
  const riskLabel = getRiskLabel(riskCategory);
  const colorHex = getRiskColorHex(prob);
  const badgeClasses = getRiskBadgeClasses(riskCategory);
  const info = VESSEL_TITLES[vesselKey];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-[#f7f7f4] border-[#26251e] shadow-md ring-2 ring-[#26251e]/20'
          : 'bg-[#e6e5e0] border-[rgba(38,37,30,0.1)] hover:border-[rgba(38,37,30,0.25)] hover:bg-[#ebeae5]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: colorHex }}
          />
          <span className="font-mono font-bold text-sm text-[#26251e]">
            {info.code}
          </span>
          <span className="text-xs text-[rgba(38,37,30,0.6)] hidden sm:inline">
            ({info.title})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${badgeClasses.bg} ${badgeClasses.border}`}
          >
            {prediction?.label ?? 'Normal'}
          </span>
          <span
            className="font-mono text-sm font-bold"
            style={{ color: colorHex }}
          >
            {Math.round(prob * 100)}%
          </span>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isSelected ? 'text-[#26251e] translate-x-0.5' : 'text-[rgba(38,37,30,0.4)]'
            }`}
          />
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-[#ebeae5] h-1.5 rounded-full overflow-hidden mt-2.5 border border-[rgba(38,37,30,0.06)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.round(prob * 100)}%`,
            backgroundColor: colorHex
          }}
        />
      </div>

      <div className="flex justify-between items-center mt-1.5 text-[10px] text-[rgba(38,37,30,0.6)] font-mono">
        <span>Stenosis Probability</span>
        <span>{riskLabel}</span>
      </div>
    </button>
  );
};
