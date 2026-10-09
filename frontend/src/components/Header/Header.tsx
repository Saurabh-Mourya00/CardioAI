import React, { useState } from 'react';
import { ApiSettings } from '../../api/predictionApi';
import { ApiSettingsModal } from './ApiSettingsModal';
import {
  Heart,
  Settings,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  apiSettings: ApiSettings;
  onUpdateSettings: (newSettings: Partial<ApiSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiSettings,
  onUpdateSettings
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="shrink-0 z-30 bg-[#f2f1ed]/95 backdrop-blur-md border-b border-[rgba(38,37,30,0.1)] px-3 sm:px-5 py-2 transition-colors">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#26251e] text-[#f2f1ed] flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-[#f54e00] fill-[#f54e00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-base font-extrabold tracking-tight text-[#26251e]">
                  CardioPulse 3D
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-[#ebeae5] border border-[rgba(38,37,30,0.12)] text-[rgba(38,37,30,0.7)]">
                  Clinical CDS v1.0
                </span>
              </div>
              <p className="text-[11px] text-[rgba(38,37,30,0.65)] hidden md:block">
                Cardiovascular Risk Visualization &amp; Multi-Vessel Stenosis Prediction
              </p>
            </div>
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Indicator Pill */}
            <button
              onClick={() => setModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer ${
                apiSettings.useMock
                  ? 'bg-[#ebeae5] border-[rgba(38,37,30,0.15)] text-[#26251e] hover:border-[rgba(38,37,30,0.3)]'
                  : 'bg-orange-50 border-orange-200 text-[#f54e00] hover:bg-orange-100'
              }`}
              title="Click to configure FastAPI connection"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiSettings.useMock ? 'bg-[#1f8a65]' : 'bg-[#f54e00] animate-pulse'
                }`}
              />
              <span className="font-semibold">
                {apiSettings.useMock ? 'Mock Mode' : 'Live FastAPI'}
              </span>
              <span className="text-[10px] text-[rgba(38,37,30,0.5)] hidden sm:inline">
                ({apiSettings.useMock ? 'Local Data' : apiSettings.baseUrl})
              </span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setModalOpen(true)}
              className="p-2 rounded-lg bg-[#ebeae5] border border-[rgba(38,37,30,0.12)] text-[#26251e] hover:text-[#cf2d56] hover:bg-[#e1e0db] transition-colors cursor-pointer"
              title="API & Backend Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <ApiSettingsModal
        isOpen={modalOpen}
        settings={apiSettings}
        onClose={() => setModalOpen(false)}
        onSave={onUpdateSettings}
      />
    </>
  );
};
