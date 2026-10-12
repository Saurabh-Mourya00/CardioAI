import React, { useState } from 'react';
import { ApiSettings, testBackendConnection } from '../../api/predictionApi';
import { X, Server, Check, AlertCircle, RefreshCw, Code } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  settings: ApiSettings;
  onClose: () => void;
  onSave: (newSettings: Partial<ApiSettings>) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave
}) => {
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [useMock, setUseMock] = useState(settings.useMock);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'contracts'>('settings');

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testBackendConnection(baseUrl);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    onSave({ baseUrl, useMock });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#f2f1ed] text-[#26251e] rounded-xl border border-[rgba(38,37,30,0.15)] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#ebeae5] border-b border-[rgba(38,37,30,0.1)]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#26251e]" />
            <h3 className="font-mono text-sm font-bold tracking-tight">
              FastAPI Backend & API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[rgba(38,37,30,0.6)] hover:text-[#cf2d56] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(38,37,30,0.1)] px-5 bg-[#ebeae5]/50">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 text-xs font-mono font-medium border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-[#26251e] text-[#26251e]'
                : 'border-transparent text-[rgba(38,37,30,0.6)] hover:text-[#26251e]'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2 px-3 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'contracts'
                ? 'border-[#26251e] text-[#26251e]'
                : 'border-transparent text-[rgba(38,37,30,0.6)] hover:text-[#26251e]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>FastAPI Contract</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'settings' ? (
            <>
              {/* Mode Toggle */}
              <div className="bg-[#e6e5e0] p-3 rounded-lg border border-[rgba(38,37,30,0.1)]">
                <label className="text-xs font-bold font-mono uppercase tracking-wide block mb-2">
                  Data Provider Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUseMock(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border text-left transition-all ${
                      useMock
                        ? 'bg-[#26251e] text-[#f2f1ed] border-[#26251e] shadow-xs'
                        : 'bg-[#f7f7f4] text-[rgba(38,37,30,0.7)] border-[rgba(38,37,30,0.1)] hover:bg-[#ebeae5]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1f8a65]" />
                      Mock Mode (Active)
                    </div>
                    <div className="text-[10px] text-[rgba(38,37,30,0.6)] mt-0.5 opacity-90">
                      Local simulation with presets
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseMock(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border text-left transition-all ${
                      !useMock
                        ? 'bg-[#26251e] text-[#f2f1ed] border-[#26251e] shadow-xs'
                        : 'bg-[#f7f7f4] text-[rgba(38,37,30,0.7)] border-[rgba(38,37,30,0.1)] hover:bg-[#ebeae5]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#f54e00]" />
                      Live FastAPI
                    </div>
                    <div className="text-[10px] text-[rgba(38,37,30,0.6)] mt-0.5 opacity-90">
                      Real HTTP POST /predict
                    </div>
                  </button>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-mono text-[#26251e] block">
                  Backend Base URL (VITE_API_BASE_URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="flex-1 px-3 py-1.5 bg-[#f7f7f4] border border-[rgba(38,37,30,0.15)] rounded-lg text-xs font-mono text-[#26251e] focus:outline-none focus:border-[#26251e]"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testing}
                    className="px-3 py-1.5 bg-[#ebeae5] border border-[rgba(38,37,30,0.15)] rounded-lg text-xs font-mono font-medium hover:bg-[#e1e0db] hover:text-[#cf2d56] transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    <span>Ping</span>
                  </button>
                </div>
                <p className="text-[10px] text-[rgba(38,37,30,0.55)]">
                  Calls <code className="bg-[#ebeae5] px-1 rounded font-mono">POST {baseUrl}/predict</code> and{' '}
                  <code className="bg-[#ebeae5] px-1 rounded font-mono">POST {baseUrl}/explain</code>.
                </p>
              </div>

              {/* Test Result Indicator */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-mono border flex items-center justify-between ${
                    testResult.ok
                      ? 'bg-emerald-50 text-[#1f8a65] border-emerald-200'
                      : 'bg-rose-50 text-[#cf2d56] border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {testResult.ok ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  <span className="text-[10px] opacity-80">
                    {testResult.latencyMs}ms
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-mono font-bold text-[#26251e] block mb-1">
                  Endpoint 1: POST /predict
                </span>
                <pre className="bg-[#26251e] text-[#f2f1ed] p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
{`// Expected Response Payload
{
  "success": true,
  "predictions": {
    "CAD": {
      "prediction": 1,
      "label": "CAD",
      "positive_class_probability": 0.9359
    },
    "LAD": {
      "prediction": 1,
      "label": "Stenotic",
      "positive_class_probability": 0.7397
    },
    "LCX": {
      "prediction": 0,
      "label": "Normal",
      "positive_class_probability": 0.2096
    },
    "RCA": {
      "prediction": 0,
      "label": "Normal",
      "positive_class_probability": 0.2096
    }
  },
  "disclaimer": "Educational decision-support prototype only..."
}`}
                </pre>
              </div>

              <div>
                <span className="font-mono font-bold text-[#26251e] block mb-1">
                  Endpoint 2: POST /explain
                </span>
                <pre className="bg-[#26251e] text-[#f2f1ed] p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
{`// Expected Request Payload
{
  "target": "CAD",
  "...54 clinical features": "..."
}

// Expected Response Payload
{
  "target": "CAD",
  "base_value": 0.001,
  "method": "single-feature reference attribution",
  "features": [
    { "feature": "Age", "value": 67, "shap_value": 0.12 },
    { "feature": "Typical Chest Pain", "value": 1, "shap_value": 0.08 }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-[#ebeae5] border-t border-[rgba(38,37,30,0.1)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium hover:bg-[#e1e0db] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#26251e] text-[#f2f1ed] hover:bg-[#cf2d56] transition-colors shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
