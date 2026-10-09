import React from 'react';
import { VesselKey, PredictionResponse, getRiskColorHex } from '../../types/prediction';
import {
  RotateCcw,
  Activity,
  Layers,
  Tag,
  Eye,
  Info
} from 'lucide-react';

export type CameraViewPreset = 'ap' | 'lao_cranial' | 'rao_caudal' | 'posterior' | 'apex';

interface ViewerControlsProps {
  prediction?: PredictionResponse | null;
  selectedVessel: VesselKey | null;
  showLabels: boolean;
  isBeating: boolean;
  myocardiumOpacity: number;
  currentPreset: CameraViewPreset;
  onSelectVessel: (vessel: VesselKey) => void;
  onSelectCameraView: (preset: CameraViewPreset) => void;
  onToggleLabels: () => void;
  onToggleBeating: () => void;
  onChangeOpacity: (opacity: number) => void;
  onResetCamera: () => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  prediction,
  selectedVessel,
  showLabels,
  isBeating,
  myocardiumOpacity,
  currentPreset,
  onSelectVessel,
  onSelectCameraView,
  onToggleLabels,
  onToggleBeating,
  onChangeOpacity,
  onResetCamera
}) => {
  const vessels: VesselKey[] = ['lad', 'lcx', 'rca'];

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top Bar: Vessel Quick Selection */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-[#e6e5e0]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-[rgba(38,37,30,0.1)] shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#26251e]">
          <Eye className="w-3.5 h-3.5 text-[#26251e]/70" />
          <span>Select Artery:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {vessels.map((v) => {
            const isSelected = selectedVessel === v;
            const prob = prediction ? prediction[v].probability : 0.2;
            const colorHex = getRiskColorHex(prob);

            return (
              <button
                key={v}
                onClick={() => onSelectVessel(v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all duration-150 border ${
                  isSelected
                    ? 'bg-[#26251e] text-[#f2f1ed] border-[#26251e] shadow-sm'
                    : 'bg-[#ebeae5] text-[#26251e] hover:text-[#cf2d56] border-[rgba(38,37,30,0.12)]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="font-semibold uppercase">{v}</span>
                {prediction && (
                  <span className="text-[10px] opacity-80">
                    {Math.round(prob * 100)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Bar: Anatomical Camera Presets & Toggles */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#26251e]">
        {/* Catheterization / Angiographic views */}
        <div className="flex items-center gap-1 bg-[#ebeae5]/90 backdrop-blur-sm p-1 rounded-md border border-[rgba(38,37,30,0.1)]">
          <span className="text-[10px] uppercase font-mono px-1.5 text-[rgba(38,37,30,0.6)] font-semibold">
            View:
          </span>
          <button
            onClick={() => onSelectCameraView('ap')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              currentPreset === 'ap'
                ? 'bg-[#26251e] text-[#f2f1ed]'
                : 'text-[#26251e] hover:bg-[#e1e0db]'
            }`}
            title="Anterior-Posterior (Frontal view)"
          >
            AP Front
          </button>
          <button
            onClick={() => onSelectCameraView('lao_cranial')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              currentPreset === 'lao_cranial'
                ? 'bg-[#26251e] text-[#f2f1ed]'
                : 'text-[#26251e] hover:bg-[#e1e0db]'
            }`}
            title="LAO Cranial (Angiographic LAD bifurcation view)"
          >
            LAO Cranial
          </button>
          <button
            onClick={() => onSelectCameraView('rao_caudal')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              currentPreset === 'rao_caudal'
                ? 'bg-[#26251e] text-[#f2f1ed]'
                : 'text-[#26251e] hover:bg-[#e1e0db]'
            }`}
            title="RAO Caudal (Spider view for Left Main / LCX)"
          >
            RAO Caudal
          </button>
          <button
            onClick={() => onSelectCameraView('posterior')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              currentPreset === 'posterior'
                ? 'bg-[#26251e] text-[#f2f1ed]'
                : 'text-[#26251e] hover:bg-[#e1e0db]'
            }`}
            title="Posterior view (LCX and RCA distal course)"
          >
            Posterior
          </button>
        </div>

        {/* View adjustments */}
        <div className="flex items-center gap-1.5 bg-[#ebeae5]/90 backdrop-blur-sm px-2 py-1 rounded-md border border-[rgba(38,37,30,0.1)]">
          {/* Cardiac Cycle Pulsation Toggle */}
          <button
            onClick={onToggleBeating}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isBeating
                ? 'bg-[#1f8a65] text-white'
                : 'text-[rgba(38,37,30,0.6)] hover:bg-[#e1e0db]'
            }`}
            title="Toggle physiological cardiac contraction cycle"
          >
            <Activity className="w-3 h-3" />
            <span>{isBeating ? 'Pulse: ON' : 'Pulse: OFF'}</span>
          </button>

          {/* Labels Toggle */}
          <button
            onClick={onToggleLabels}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              showLabels
                ? 'bg-[#26251e] text-[#f2f1ed]'
                : 'text-[rgba(38,37,30,0.6)] hover:bg-[#e1e0db]'
            }`}
            title="Toggle floating anatomical markers"
          >
            <Tag className="w-3 h-3" />
            <span>Labels</span>
          </button>

          {/* Myocardium Transparency Slider */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-[rgba(38,37,30,0.15)]" title="Myocardium Opacity">
            <Layers className="w-3 h-3 text-[rgba(38,37,30,0.6)]" />
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={myocardiumOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-14 h-1.5 accent-[#26251e] cursor-pointer"
              title={`Myocardium Opacity: ${Math.round(myocardiumOpacity * 100)}%`}
            />
          </div>

          {/* Fit Screen / Reset Camera Button */}
          <button
            onClick={onResetCamera}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-[#26251e] hover:bg-[#e1e0db] hover:text-[#cf2d56] transition-colors"
            title="Fit view to screen & reset camera"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Fit View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
