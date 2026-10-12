import { PatientData } from '../types/patient';
import { PredictionResponse, ExplanationResponse } from '../types/prediction';
import { PATIENT_PRESETS } from '../data/mockData';

// Base API configuration from Vite environment variables
export const DEFAULT_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

// Configurable runtime settings
export interface ApiSettings {
  baseUrl: string;
  useMock: boolean;
  timeoutMs: number;
}

// Local storage key for runtime settings persistence
const SETTINGS_STORAGE_KEY = 'cardiopulse_api_settings';

export function getStoredApiSettings(): ApiSettings {
  const envMock = import.meta.env.VITE_USE_MOCK_API;
  const defaultMock = envMock !== undefined ? envMock === 'true' : true;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        baseUrl: parsed.baseUrl || DEFAULT_API_BASE_URL,
        useMock: typeof parsed.useMock === 'boolean' ? parsed.useMock : defaultMock,
        timeoutMs: parsed.timeoutMs || 8000
      };
    }
  } catch (e) {
    // ignore
  }

  return {
    baseUrl: DEFAULT_API_BASE_URL,
    useMock: defaultMock,
    timeoutMs: 8000
  };
}

export function saveApiSettings(settings: ApiSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
}

// --------------------------------------------------
// Backend response shape from POST /predict
// --------------------------------------------------

interface BackendSinglePrediction {
  prediction: number;
  label: string;
  probability: number;
  positive_class_probability: number;
}

interface BackendPredictResponse {
  success: boolean;
  predictions: {
    LAD: BackendSinglePrediction;
    LCX: BackendSinglePrediction;
    RCA: BackendSinglePrediction;
    CAD: BackendSinglePrediction;
  };
  disclaimer: string;
}

interface BackendExplanationResponse extends ExplanationResponse {
  method?: string;
}

/**
 * Transforms the FastAPI backend response (uppercase keys, wrapped in
 * { success, predictions }) into the flat PredictionResponse format
 * that the frontend components (HeartCanvas, VesselRiskCard, etc.) expect.
 */
function adaptBackendResponse(raw: BackendPredictResponse): PredictionResponse {
  return {
    cad: {
      label: raw.predictions.CAD.label as 'CAD' | 'Normal',
      probability: raw.predictions.CAD.positive_class_probability
    },
    lad: {
      label: raw.predictions.LAD.label as 'Stenotic' | 'Normal',
      probability: raw.predictions.LAD.positive_class_probability
    },
    lcx: {
      label: raw.predictions.LCX.label as 'Stenotic' | 'Normal',
      probability: raw.predictions.LCX.positive_class_probability
    },
    rca: {
      label: raw.predictions.RCA.label as 'Stenotic' | 'Normal',
      probability: raw.predictions.RCA.positive_class_probability
    }
  };
}

/**
 * Converts typed frontend PatientData into the flat key-value object the
 * FastAPI backend's sklearn pipelines expect.  The backend's fitted
 * ColumnTransformer handles categorical encoding internally, so we pass
 * the raw feature values as-is with the original training column names.
 */
function transformPayloadForBackend(p: PatientData): Record<string, number | string> {
  const payload: Record<string, any> = {};
  for (const key of Object.keys(p) as Array<keyof PatientData>) {
    payload[key] = p[key];
  }
  return payload;
}

/**
 * Predict cardiovascular risk across CAD, LAD, LCX, and RCA
 * Calls POST {baseUrl}/predict with the 54-feature patient payload.
 */
