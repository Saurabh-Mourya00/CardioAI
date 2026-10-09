import { PatientData, FeatureCategory } from '../types/patient';

export interface FeatureMetadata {
  key: keyof PatientData;
  label: string;
  category: FeatureCategory;
  type: 'number' | 'boolean_int' | 'boolean_str' | 'select';
  unit?: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  defaultValue: any;
}

export const FEATURE_SCHEMAS: FeatureMetadata[] = [
  // 1. Demographics & Vitals
  {
    key: 'Age',
    label: 'Age',
    category: 'Demographics & Vitals',
    type: 'number',
    unit: 'yrs',
    description: 'Patient age in completed years',
    min: 18,
    max: 100,
    step: 1,
    defaultValue: 58
  },
  {
    key: 'Sex',
    label: 'Biological Sex',
    category: 'Demographics & Vitals',
    type: 'select',
    description: 'Biological sex assigned at birth',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ],
    defaultValue: 'Male'
  },
  {
    key: 'Weight',
    label: 'Weight',
    category: 'Demographics & Vitals',
    type: 'number',
    unit: 'kg',
    description: 'Body weight in kilograms',
    min: 35,
    max: 180,
    step: 1,
    defaultValue: 76
  },
  {
    key: 'Length',
    label: 'Length (Height)',
    category: 'Demographics & Vitals',
    type: 'number',
    unit: 'cm',
    description: 'Patient standing height in centimeters',
    min: 120,
    max: 220,
    step: 1,
    defaultValue: 172
  },
  {
    key: 'BMI',
    label: 'BMI',
    category: 'Demographics & Vitals',
    type: 'number',
    unit: 'kg/m²',
    description: 'Body Mass Index (auto-computed from Weight / Length²)',
    min: 14,
    max: 55,
    step: 0.1,
    defaultValue: 25.7
  },
  {
    key: 'BP',
    label: 'Systolic Blood Pressure',
    category: 'Demographics & Vitals',
    type: 'number',
    unit: 'mmHg',
    description: 'Resting systolic arterial blood pressure',
    min: 70,
    max: 240,
    step: 1,
    defaultValue: 130
  },
  {
    key: 'PR',
    label: 'Pulse Rate',
    category: 'Demographics & Vitals',
    type: 'number',
    unit: 'bpm',
    description: 'Resting heart rate / pulse rate in beats per minute',
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 74
  },

  // 2. History & Comorbidities
  {
    key: 'DM',
    label: 'Diabetes Mellitus',
    category: 'History & Comorbidities',
    type: 'boolean_int',
    description: 'Diagnosed Diabetes Mellitus type 1 or 2',
    defaultValue: 0
  },
  {
    key: 'HTN',
    label: 'Hypertension',
    category: 'History & Comorbidities',
    type: 'boolean_int',
    description: 'Diagnosed systemic arterial hypertension',
    defaultValue: 1
  },
  {
    key: 'Current Smoker',
    label: 'Current Smoker',
    category: 'History & Comorbidities',
    type: 'boolean_int',
    description: 'Currently smokes tobacco products regularly',
    defaultValue: 1
  },
  {
    key: 'EX-Smoker',
    label: 'Ex-Smoker',
    category: 'History & Comorbidities',
    type: 'boolean_int',
    description: 'Previous history of regular tobacco use, currently ceased',
    defaultValue: 0
  },
  {
    key: 'FH',
    label: 'Family History of CAD',
    category: 'History & Comorbidities',
    type: 'boolean_int',
    description: 'First-degree relative with premature coronary artery disease',
    defaultValue: 1
  },
  {
    key: 'Obesity',
    label: 'Obesity',
    category: 'History & Comorbidities',
    type: 'boolean_str',
    description: 'Clinically documented obesity status (BMI ≥ 30)',
    defaultValue: 'N'
  },
  {
    key: 'CRF',
    label: 'Chronic Renal Failure',
    category: 'History & Comorbidities',
    type: 'boolean_str',
    description: 'Documented chronic kidney disease / renal impairment',
    defaultValue: 'N'
  },
  {
    key: 'CVA',
    label: 'Cerebrovascular Accident',
    category: 'History & Comorbidities',
    type: 'boolean_str',
    description: 'Prior ischemic or hemorrhagic stroke / TIA history',
    defaultValue: 'N'
  },
  {
    key: 'Airway disease',
    label: 'Airway Disease (COPD/Asthma)',
    category: 'History & Comorbidities',
    type: 'boolean_str',
    description: 'Chronic obstructive pulmonary disease or bronchial asthma',
    defaultValue: 'N'
  },
  {
    key: 'Thyroid Disease',
    label: 'Thyroid Disease',
    category: 'History & Comorbidities',
    type: 'boolean_str',
    description: 'Documented hypo- or hyperthyroid disorder',
    defaultValue: 'N'
  },
  {
    key: 'CHF',
    label: 'Congestive Heart Failure',
    category: 'History & Comorbidities',
    type: 'boolean_str',
    description: 'Prior history of congestive heart failure',
    defaultValue: 'N'
  },
  {
    key: 'DLP',
    label: 'Dyslipidemia (DLP)',
    category: 'History & Comorbidities',
    type: 'boolean_str',
    description: 'Abnormal serum lipid profile or on statin therapy',
    defaultValue: 'Y'
  },

  // 3. Symptoms & Exam
  {
    key: 'Typical Chest Pain',
    label: 'Typical Chest Pain',
    category: 'Symptoms & Exam',
    type: 'boolean_int',
    description: 'Substernal chest discomfort provoked by exertion and relieved by rest or nitroglycerin',
    defaultValue: 1
  },
  {
    key: 'Atypical',
    label: 'Atypical Chest Pain',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Chest discomfort meeting only 2 of 3 typical angina criteria',
    defaultValue: 'N'
  },
  {
    key: 'Nonanginal',
    label: 'Non-Anginal Chest Pain',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Chest discomfort meeting 1 or none of typical criteria',
    defaultValue: 'N'
  },
  {
    key: 'LowTH Ang',
    label: 'Low Threshold Angina',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Angina provoked by minimal exertion or at rest',
    defaultValue: 'N'
  },
  {
    key: 'Dyspnea',
    label: 'Dyspnea on Exertion',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Shortness of breath related to cardiac origin',
    defaultValue: 'N'
  },
  {
    key: 'Function Class',
    label: 'NYHA Function Class',
    category: 'Symptoms & Exam',
    type: 'select',
    description: 'New York Heart Association functional classification (0-3)',
    options: [
      { value: 0, label: 'Class 0: None / Asymptomatic' },
      { value: 1, label: 'Class I: Mild limitation with vigorous activity' },
      { value: 2, label: 'Class II: Slight limitation with ordinary activity' },
      { value: 3, label: 'Class III: Marked limitation with less than ordinary activity' }
    ],
    defaultValue: 1
  },
  {
    key: 'Edema',
    label: 'Peripheral Edema',
    category: 'Symptoms & Exam',
    type: 'boolean_int',
    description: 'Pitting edema of lower extremities',
    defaultValue: 0
  },
  {
    key: 'Weak Peripheral Pulse',
    label: 'Weak Peripheral Pulse',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Diminished dorsalis pedis or posterior tibial pulse palpation',
    defaultValue: 'N'
  },
  {
    key: 'Lung rales',
    label: 'Lung Rales / Crackles',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Bilateral basal lung crackles on auscultation (pulmonary congestion)',
    defaultValue: 'N'
  },
  {
    key: 'Systolic Murmur',
    label: 'Systolic Murmur',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Pathological systolic heart murmur detected on auscultation',
    defaultValue: 'N'
  },
  {
    key: 'Diastolic Murmur',
    label: 'Diastolic Murmur',
    category: 'Symptoms & Exam',
    type: 'boolean_str',
    description: 'Pathological diastolic heart murmur detected on auscultation',
    defaultValue: 'N'
  },

  // 4. ECG Findings
  {
    key: 'Q Wave',
    label: 'Pathologic Q Wave',
    category: 'ECG Findings',
    type: 'boolean_int',
    description: 'Abnormal Q-wave suggestive of prior transmural infarction',
    defaultValue: 0
  },
  {
    key: 'St Elevation',
    label: 'ST Elevation',
    category: 'ECG Findings',
    type: 'boolean_int',
    description: 'ST-segment elevation on resting 12-lead electrocardiogram',
    defaultValue: 0
  },
  {
    key: 'St Depression',
    label: 'ST Depression',
    category: 'ECG Findings',
    type: 'boolean_int',
    description: 'ST-segment horizontal or downsloping depression ≥ 1mm',
    defaultValue: 1
  },
  {
    key: 'Tinversion',
    label: 'T-Wave Inversion',
    category: 'ECG Findings',
    type: 'boolean_int',
    description: 'Symmetric T-wave inversion in contiguous leads',
    defaultValue: 1
  },
  {
    key: 'LVH',
    label: 'Left Ventricular Hypertrophy (ECG)',
    category: 'ECG Findings',
    type: 'boolean_str',
    description: 'Sokolow-Lyon or Cornell voltage criteria for LVH',
    defaultValue: 'N'
  },
  {
    key: 'Poor R Progression',
    label: 'Poor R-Wave Progression',
    category: 'ECG Findings',
    type: 'boolean_str',
    description: 'Reversed or absent R-wave increase across precordial leads V1-V4',
    defaultValue: 'N'
  },
  {
    key: 'BBB',
    label: 'Bundle Branch Block',
    category: 'ECG Findings',
    type: 'select',
    description: 'Conduction block on surface 12-lead ECG',
    options: [
      { value: 'N', label: 'None (Normal conduction)' },
      { value: 'LBBB', label: 'Left Bundle Branch Block' },
      { value: 'RBBB', label: 'Right Bundle Branch Block' }
    ],
    defaultValue: 'N'
  },

  // 5. Laboratory & Echo
  {
    key: 'FBS',
    label: 'Fasting Blood Sugar',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mg/dL',
    description: 'Overnight fasting serum blood glucose level',
    min: 60,
    max: 400,
    step: 1,
    defaultValue: 112
  },
  {
    key: 'CR',
    label: 'Serum Creatinine',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mg/dL',
    description: 'Serum creatinine level (renal filtration marker)',
    min: 0.4,
    max: 12.0,
    step: 0.1,
    defaultValue: 1.0
  },
  {
    key: 'TG',
    label: 'Triglycerides',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mg/dL',
    description: 'Fasting serum triglycerides level',
    min: 40,
    max: 800,
    step: 1,
    defaultValue: 185
  },
  {
    key: 'LDL',
    label: 'LDL Cholesterol',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mg/dL',
    description: 'Low-density lipoprotein cholesterol (atherogenic)',
    min: 30,
    max: 350,
    step: 1,
    defaultValue: 148
  },
  {
    key: 'HDL',
    label: 'HDL Cholesterol',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mg/dL',
    description: 'High-density lipoprotein cholesterol (protective)',
    min: 15,
    max: 100,
    step: 1,
    defaultValue: 42
  },
  {
    key: 'BUN',
    label: 'Blood Urea Nitrogen',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mg/dL',
    description: 'Serum blood urea nitrogen level',
    min: 5,
    max: 120,
    step: 1,
    defaultValue: 18
  },
  {
    key: 'ESR',
    label: 'Erythrocyte Sedimentation Rate',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mm/hr',
    description: 'Nonspecific inflammatory activity marker',
    min: 1,
    max: 120,
    step: 1,
    defaultValue: 16
  },
  {
    key: 'HB',
    label: 'Hemoglobin',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'g/dL',
    description: 'Total blood hemoglobin concentration',
    min: 6,
    max: 20,
    step: 0.1,
    defaultValue: 14.2
  },
  {
    key: 'K',
    label: 'Potassium (K⁺)',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mEq/L',
    description: 'Serum potassium electrolyte concentration',
    min: 2.5,
    max: 7.0,
    step: 0.1,
    defaultValue: 4.4
  },
  {
    key: 'Na',
    label: 'Sodium (Na⁺)',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'mEq/L',
    description: 'Serum sodium electrolyte concentration',
    min: 120,
    max: 160,
    step: 1,
    defaultValue: 140
  },
  {
    key: 'WBC',
    label: 'White Blood Cell Count',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: 'cells/mcL',
    description: 'Total leukocyte count',
    min: 2000,
    max: 30000,
    step: 100,
    defaultValue: 7600
  },
  {
    key: 'Lymph',
    label: 'Lymphocytes',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: '%',
    description: 'Differential lymphocyte percentage',
    min: 5,
    max: 75,
    step: 1,
    defaultValue: 31
  },
  {
    key: 'Neut',
    label: 'Neutrophils',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: '%',
    description: 'Differential neutrophil percentage',
    min: 20,
    max: 95,
    step: 1,
    defaultValue: 63
  },
  {
    key: 'PLT',
    label: 'Platelet Count',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: '×10³/mcL',
    description: 'Thrombocyte / platelet count',
    min: 50,
    max: 600,
    step: 5,
    defaultValue: 235
  },
  {
    key: 'EF-TTE',
    label: 'EF-TTE (Ejection Fraction)',
    category: 'Laboratory & Echo',
    type: 'number',
    unit: '%',
    description: 'Left Ventricular Ejection Fraction measured by Transthoracic Echocardiography',
    min: 15,
    max: 80,
    step: 1,
    defaultValue: 50
  },
  {
    key: 'Region RWMA',
    label: 'Region RWMA Score',
    category: 'Laboratory & Echo',
    type: 'select',
    description: 'Regional Wall Motion Abnormality score by echocardiography (0 = none, 1-4 = progressive wall hypokinesis/akinesis)',
    options: [
      { value: 0, label: '0: Normal wall motion' },
      { value: 1, label: '1: Hypokinesis (isolated segment)' },
      { value: 2, label: '2: Moderate RWMA' },
      { value: 3, label: '3: Severe / Akinesis' },
      { value: 4, label: '4: Dyskinesis / Aneurysm' }
    ],
    defaultValue: 1
  },
  {
    key: 'VHD',
    label: 'Valvular Heart Disease (VHD)',
    category: 'Laboratory & Echo',
    type: 'select',
    description: 'Aortic or mitral valvular disease severity',
    options: [
      { value: 'N', label: 'None (Normal valves)' },
      { value: 'mild', label: 'Mild valvulopathy' },
      { value: 'Moderate', label: 'Moderate valvulopathy' },
      { value: 'Severe', label: 'Severe valvulopathy' }
    ],
    defaultValue: 'N'
  }
];

export const CATEGORIES: FeatureCategory[] = [
  'Demographics & Vitals',
  'History & Comorbidities',
  'Symptoms & Exam',
  'ECG Findings',
  'Laboratory & Echo'
];
