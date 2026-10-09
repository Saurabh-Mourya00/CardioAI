import React from 'react';
import { PATIENT_PRESETS } from '../../data/mockData';
import { Sparkles, UserCheck } from 'lucide-react';

interface PresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (id: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset
}) => {
  return (
    <div className="bg-[#ebeae5]/90 px-3 py-2 rounded-lg border border-[rgba(38,37,30,0.1)] mb-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[rgba(38,37,30,0.7)] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#f54e00]" />
          <span>Patient Case Presets</span>
        </span>
        <span className="text-[9px] font-mono text-[rgba(38,37,30,0.5)]">
          Quick Load
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {PATIENT_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const shortName =
            preset.id === 'preset-high-cad'
              ? '67M High CAD'
              : preset.id === 'preset-moderate-lad'
              ? '58F Mod LAD'
              : '38M Low Risk';

          const riskDot =
            preset.riskBadge === 'high'
              ? 'bg-[#cf2d56]'
              : preset.riskBadge === 'moderate'
              ? 'bg-[#c08532]'
              : 'bg-[#1f8a65]';

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              title={preset.name + ' — ' + preset.summary}
              className={`px-2 py-1.5 rounded-md text-[11px] font-mono transition-all text-left border cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-[#26251e] text-[#f2f1ed] border-[#26251e] shadow-xs'
                  : 'bg-[#f7f7f4] text-[#26251e] border-[rgba(38,37,30,0.1)] hover:bg-[#e1e0db] hover:border-[rgba(38,37,30,0.25)]'
              }`}
            >
              <span className="truncate font-semibold text-[10px] sm:text-[11px]">
                {shortName}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-1 ${riskDot}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