export async function predictRisk(
  patientData: PatientData,
  settings: ApiSettings = getStoredApiSettings()
): Promise<PredictionResponse> {
  if (settings.useMock) {
    // Simulate realistic network delay (350ms - 700ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateMockPrediction(patientData);
  }

  const endpoint = `${settings.baseUrl.replace(/\/+$/, '')}/predict`;
  const backendPayload = transformPayloadForBackend(patientData);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), settings.timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(backendPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMsg = Array.isArray(errorJson.detail)
            ? errorJson.detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ')
            : String(errorJson.detail);
        }
      } catch {
        if (errorText) errorMsg += ` - ${errorText.slice(0, 150)}`;
      }
      throw new Error(`FastAPI Prediction Error: ${errorMsg}`);
    }

    const rawData = await response.json();

    // Adapt the backend's wrapped response to the frontend's flat format.
    // The backend returns { success, predictions: { LAD, LCX, RCA, CAD }, disclaimer }
    // but the frontend expects { cad, lad, lcx, rca }.
    let adapted: PredictionResponse;
    if (rawData.success !== undefined && rawData.predictions) {
      adapted = adaptBackendResponse(rawData as BackendPredictResponse);
    } else {
      // Already in frontend format (e.g., future backend version or test server)
      adapted = rawData as PredictionResponse;
    }

    validatePredictionResponse(adapted);
    return adapted;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${settings.timeoutMs}ms while contacting ${endpoint}`);
    }
    throw err;
  }
}

/**
 * Request SHAP explainability for CAD or a specific coronary vessel
 * Calls POST {baseUrl}/explain with target ('CAD', 'LAD', 'LCX', 'RCA') and patient data.
 */
export async function explainRisk(
  patientData: PatientData,
  target: 'CAD' | 'LAD' | 'LCX' | 'RCA' = 'CAD',
  settings: ApiSettings = getStoredApiSettings()
): Promise<ExplanationResponse> {
  if (settings.useMock) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return generateMockExplanation(patientData, target);
  }

  const endpoint = `${settings.baseUrl.replace(/\/+$/, '')}/explain`;
  const backendPayload = {
    ...transformPayloadForBackend(patientData),
    target
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), settings.timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(backendPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        if (errorText) errorMsg += ` - ${errorText.slice(0, 150)}`;
      }
      throw new Error(`FastAPI Explanation Error: ${errorMsg}`);
    }

    const data = await response.json() as BackendExplanationResponse;
    validateExplanationResponse(data);
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${settings.timeoutMs}ms while contacting ${endpoint}`);
    }
    throw err;
  }
}

/**
 * Test connectivity to FastAPI backend health/root endpoint
 */
export async function testBackendConnection(
  baseUrl: string,
  timeoutMs: number = 3000
): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    // Try pinging either /health or / or /docs
    const res = await fetch(`${cleanUrl}/docs`, {
      method: 'HEAD',
      signal: controller.signal
    }).catch(() =>
      fetch(`${cleanUrl}/`, {
        method: 'GET',
        signal: controller.signal
      })
    );

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (res && res.status < 500) {
      return { ok: true, message: `Connected (HTTP ${res.status})`, latencyMs };
    }
    return { ok: false, message: `Backend responded with HTTP ${res?.status || 'Unknown'}`, latencyMs };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      message: err.name === 'AbortError' ? 'Connection timed out' : err.message || 'Cannot reach server',
      latencyMs
    };
  }
}

/**
 * Validates that API response matches required structure:
 * {
 *   cad: { label: string, probability: number },
 *   lad: { label: string, probability: number },
 *   lcx: { label: string, probability: number },
 *   rca: { label: string, probability: number }
 * }
 */
function validatePredictionResponse(data: any): asserts data is PredictionResponse {
  const targets = ['cad', 'lad', 'lcx', 'rca'];
  for (const t of targets) {
    if (!data || typeof data[t] !== 'object') {
      throw new Error(`Invalid response format: missing key '${t}' in model response.`);
    }
    if (typeof data[t].probability !== 'number') {
      throw new Error(`Invalid response format: '${t}.probability' must be a numeric value.`);
    }
    if (data[t].probability < 0 || data[t].probability > 1) {
      throw new Error(`Invalid response format: '${t}.probability' must be between 0.0 and 1.0.`);
    }
  }
}

function validateExplanationResponse(data: any): asserts data is ExplanationResponse {
  if (!data || !['CAD', 'LAD', 'LCX', 'RCA'].includes(data.target)) {
    throw new Error('Invalid explanation response format: target is missing or invalid.');
  }

  if (!Array.isArray(data.features)) {
    throw new Error('Invalid explanation response format: features must be an array.');
  }

  for (const item of data.features) {
    if (typeof item.feature !== 'string') {
      throw new Error('Invalid explanation response format: feature name must be a string.');
    }
    if (typeof item.shap_value !== 'number') {
      throw new Error('Invalid explanation response format: shap_value must be numeric.');
    }
  }
}

/**
 * Deterministic, clinically plausible mock prediction based on patient clinical features
 * for frontend development mode.
 */
