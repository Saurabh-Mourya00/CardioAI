export type RiskCategory = 'low' | 'moderate' | 'high' | 'very_high';

export type VesselKey = 'lad' | 'lcx' | 'rca';

export interface SinglePrediction {
  label: 'CAD' | 'Normal' | 'Stenotic';
  probability: number; // 0.0 to 1.0
}

export interface PredictionResponse {
  cad: SinglePrediction;
  lad: SinglePrediction;
  lcx: SinglePrediction;
  rca: SinglePrediction;
}

export interface ShapFeature {
  feature: string;
  value: number | string;
  shap_value: number; // Attribution value: positive increases risk, negative decreases risk
}

export interface ExplanationResponse {
  target: 'CAD' | 'LAD' | 'LCX' | 'RCA';
  features: ShapFeature[];
  base_value?: number;
}

export interface VesselInfo {
  key: VesselKey;
  shortName: string;
  fullName: string;
  clinicalSignificance: string;
  anatomicalCourse: string;
  perfusionTerritory: string;
}

export const VESSEL_DETAILS: Record<VesselKey, VesselInfo> = {
  lad: {
    key: 'lad',
    shortName: 'LAD',
    fullName: 'Left Anterior Descending Artery',
    clinicalSignificance: 'Often called the "widow maker". Supplies 45-55% of the left ventricle. Occlusion carries the highest mortality risk.',
    anatomicalCourse: 'Originates from Left Main Coronary Artery, courses along the anterior interventricular groove towards the apex.',
    perfusionTerritory: 'Anterior wall of the left ventricle, anterior two-thirds of the interventricular septum, and cardiac apex.'
  },
  lcx: {
    key: 'lcx',
    shortName: 'LCX',
    fullName: 'Left Circumflex Artery',
    clinicalSignificance: 'Supplies the lateral and posterior aspects of the left ventricle. Crucial for posterolateral myocardial viability.',
    anatomicalCourse: 'Branches from Left Main Coronary Artery, courses along the left atrioventricular groove towards the posterior base.',
    perfusionTerritory: 'Lateral and posterior myocardium of the left ventricle, occasionally the sinus node (40%) and AV node (10%).'
  },
  rca: {
    key: 'rca',
    shortName: 'RCA',
    fullName: 'Right Coronary Artery',
    clinicalSignificance: 'Supplies the right ventricle and inferior LV wall. Stenosis often causes inferior wall ischemia, bradycardia, or AV block.',
    anatomicalCourse: 'Originates from right aortic sinus, travels along the right atrioventricular groove around to the inferior cardiac surface.',
    perfusionTerritory: 'Right ventricle, inferior/diaphragmatic wall of left ventricle, sinoatrial (SA) node (60%), and atrioventricular (AV) node (90%).'
  }
};

/**
 * Maps risk probability (0 to 1) to clinical risk categories
 * 0.00–0.29 → low risk
 * 0.30–0.59 → moderate risk
 * 0.60–0.79 → high risk
 * 0.80–1.00 → very high risk
 */
export function getRiskCategory(probability: number): RiskCategory {
  if (probability < 0.30) return 'low';
  if (probability < 0.60) return 'moderate';
  if (probability < 0.80) return 'high';
  return 'very_high';
}

export function getRiskLabel(category: RiskCategory): string {
  switch (category) {
    case 'low': return 'Low Risk';
    case 'moderate': return 'Moderate Risk';
    case 'high': return 'High Risk';
    case 'very_high': return 'Very High Risk';
  }
}

/**
 * Color mapping based on risk probability:
 * Intuitive clinical gradient adhering to Cursor design system:
 * Low: Muted Teal/Emerald (#1f8a65)
 * Moderate: Warm Amber/Gold (#c08532)
 * High: Vibrant Red-Orange (#f54e00)
 * Very High: Crimson-Rose (#cf2d56)
 */
export function getRiskColorHex(probability: number): string {
  if (probability < 0.30) return '#1f8a65';
  if (probability < 0.60) return '#c08532';
  if (probability < 0.80) return '#f54e00';
  return '#cf2d56';
}

export function getRiskBadgeClasses(category: RiskCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'low':
      return {
        bg: 'bg-emerald-50 text-[#1f8a65]',
        text: 'text-[#1f8a65]',
        border: 'border-emerald-200'
      };
    case 'moderate':
      return {
        bg: 'bg-amber-50 text-[#c08532]',
        text: 'text-[#c08532]',
        border: 'border-amber-200'
      };
    case 'high':
      return {
        bg: 'bg-orange-50 text-[#f54e00]',
        text: 'text-[#f54e00]',
        border: 'border-orange-200'
      };
    case 'very_high':
      return {
        bg: 'bg-rose-50 text-[#cf2d56]',
        text: 'text-[#cf2d56]',
        border: 'border-rose-200'
      };
  }
}
