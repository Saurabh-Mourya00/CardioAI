import React from 'react';
import {
  VesselKey,
  SinglePrediction,
  VESSEL_DETAILS,
  getRiskCategory,
  getRiskLabel,
  getRiskColorHex,
  getRiskBadgeClasses
} from '../../types/prediction';
import { ShieldAlert, Activity, Heart, Info, ArrowUpRight } from 'lucide-react';

interface VesselDetailCardProps {
  vesselKey: VesselKey;
  prediction?: SinglePrediction;
  onClose?: () => void;
}

export const VesselDetailCard: React.FC<VesselDetailCardProps> = ({
  vesselKey,
  prediction
}) => {
  const details = VESSEL_DETAILS[vesselKey];
  const prob = prediction ? prediction.probability : 0.2;
  const riskCategory = getRiskCategory(prob);
  const riskLabel = getRiskLabel(riskCategory);
  const colorHex = getRiskColorHex(prob);
  const badgeClasses = getRiskBadgeClasses(riskCategory);

  return (
    <div className="bg-[#e6e5e0] rounded-xl p-4 border border-[rgba(38,37,30,0.12)] shadow-sm text-[#26251e] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: colorHex }}
            />
            <h3 className="font-mono text-base font-bold tracking-tight">
              {details.shortName}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${badgeClasses.bg} ${badgeClasses.border}`}
            >
              {prediction ? prediction.label : 'Pending'}
            </span>
          </div>
          <p className="text-xs text-[rgba(38,37,30,0.65)] mt-0.5 font-medium">
            {details.fullName}
          </p>
        </div>

        {/* Probability display */}
        <div className="text-right">
          <div className="font-mono text-xl font-bold tracking-tight" style={{ color: colorHex }}>
            {Math.round(prob * 100)}%
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[rgba(38,37,30,0.6)]">
            Risk: {riskLabel}
          </div>
        </div>
      </div>

      {/* Probability Gauge Bar */}
      <div className="w-full bg-[#ebeae5] h-2 rounded-full overflow-hidden mb-3.5 border border-[rgba(38,37,30,0.08)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.round(prob * 100)}%`,
            backgroundColor: colorHex
          }}
        />
      </div>

      {/* Clinical Breakdown Details */}
      <div className="space-y-2 text-xs bg-[#f2f1ed] p-3 rounded-lg border border-[rgba(38,37,30,0.08)]">
        <div>
          <span className="font-semibold text-[#26251e] block text-[11px] uppercase tracking-wide font-mono text-[rgba(38,37,30,0.65)]">
            Clinical Significance
          </span>
          <p className="text-[#26251e]/85 mt-0.5 leading-relaxed">
            {details.clinicalSignificance}
          </p>
        </div>

        <div className="pt-2 border-t border-[rgba(38,37,30,0.08)]">
          <span className="font-semibold text-[#26251e] block text-[11px] uppercase tracking-wide font-mono text-[rgba(38,37,30,0.65)]">
            Perfusion Territory
          </span>
          <p className="text-[#26251e]/80 mt-0.5 leading-relaxed">
            {details.perfusionTerritory}
          </p>
        </div>

        <div className="pt-2 border-t border-[rgba(38,37,30,0.08)]">
          <span className="font-semibold text-[#26251e] block text-[11px] uppercase tracking-wide font-mono text-[rgba(38,37,30,0.65)]">
            Anatomical Course
          </span>
          <p className="text-[#26251e]/80 mt-0.5 leading-relaxed">
            {details.anatomicalCourse}
          </p>
        </div>
      </div>

      {/* Non-lesion coordinates reminder */}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[rgba(38,37,30,0.55)] italic">
        <Info className="w-3 h-3 shrink-0" />
        <span>ML probability represents stenosis likelihood; not an exact physical plaque location.</span>
      </div>
    </div>
  );
};