function generateMockPrediction(p: PatientData): PredictionResponse {
  // Check if matches an existing preset
  const matched = PATIENT_PRESETS.find(
    (preset) =>
      preset.data.Age === p.Age &&
      preset.data.Sex === p.Sex &&
      preset.data['Typical Chest Pain'] === p['Typical Chest Pain']
  );
  if (matched) {
    return matched.mockPrediction;
  }

  // Clinical risk scoring formula approximation
  let riskScore = 0;
  if (p.Age >= 60) riskScore += 0.18;
  else if (p.Age >= 50) riskScore += 0.10;

  if (p.Sex === 'Male') riskScore += 0.10;
  if (p['Typical Chest Pain'] === 1) riskScore += 0.28;
  if (p.HTN === 1) riskScore += 0.10;
  if (p.DM === 1) riskScore += 0.12;
  if (p['Current Smoker'] === 1) riskScore += 0.12;
  if (p.DLP === 'Y' || p.LDL >= 140) riskScore += 0.10;
  if (p['St Depression'] === 1) riskScore += 0.18;
  if (p.Tinversion === 1) riskScore += 0.12;
  if (p['EF-TTE'] < 50) riskScore += 0.14;
  if (p['Region RWMA'] >= 1) riskScore += 0.16;

  // Baseline probability
  const cadProb = Math.min(0.96, Math.max(0.05, Math.round((0.15 + riskScore * 0.75) * 100) / 100));

  // LAD risk correlates with anterior ST depression, RWMA, Low EF, and typical pain
  let ladFactor = (p['St Depression'] ? 0.3 : 0) + (p['Region RWMA'] ? 0.25 : 0) + (p['Typical Chest Pain'] ? 0.2 : 0);
  const ladProb = Math.min(0.95, Math.max(0.04, Math.round((cadProb * 0.7 + ladFactor * 0.35) * 100) / 100));

  // LCX risk
  let lcxFactor = (p.DLP === 'Y' ? 0.15 : 0) + (p.HTN ? 0.1 : 0);
  const lcxProb = Math.min(0.85, Math.max(0.04, Math.round((cadProb * 0.45 + lcxFactor * 0.25) * 100) / 100));

  // RCA risk correlates with inferior changes (Tinversion, PR, DM)
  let rcaFactor = (p.Tinversion ? 0.25 : 0) + (p.DM ? 0.15 : 0) + (p['Current Smoker'] ? 0.15 : 0);
  const rcaProb = Math.min(0.92, Math.max(0.05, Math.round((cadProb * 0.6 + rcaFactor * 0.3) * 100) / 100));

  return {
    cad: {
      label: cadProb >= 0.5 ? 'CAD' : 'Normal',
      probability: cadProb
    },
    lad: {
      label: ladProb >= 0.5 ? 'Stenotic' : 'Normal',
      probability: ladProb
    },
    lcx: {
      label: lcxProb >= 0.5 ? 'Stenotic' : 'Normal',
      probability: lcxProb
    },
    rca: {
      label: rcaProb >= 0.5 ? 'Stenotic' : 'Normal',
      probability: rcaProb
    }
  };
}

function generateMockExplanation(
  p: PatientData,
  target: 'CAD' | 'LAD' | 'LCX' | 'RCA'
): ExplanationResponse {
  // Check if matches preset
  const matched = PATIENT_PRESETS.find(
    (preset) => preset.data.Age === p.Age && preset.data.Sex === p.Sex
  );
  if (matched) {
    if (target === 'CAD') return matched.mockExplanationCAD;
    return matched.mockExplanationVessels[target.toLowerCase() as 'lad' | 'lcx' | 'rca'];
  }

  // Dynamic plausible SHAP features
  const features = [];
  if (p['Typical Chest Pain'] === 1) {
    features.push({ feature: 'Typical Chest Pain', value: 'Yes (1)', shap_value: 0.26 });
  }
  if (p.Age >= 60) {
    features.push({ feature: 'Age (Elevated)', value: p.Age, shap_value: 0.20 });
  } else if (p.Age < 45) {
    features.push({ feature: 'Age (Younger)', value: p.Age, shap_value: -0.18 });
  }
  if (p['St Depression'] === 1) {
    features.push({ feature: 'ST Depression', value: 'Present (1)', shap_value: 0.19 });
  }
  if (p['Region RWMA'] > 0) {
    features.push({ feature: 'Region RWMA Score', value: p['Region RWMA'], shap_value: 0.16 });
  }
  if (p.LDL >= 140) {
    features.push({ feature: 'LDL Cholesterol', value: `${p.LDL} mg/dL`, shap_value: 0.12 });
  }
  if (p['EF-TTE'] < 50) {
    features.push({ feature: 'EF-TTE (Reduced)', value: `${p['EF-TTE']}%`, shap_value: 0.11 });
  } else if (p['EF-TTE'] >= 60) {
    features.push({ feature: 'Preserved Ejection Fraction', value: `${p['EF-TTE']}%`, shap_value: -0.14 });
  }
  if (p['Current Smoker'] === 1) {
    features.push({ feature: 'Current Tobacco Smoker', value: 'Yes', shap_value: 0.09 });
  } else {
    features.push({ feature: 'Non-Smoker', value: 'No', shap_value: -0.07 });
  }
  if (p.Sex === 'Female' && p.Age < 55) {
    features.push({ feature: 'Female Pre-Menopause', value: 'Female', shap_value: -0.11 });
  }

  // Sort by absolute SHAP magnitude descending
  features.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  return {
    target,
    base_value: 0.35,
    features: features.slice(0, 8)
  };
}
