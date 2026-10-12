import { useState, useCallback, useEffect } from 'react';
import { PatientData } from '../types/patient';
import {
  PredictionResponse,
  ExplanationResponse,
  VesselKey
} from '../types/prediction';
import {
  predictRisk,
  explainRisk,
  getStoredApiSettings,
  saveApiSettings,
  ApiSettings
} from '../api/predictionApi';
import { PATIENT_PRESETS, DEFAULT_PATIENT_DATA } from '../data/mockData';

export type PredictionStatus = 'initial' | 'loading' | 'success' | 'error';
export type ExplanationStatus = 'initial' | 'loading' | 'success' | 'unavailable' | 'error';

export function usePrediction() {
  const [patientData, setPatientData] = useState<PatientData>(DEFAULT_PATIENT_DATA);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<VesselKey | null>('lad');

  const [predictionStatus, setPredictionStatus] = useState<PredictionStatus>('initial');
  const [explanationStatus, setExplanationStatus] = useState<ExplanationStatus>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [apiSettings, setApiSettingsState] = useState<ApiSettings>(getStoredApiSettings());
  const [activePresetId, setActivePresetId] = useState<string>('preset-high-cad');

  // Sync BMI when Weight or Length changes
  const updatePatientField = useCallback((key: keyof PatientData, value: any) => {
    setPatientData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'Weight' || key === 'Length') {
        const wt = key === 'Weight' ? Number(value) : Number(prev.Weight);
        const htCm = key === 'Length' ? Number(value) : Number(prev.Length);
        if (htCm > 0 && wt > 0) {
          const htM = htCm / 100;
          next.BMI = parseFloat((wt / (htM * htM)).toFixed(1));
          next.Obesity = next.BMI >= 30 ? 'Y' : 'N';
        }
      }
      return next;
    });
    // Mark that custom edits have been made
    setActivePresetId('custom');
  }, []);

  const updateApiSettings = useCallback((newSettings: Partial<ApiSettings>) => {
    setApiSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      saveApiSettings(updated);
      return updated;
    });
  }, []);

  const runPrediction = useCallback(async (customData?: PatientData) => {
    const dataToUse = customData || patientData;
    setPredictionStatus('loading');
    setErrorMessage(null);
    setExplanationStatus('loading');

    try {
      const predResult = await predictRisk(dataToUse, apiSettings);
      setPrediction(predResult);
      setPredictionStatus('success');

      // Request SHAP explainability
      try {
        const explainResult = await explainRisk(dataToUse, 'CAD', apiSettings);
        setExplanation(explainResult);
        setExplanationStatus('success');
      } catch (explainErr: any) {
        // If explain endpoint fails or is unavailable on backend
        setExplanationStatus('unavailable');
      }
    } catch (err: any) {
      setPredictionStatus('error');
      setExplanationStatus('error');
      setErrorMessage(err.message || 'Failed to complete cardiovascular risk prediction.');
    }
  }, [patientData, apiSettings]);

  // Load preset patient. In mock mode we can show the bundled fixture
  // immediately; in live mode the visible result must come from FastAPI.
  const loadPreset = useCallback((presetId: string) => {
    const found = PATIENT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setPatientData({ ...found.data });
      setActivePresetId(found.id);
      setErrorMessage(null);

      if (apiSettings.useMock) {
        setPrediction(found.mockPrediction);
        setExplanation(found.mockExplanationCAD);
        setPredictionStatus('success');
        setExplanationStatus('success');
      } else {
        setPrediction(null);
        setExplanation(null);
        setPredictionStatus('loading');
        setExplanationStatus('loading');

        predictRisk(found.data, apiSettings)
          .then((predResult) => {
            setPrediction(predResult);
            setPredictionStatus('success');

            return explainRisk(found.data, 'CAD', apiSettings)
              .then((explainResult) => {
                setExplanation(explainResult);
                setExplanationStatus('success');
              })
              .catch(() => {
                setExplanationStatus('unavailable');
              });
          })
          .catch((err: any) => {
            setPredictionStatus('error');
            setExplanationStatus('error');
            setErrorMessage(err.message || 'Failed to complete cardiovascular risk prediction.');
          });
      }
    }
  }, [apiSettings]);

  // Update explanation when selected vessel changes (if user wants vessel-specific SHAP)
  const loadVesselExplanation = useCallback(async (vessel: VesselKey) => {
    setSelectedVessel(vessel);
    if (!prediction) return;

    try {
      const targetName = vessel.toUpperCase() as 'LAD' | 'LCX' | 'RCA';
      const result = await explainRisk(patientData, targetName, apiSettings);
      setExplanation(result);
      setExplanationStatus('success');
    } catch {
      // Keep CAD explanation if vessel-level SHAP is not implemented on backend
    }
  }, [patientData, prediction, apiSettings]);

  // Run initial prediction on mount for the default high-risk preset
  useEffect(() => {
    loadPreset('preset-high-cad');
  }, []);

  return {
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
    selectVessel: loadVesselExplanation,
    setSelectedVesselDirect: setSelectedVessel,
    setPatientData
  };
}
