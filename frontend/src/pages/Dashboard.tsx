import React, { useState } from 'react';
import { usePrediction } from '../hooks/usePrediction';
import { Header } from '../components/Header/Header';
import { MedicalDisclaimer } from '../components/Disclaimer/MedicalDisclaimer';
import { PatientForm } from '../components/PatientForm/PatientForm';
import { HeartCanvas } from '../components/HeartViewer/HeartCanvas';
import { CadRiskCard } from '../components/PredictionCard/CadRiskCard';
import { VesselRiskCard } from '../components/PredictionCard/VesselRiskCard';
import { VesselDetailCard } from '../components/Vessel/VesselDetailCard';
import { ExplanationView } from '../components/ExplanationPanel/ExplanationView';
import { VesselKey } from '../types/prediction';
import {
  Heart,
  Sliders,
  TrendingUp,
  Info,
  Maximize2,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronRight,
  Play,
  Sparkles,
  User,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    patientData,
    prediction,
    explanation,
    selectedVessel,
    predictionStatus,
    explanationStatus,
    errorMessage,
    apiSettings,
    activePresetId,
    updatePatientField,
    updateApiSettings,
    runPrediction,
    loadPreset,
    selectVessel
  } = usePrediction();

  // Collapsible clinical input sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Optional collapsible right panel (for maximizing 3D view if desired)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState<boolean>(false);

  // Mobile navigation tabs for phones/small screens
  const [mobileTab, setMobileTab] = useState<'input' | 'heart' | 'results'>('heart');

  // Selected explanation target (CAD or specific vessel)
  const [explanationTarget, setExplanationTarget] = useState<'CAD' | VesselKey>('CAD');

  const handleSelectExplanationTarget = (target: 'CAD' | VesselKey) => {
    setExplanationTarget(target);
    if (target !== 'CAD') {
      selectVessel(target);
    }
  };

  const activePresetSummary =
    activePresetId === 'preset-high-cad'
      ? { label: '67M High CAD', risk: 'high', color: 'bg-[#cf2d56]' }
      : activePresetId === 'preset-moderate-lad'
      ? { label: '58F Mod LAD', risk: 'moderate', color: 'bg-[#c08532]' }
      : activePresetId === 'preset-low-baseline'
      ? { label: '38M Low Risk', risk: 'low', color: 'bg-[#1f8a65]' }
      : { label: 'Custom Patient', risk: 'custom', color: 'bg-[#26251e]' };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-[#f2f1ed] text-[#26251e] flex flex-col font-sans select-none selection:bg-[#26251e] selection:text-[#f2f1ed]">
      {/* 1. Header (Shrink-0 to fit screen) */}
      <Header
        apiSettings={apiSettings}
        onUpdateSettings={updateApiSettings}
      />

      {/* 2. Persistent Clinical Disclaimer (Compact strip) */}
      <MedicalDisclaimer />

      {/* Mobile Tab Switcher (Visible only below lg) */}
      <div className="lg:hidden shrink-0 px-3 py-1.5 border-b border-[rgba(38,37,30,0.1)] bg-[#ebeae5]/60 flex items-center justify-around gap-1">
        <button
          onClick={() => setMobileTab('input')}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md text-center transition-colors ${
            mobileTab === 'input'
              ? 'bg-[#26251e] text-[#f2f1ed]'
              : 'text-[rgba(38,37,30,0.7)] hover:text-[#26251e]'
          }`}
        >
          1. Patient Inputs (54)
        </button>
        <button
          onClick={() => setMobileTab('heart')}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg text-center transition-colors ${
            mobileTab === 'heart'
              ? 'bg-[#26251e] text-[#f2f1ed]'
              : 'text-[rgba(38,37,30,0.7)] hover:text-[#26251e]'
          }`}
        >
          2. 3D Heart Visualizer
        </button>
        <button
          onClick={() => setMobileTab('results')}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg text-center transition-colors ${
            mobileTab === 'results'
              ? 'bg-[#26251e] text-[#f2f1ed]'
              : 'text-[rgba(38,37,30,0.7)] hover:text-[#26251e]'
          }`}
        >
          3. Predictions &amp; SHAP
        </button>
      </div>

      {/* 3. Main Workspace: Screen-Fitting Height without outer scrolling */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-2 sm:p-3 gap-2.5 sm:gap-3">
        {/* LEFT COLUMN: Collapsible Patient Clinical Sidebar */}
        <aside
          className={`h-full min-h-0 flex flex-col transition-all duration-300 ease-in-out ${
            mobileTab === 'input'
              ? 'w-full block lg:flex'
              : 'hidden lg:flex'
          } ${
            isSidebarCollapsed
              ? 'w-14 shrink-0'
              : 'w-[360px] md:w-[390px] xl:w-[420px] 2xl:w-[450px] shrink-0'
          }`}
        >
          {isSidebarCollapsed ? (
            /* COLLAPSED RAIL VIEW */
            <div
              onClick={() => setIsSidebarCollapsed(false)}
              className="h-full w-full bg-[#e6e5e0] rounded-xl border border-[rgba(38,37,30,0.12)] p-2 shadow-sm flex flex-col items-center justify-between cursor-pointer hover:border-[rgba(38,37,30,0.25)] hover:bg-[#ebeae5] transition-all"
              title="Click to expand Patient Clinical Assessment panel"
            >
              {/* Top: Expand Toggle Button */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidebarCollapsed(false);
                  }}
                  className="p-2 rounded-lg bg-[#26251e] text-[#f2f1ed] hover:bg-[#cf2d56] transition-colors shadow-xs"
                  title="Expand Clinical Input Panel"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-mono font-bold text-[rgba(38,37,30,0.6)] uppercase tracking-wider">
                  Inputs
                </span>
              </div>

              {/* Center: Vertical Indicator */}
              <div className="flex flex-col items-center gap-3 my-auto">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activePresetSummary.color }}
                  title={`Preset: ${activePresetSummary.label}`}
                />
                <div className="py-2 px-1 rounded bg-[#ebeae5] border border-[rgba(38,37,30,0.1)] flex flex-col items-center text-[10px] font-mono text-[rgba(38,37,30,0.7)]">
                  <span>54</span>
                  <span className="text-[8px] uppercase">feat</span>
                </div>
                <div className="[writing-mode:vertical-rl] text-[11px] font-mono font-semibold tracking-wider text-[rgba(38,37,30,0.6)] rotate-180 select-none">
                  CLINICAL DATA
                </div>
              </div>

              {/* Bottom: Fast Run Button */}
              <div className="flex flex-col items-center gap-2 pb-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    runPrediction();
                  }}
                  disabled={predictionStatus === 'loading'}
                  className="p-2 rounded-lg bg-[#26251e] text-[#f2f1ed] hover:bg-[#cf2d56] transition-colors shadow-xs"
                  title="Run Prediction"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ) : (
            /* FULL EXPANDED CLINICAL FORM */
            <PatientForm
              patientData={patientData}
              activePresetId={activePresetId}
              predictionStatus={predictionStatus}
              errorMessage={errorMessage}
              onUpdateField={updatePatientField}
              onSelectPreset={loadPreset}
              onToggleCollapse={() => setIsSidebarCollapsed(true)}
              onSubmit={() => {
                runPrediction();
                if (window.innerWidth < 1024) {
                  setMobileTab('heart');
                }
              }}
            />
          )}
        </aside>

        {/* CENTER COLUMN: Interactive 3D Heart (Fills all remaining screen space) */}
        <main
          className={`flex-1 min-h-0 h-full flex flex-col rounded-xl overflow-hidden ${
            mobileTab === 'heart' ? 'block' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 min-h-0 h-full w-full relative">
            <HeartCanvas
              prediction={prediction}
              selectedVessel={selectedVessel}
              onSelectVessel={(vessel) => {
                selectVessel(vessel);
              }}
              className="h-full w-full"
            />
          </div>
        </main>

        {/* RIGHT COLUMN: Prediction & Explanation Panel (Independently scrollable) */}
        <section
          className={`h-full min-h-0 flex flex-col transition-all duration-300 ease-in-out ${
            mobileTab === 'results' ? 'w-full block lg:flex' : 'hidden lg:flex'
          } ${
            isRightPanelCollapsed
              ? 'w-12 shrink-0'
              : 'w-[310px] xl:w-[350px] 2xl:w-[380px] shrink-0'
          }`}
        >
          {isRightPanelCollapsed ? (
            /* Collapsed rail for right panel */
            <div
              onClick={() => setIsRightPanelCollapsed(false)}
              className="h-full w-full bg-[#e6e5e0] rounded-xl border border-[rgba(38,37,30,0.12)] p-2 shadow-sm flex flex-col items-center justify-between cursor-pointer hover:border-[rgba(38,37,30,0.25)] hover:bg-[#ebeae5]"
              title="Click to expand Prediction & SHAP results"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRightPanelCollapsed(false);
                }}
                className="p-2 rounded-lg bg-[#26251e] text-[#f2f1ed] hover:bg-[#cf2d56] transition-colors shadow-xs"
                title="Expand Results"
              >
                <PanelRightOpen className="w-4 h-4" />
              </button>
              <div className="[writing-mode:vertical-rl] text-[11px] font-mono font-semibold tracking-wider text-[rgba(38,37,30,0.6)] rotate-180 select-none">
                RISK &amp; SHAP RESULTS
              </div>
              <div className="w-2 h-2 rounded-full bg-[#1f8a65]" />
            </div>
          ) : (
            /* Full Results Column */
            <div className="h-full min-h-0 flex flex-col overflow-y-auto pr-1 space-y-2.5">
              {/* Mini Toolbar on top of right panel */}
              <div className="flex items-center justify-between px-1 shrink-0">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[rgba(38,37,30,0.7)]">
                  Diagnostic Results
                </span>
                <button
                  type="button"
                  onClick={() => setIsRightPanelCollapsed(true)}
                  title="Collapse results to expand 3D view"
                  className="hidden xl:flex items-center gap-1 text-[10px] font-mono text-[rgba(38,37,30,0.55)] hover:text-[#26251e]"
                >
                  <PanelRightClose className="w-3 h-3" />
                  <span>Collapse</span>
                </button>
              </div>

              {/* 1. Overall CAD Risk Card */}
              <CadRiskCard
                prediction={prediction?.cad}
                isLoading={predictionStatus === 'loading'}
              />

              {/* 2. Target Vessel Breakdown Cards (LAD, LCX, RCA) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase text-[rgba(38,37,30,0.65)] px-1">
                  <span>Coronary Vessels</span>
                  <span>Click for 3D Focus</span>
                </div>

                <VesselRiskCard
                  vesselKey="lad"
                  prediction={prediction?.lad}
                  isSelected={selectedVessel === 'lad'}
                  onSelect={() => selectVessel('lad')}
                />

                <VesselRiskCard
                  vesselKey="lcx"
                  prediction={prediction?.lcx}
                  isSelected={selectedVessel === 'lcx'}
                  onSelect={() => selectVessel('lcx')}
                />

                <VesselRiskCard
                  vesselKey="rca"
                  prediction={prediction?.rca}
                  isSelected={selectedVessel === 'rca'}
                  onSelect={() => selectVessel('rca')}
                />
              </div>

              {/* 3. Selected Vessel Detailed Clinical Card */}
              {selectedVessel && (
                <VesselDetailCard
                  vesselKey={selectedVessel}
                  prediction={prediction ? prediction[selectedVessel] : undefined}
                />
              )}

              {/* 4. Model Explainability / SHAP Chart */}
              <ExplanationView
                explanation={explanation}
                status={explanationStatus}
                selectedTarget={explanationTarget}
                onSelectTarget={handleSelectExplanationTarget}
              />
            </div>
          )}
        </section>
      </div>

      {/* 4. Slim Workstation Status Footer (Shrink-0) */}
      <footer className="shrink-0 bg-[#ebeae5] border-t border-[rgba(38,37,30,0.1)] px-4 py-1 text-[10px] text-[rgba(38,37,30,0.65)] font-mono flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1f8a65]" />
          <span>Vessel Pipeline: LAD (Anterior), LCX (Lateral), RCA (Inferior)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Screen-Fit Clinical Workstation</span>
          <span>•</span>
          <span>FastAPI REST (`POST /predict`)</span>
        </div>
      </footer>
    </div>
  );
};
