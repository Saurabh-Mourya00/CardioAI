import { PatientData } from '../types/patient';
import { PredictionResponse, ExplanationResponse } from '../types/prediction';

export interface PatientPreset {
  id: string;
  name: string;
  summary: string;
  riskBadge: 'high' | 'moderate' | 'low';
  data: PatientData;
  mockPrediction: PredictionResponse;
  mockExplanationCAD: ExplanationResponse;
  mockExplanationVessels: {
    lad: ExplanationResponse;
    lcx: ExplanationResponse;
    rca: ExplanationResponse;
  };
}

export const PATIENT_PRESETS: PatientPreset[] = [
  {
    id: 'preset-high-cad',
    name: 'Patient 104: 67yo Male (Multi-Vessel CAD)',
    summary: 'Typical exertional angina, heavy smoking history, ST-depression V4-V6, reduced EF (42%), elevated LDL & TG.',
    riskBadge: 'high',
    data: {
      Age: 67,
      Weight: 84,
      Length: 172,
      Sex: 'Male',
      BMI: 28.4,
      DM: 1,
      HTN: 1,
      'Current Smoker': 1,
      'EX-Smoker': 0,
      FH: 1,
      Obesity: 'N',
      CRF: 'N',
      CVA: 'N',
      'Airway disease': 'N',
      'Thyroid Disease': 'N',
      CHF: 'N',
      DLP: 'Y',
      BP: 155,
      PR: 82,
      Edema: 0,
      'Weak Peripheral Pulse': 'Y',
      'Lung rales': 'N',
      'Systolic Murmur': 'N',
      'Diastolic Murmur': 'N',
      'Typical Chest Pain': 1,
      Dyspnea: 'Y',
      'Function Class': 2,
      Atypical: 'N',
      Nonanginal: 'N',
      'LowTH Ang': 'Y',
      'Q Wave': 0,
      'St Elevation': 0,
      'St Depression': 1,
      Tinversion: 1,
      LVH: 'Y',
      'Poor R Progression': 'Y',
      BBB: 'N',
      FBS: 168,
      CR: 1.3,
      TG: 245,
      LDL: 168,
      HDL: 34,
      BUN: 24,
      ESR: 28,
      HB: 13.8,
      K: 4.2,
      Na: 139,
      WBC: 8900,
      Lymph: 24,
      Neut: 72,
      PLT: 248,
      'EF-TTE': 42,
      'Region RWMA': 2,
      VHD: 'mild'
    },
    mockPrediction: {
      cad: {
        label: 'CAD',
        probability: 1.0
      },
      lad: {
        label: 'Stenotic',
        probability: 0.9996
      },
      lcx: {
        label: 'Stenotic',
        probability: 0.6974
      },
      rca: {
        label: 'Stenotic',
        probability: 0.9874
      }
    },
    mockExplanationCAD: {
      target: 'CAD',
      base_value: 0.38,
      features: [
        { feature: 'Typical Chest Pain', value: 'Yes (1)', shap_value: 0.28 },
        { feature: 'Age', value: 67, shap_value: 0.21 },
        { feature: 'St Depression', value: 'Present (1)', shap_value: 0.18 },
        { feature: 'Region RWMA', value: '2 (Moderate)', shap_value: 0.15 },
        { feature: 'EF-TTE', value: '42%', shap_value: 0.12 },
        { feature: 'LDL', value: '168 mg/dL', shap_value: 0.09 },
        { feature: 'Current Smoker', value: 'Yes (1)', shap_value: 0.08 },
        { feature: 'HDL', value: '34 mg/dL (Low)', shap_value: 0.07 },
        { feature: 'Tinversion', value: 'Present (1)', shap_value: 0.05 },
        { feature: 'FBS', value: '168 mg/dL', shap_value: 0.04 }
      ]
    },
    mockExplanationVessels: {
      lad: {
        target: 'LAD',
        base_value: 0.32,
        features: [
          { feature: 'St Depression (V1-V4)', value: 'Present (1)', shap_value: 0.24 },
          { feature: 'Region RWMA (Anterior)', value: '2 (Hypokinesis)', shap_value: 0.22 },
          { feature: 'Typical Chest Pain', value: 'Yes (1)', shap_value: 0.16 },
          { feature: 'Poor R Progression', value: 'Yes', shap_value: 0.14 },
          { feature: 'EF-TTE', value: '42%', shap_value: 0.11 },
          { feature: 'Age', value: 67, shap_value: 0.08 }
        ]
      },
      lcx: {
        target: 'LCX',
        base_value: 0.28,
        features: [
          { feature: 'Normal Lateral Leads (I, aVL)', value: 'Normal', shap_value: -0.16 },
          { feature: 'Absence of Lateral RWMA', value: 'None', shap_value: -0.12 },
          { feature: 'Age', value: 67, shap_value: 0.09 },
          { feature: 'Dyslipidemia', value: 'Yes', shap_value: 0.06 }
        ]
      },
      rca: {
        target: 'RCA',
        base_value: 0.30,
        features: [
          { feature: 'Tinversion (Inferior leads)', value: 'Present (1)', shap_value: 0.23 },
          { feature: 'Typical Chest Pain', value: 'Yes (1)', shap_value: 0.18 },
          { feature: 'Systolic BP', value: '155 mmHg', shap_value: 0.12 },
          { feature: 'Current Smoker', value: 'Yes (1)', shap_value: 0.10 }
        ]
      }
    }
  },
  {
    id: 'preset-moderate-lad',
    name: 'Patient 219: 58yo Female (Isolated LAD Stenosis)',
    summary: 'Atypical chest discomfort, HTN, DLP, anterior T-wave flattening, borderline EF (48%), non-smoker.',
    riskBadge: 'moderate',
    data: {
      Age: 58,
      Weight: 68,
      Length: 162,
      Sex: 'Female',
      BMI: 25.9,
      DM: 0,
      HTN: 1,
      'Current Smoker': 0,
      'EX-Smoker': 0,
      FH: 1,
      Obesity: 'N',
      CRF: 'N',
      CVA: 'N',
      'Airway disease': 'N',
      'Thyroid Disease': 'Y',
      CHF: 'N',
      DLP: 'Y',
      BP: 138,
      PR: 74,
      Edema: 0,
      'Weak Peripheral Pulse': 'N',
      'Lung rales': 'N',
      'Systolic Murmur': 'N',
      'Diastolic Murmur': 'N',
      'Typical Chest Pain': 0,
      Dyspnea: 'Y',
      'Function Class': 1,
      Atypical: 'Y',
      Nonanginal: 'N',
      'LowTH Ang': 'N',
      'Q Wave': 0,
      'St Elevation': 0,
      'St Depression': 1,
      Tinversion: 1,
      LVH: 'N',
      'Poor R Progression': 'N',
      BBB: 'N',
      FBS: 104,
      CR: 0.9,
      TG: 165,
      LDL: 142,
      HDL: 48,
      BUN: 16,
      ESR: 18,
      HB: 12.9,
      K: 4.4,
      Na: 141,
      WBC: 6800,
      Lymph: 31,
      Neut: 62,
      PLT: 215,
      'EF-TTE': 48,
      'Region RWMA': 1,
      VHD: 'N'
    },
    mockPrediction: {
      cad: {
        label: 'CAD',
        probability: 0.9359
      },
      lad: {
        label: 'Stenotic',
        probability: 0.7397
      },
      lcx: {
        label: 'Normal',
        probability: 0.2096
      },
      rca: {
        label: 'Normal',
        probability: 0.2096
      }
    },
    mockExplanationCAD: {
      target: 'CAD',
      base_value: 0.38,
      features: [
        { feature: 'St Depression', value: 'Present (1)', shap_value: 0.16 },
        { feature: 'Region RWMA', value: '1 (Mild)', shap_value: 0.14 },
        { feature: 'Age', value: 58, shap_value: 0.11 },
        { feature: 'LDL', value: '142 mg/dL', shap_value: 0.08 },
        { feature: 'Atypical Chest Pain', value: 'Yes', shap_value: 0.07 },
        { feature: 'Female Sex (Protective)', value: 'Female', shap_value: -0.12 },
        { feature: 'Non-Smoker', value: 'No', shap_value: -0.09 },
        { feature: 'Normal Fasting Glucose', value: '104 mg/dL', shap_value: -0.05 }
      ]
    },
    mockExplanationVessels: {
      lad: {
        target: 'LAD',
        base_value: 0.32,
        features: [
          { feature: 'St Depression (V2-V4)', value: 'Present (1)', shap_value: 0.22 },
          { feature: 'Region RWMA (Anterior)', value: '1 (Mild)', shap_value: 0.18 },
          { feature: 'Dyslipidemia', value: 'Yes', shap_value: 0.09 },
          { feature: 'Normal Wall in other territories', value: 'No RWMA', shap_value: -0.11 }
        ]
      },
      lcx: {
        target: 'LCX',
        base_value: 0.28,
        features: [
          { feature: 'Normal Lateral ECG', value: 'Normal', shap_value: -0.14 },
          { feature: 'Absence of Lateral RWMA', value: '0', shap_value: -0.10 }
        ]
      },
      rca: {
        target: 'RCA',
        base_value: 0.30,
        features: [
          { feature: 'Normal Inferior ECG', value: 'Normal', shap_value: -0.15 },
          { feature: 'Normal RV function', value: 'Normal', shap_value: -0.09 }
        ]
      }
    }
  },
  {
    id: 'preset-low-baseline',
    name: 'Patient 052: 38yo Male (Healthy Baseline / Low Risk)',
    summary: 'Atypical non-cardiac chest sensation, athlete, normal ECG, preserved EF (65%), optimal lipid panel.',
    riskBadge: 'low',
    data: {
      Age: 38,
      Weight: 74,
      Length: 178,
      Sex: 'Male',
      BMI: 23.4,
      DM: 0,
      HTN: 0,
      'Current Smoker': 0,
      'EX-Smoker': 0,
      FH: 0,
      Obesity: 'N',
      CRF: 'N',
      CVA: 'N',
      'Airway disease': 'N',
      'Thyroid Disease': 'N',
      CHF: 'N',
      DLP: 'N',
      BP: 118,
      PR: 62,
      Edema: 0,
      'Weak Peripheral Pulse': 'N',
      'Lung rales': 'N',
      'Systolic Murmur': 'N',
      'Diastolic Murmur': 'N',
      'Typical Chest Pain': 0,
      Dyspnea: 'N',
      'Function Class': 0,
      Atypical: 'N',
      Nonanginal: 'Y',
      'LowTH Ang': 'N',
      'Q Wave': 0,
      'St Elevation': 0,
      'St Depression': 0,
      Tinversion: 0,
      LVH: 'N',
      'Poor R Progression': 'N',
      BBB: 'N',
      FBS: 88,
      CR: 0.9,
      TG: 95,
      LDL: 82,
      HDL: 58,
      BUN: 13,
      ESR: 4,
      HB: 15.2,
      K: 4.3,
      Na: 142,
      WBC: 5600,
      Lymph: 34,
      Neut: 58,
      PLT: 220,
      'EF-TTE': 65,
      'Region RWMA': 0,
      VHD: 'N'
    },
    mockPrediction: {
      cad: {
        label: 'Normal',
        probability: 0.001
      },
      lad: {
        label: 'Normal',
        probability: 0.0006
      },
      lcx: {
        label: 'Normal',
        probability: 0.0258
      },
      rca: {
        label: 'Normal',
        probability: 0.0545
      }
    },
    mockExplanationCAD: {
      target: 'CAD',
      base_value: 0.38,
      features: [
        { feature: 'Young Age', value: 38, shap_value: -0.21 },
        { feature: 'Preserved EF-TTE', value: '65%', shap_value: -0.17 },
        { feature: 'Normal ECG (No ST/T change)', value: 'Normal', shap_value: -0.15 },
        { feature: 'Absence of RWMA', value: '0 (Normal)', shap_value: -0.14 },
        { feature: 'Optimal LDL & HDL', value: 'LDL 82 / HDL 58', shap_value: -0.11 },
        { feature: 'No Typical Chest Pain', value: '0', shap_value: -0.09 },
        { feature: 'Non-Smoker', value: 'No', shap_value: -0.08 }
      ]
    },
    mockExplanationVessels: {
      lad: {
        target: 'LAD',
        base_value: 0.32,
        features: [
          { feature: 'Normal Anterior ECG', value: 'Normal', shap_value: -0.22 },
          { feature: 'Preserved Wall Motion', value: 'Normal', shap_value: -0.18 }
        ]
      },
      lcx: {
        target: 'LCX',
        base_value: 0.28,
        features: [
          { feature: 'Normal Lateral ECG', value: 'Normal', shap_value: -0.20 }
        ]
      },
      rca: {
        target: 'RCA',
        base_value: 0.30,
        features: [
          { feature: 'Normal Inferior ECG', value: 'Normal', shap_value: -0.19 }
        ]
      }
    }
  }
];

export const DEFAULT_PATIENT_DATA = PATIENT_PRESETS[0].data;
export const DEFAULT_PREDICTION = PATIENT_PRESETS[0].mockPrediction;
export const DEFAULT_EXPLANATION = PATIENT_PRESETS[0].mockExplanationCAD;
