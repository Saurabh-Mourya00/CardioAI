import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const MedicalDisclaimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`shrink-0 bg-[#ebeae5] border-b border-[rgba(38,37,30,0.1)] px-3 sm:px-4 py-1 text-xs text-[#26251e] flex items-center justify-between gap-2 flex-wrap ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="p-0.5 rounded bg-[#cf2d56]/15 text-[#cf2d56] shrink-0">
          <AlertTriangle className="w-3 h-3" />
        </span>
        <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wide font-mono text-[rgba(38,37,30,0.7)] shrink-0">
          Notice:
        </span>
        <span className="text-[10px] sm:text-[11px] text-[#26251e]/85 truncate">
          Decision support / educational demonstration only. Not a substitute for professional medical diagnosis or imaging.
        </span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-[rgba(38,37,30,0.6)] font-mono ml-auto shrink-0 hidden md:flex">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#1f8a65]" />
          <span>Targets Excluded</span>
        </span>
        <span>•</span>
        <span>Z-Alizadeh Sani Alignment</span>
      </div>
    </div>
  );
};
