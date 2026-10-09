/**
 * Patient clinical input features based on the 54 clinical variables
 * from the Z-Alizadeh Sani Cardiovascular Disease dataset.
 *
 * NOTE: Target variables ('LAD', 'LCX', 'RCA', 'Cath') are prediction targets
 * and must NEVER be included in this input schema.
 */

export interface PatientData {
  // 1. Demographics & Anthropometrics
  Age: number;
  Weight: number; // in kg
  Length: number; // Height in cm
  Sex: 'Male' | 'Female';
  BMI: number; // kg/m^2 (auto-calculated from Weight & Length if needed)

  // 2. Comorbidities & Medical History
  DM: number; // Diabetes Mellitus (0 = No, 1 = Yes)
  HTN: number; // Hypertension (0 = No, 1 = Yes)
  'Current Smoker': number; // (0 = No, 1 = Yes)
  'EX-Smoker': number; // (0 = No, 1 = Yes)
  FH: number; // Family History of CAD (0 = No, 1 = Yes)
  Obesity: 'Y' | 'N'; // Obesity status
  CRF: 'Y' | 'N'; // Chronic Renal Failure
  CVA: 'Y' | 'N'; // Cerebrovascular Accident (Stroke)
  'Airway disease': 'Y' | 'N'; // COPD / Asthma
  'Thyroid Disease': 'Y' | 'N'; // Hypo/hyperthyroidism
  CHF: 'Y' | 'N'; // Congestive Heart Failure
  DLP: 'Y' | 'N'; // Dyslipidemia

  // 3. Physical Examination & Vitals
  BP: number; // Systolic Blood Pressure (mmHg)
  PR: number; // Pulse Rate (bpm)
  Edema: number; // Peripheral edema (0 = No, 1 = Yes)
  'Weak Peripheral Pulse': 'Y' | 'N';
  'Lung rales': 'Y' | 'N';
  'Systolic Murmur': 'Y' | 'N';
  'Diastolic Murmur': 'Y' | 'N';

  // 4. Symptoms & Angina Classification
  'Typical Chest Pain': number; // (0 = No, 1 = Yes)
  Dyspnea: 'Y' | 'N';
  'Function Class': number; // NYHA Class: 0, 1, 2, 3
  Atypical: 'Y' | 'N';
  Nonanginal: 'Y' | 'N';
  'LowTH Ang': 'Y' | 'N'; // Low threshold angina

  // 5. ECG Findings
  'Q Wave': number; // Pathologic Q-wave (0 = No, 1 = Yes)
  'St Elevation': number; // (0 = No, 1 = Yes)
  'St Depression': number; // (0 = No, 1 = Yes)
  Tinversion: number; // T-wave inversion (0 = No, 1 = Yes)
  LVH: 'Y' | 'N'; // Left Ventricular Hypertrophy
  'Poor R Progression': 'Y' | 'N';
  BBB: 'N' | 'LBBB' | 'RBBB'; // Bundle Branch Block

  // 6. Laboratory Findings
  FBS: number; // Fasting Blood Sugar (mg/dL)
  CR: number; // Serum Creatinine (mg/dL)
  TG: number; // Triglycerides (mg/dL)
  LDL: number; // Low-Density Lipoprotein (mg/dL)
  HDL: number; // High-Density Lipoprotein (mg/dL)
  BUN: number; // Blood Urea Nitrogen (mg/dL)
  ESR: number; // Erythrocyte Sedimentation Rate (mm/hr)
  HB: number; // Hemoglobin (g/dL)
  K: number; // Serum Potassium (mEq/L)
  Na: number; // Serum Sodium (mEq/L)
  WBC: number; // White Blood Cell count (cells/mcL)
  Lymph: number; // Lymphocyte percentage (%)
  Neut: number; // Neutrophil percentage (%)
  PLT: number; // Platelet count (x10^3/mcL)

  // 7. Echocardiography Findings
  'EF-TTE': number; // Ejection Fraction (%)
  'Region RWMA': number; // Regional Wall Motion Abnormality score (0-4)
  VHD: 'N' | 'mild' | 'Moderate' | 'Severe'; // Valvular Heart Disease
}

export type FeatureCategory =
  | 'Demographics & Vitals'
  | 'History & Comorbidities'
  | 'Symptoms & Exam'
  | 'ECG Findings'
  | 'Laboratory & Echo';
