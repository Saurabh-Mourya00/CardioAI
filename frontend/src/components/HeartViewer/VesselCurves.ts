import * as THREE from 'three';

/**
 * Anatomical 3D curve paths for coronary arteries.
 * Modeled according to clinical coronary angiographic anatomy:
 * - LAD: Runs along the anterior interventricular sulcus to the apex, with diagonal branches.
 * - LCX: Curves laterally around the left atrioventricular groove to the posterolateral wall.
 * - RCA: Arises from anterior aortic sinus, runs down the right atrioventricular sulcus to inferior wall.
 */

export interface ArteryBranch {
  name: string;
  points: THREE.Vector3[];
  radius: number;
}

// 1. LAD (Left Anterior Descending) and major branches (Diagonal D1, D2)
export const LAD_MAIN_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0.08, 0.45, 0.58), // LMCA bifurcation
  new THREE.Vector3(0.12, 0.32, 0.72),
  new THREE.Vector3(0.10, 0.15, 0.82), // Mid-LAD
  new THREE.Vector3(0.06, -0.05, 0.86),
  new THREE.Vector3(0.01, -0.28, 0.84), // Distal LAD
  new THREE.Vector3(-0.04, -0.52, 0.76),
  new THREE.Vector3(-0.08, -0.74, 0.60),
  new THREE.Vector3(-0.11, -0.92, 0.42), // Apex wrap
  new THREE.Vector3(-0.10, -0.98, 0.30)
];

export const LAD_DIAGONAL_1_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0.12, 0.30, 0.72),
  new THREE.Vector3(0.28, 0.20, 0.70),
  new THREE.Vector3(0.42, 0.05, 0.62),
  new THREE.Vector3(0.50, -0.15, 0.52),
  new THREE.Vector3(0.54, -0.35, 0.38)
];

export const LAD_DIAGONAL_2_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0.06, -0.05, 0.86),
  new THREE.Vector3(0.18, -0.18, 0.80),
  new THREE.Vector3(0.28, -0.35, 0.70),
  new THREE.Vector3(0.34, -0.52, 0.55)
];

// 2. LCX (Left Circumflex) and Obtuse Marginal (OM1, OM2)
export const LCX_MAIN_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0.08, 0.45, 0.58), // LMCA bifurcation
  new THREE.Vector3(0.28, 0.44, 0.48),
  new THREE.Vector3(0.52, 0.38, 0.32), // Lateral groove
  new THREE.Vector3(0.68, 0.28, 0.10),
  new THREE.Vector3(0.74, 0.15, -0.15), // Posterolateral transition
  new THREE.Vector3(0.70, 0.00, -0.38),
  new THREE.Vector3(0.58, -0.15, -0.55),
  new THREE.Vector3(0.40, -0.30, -0.62),
  new THREE.Vector3(0.20, -0.42, -0.65) // Distal LCX
];

export const LCX_OM1_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0.68, 0.28, 0.10),
  new THREE.Vector3(0.76, 0.10, 0.12),
  new THREE.Vector3(0.78, -0.12, 0.08),
  new THREE.Vector3(0.72, -0.35, 0.02)
];

// 3. RCA (Right Coronary Artery) and Acute Marginal / PDA
export const RCA_MAIN_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(-0.25, 0.48, 0.46), // Right Aortic Ostium
  new THREE.Vector3(-0.45, 0.42, 0.42),
  new THREE.Vector3(-0.62, 0.30, 0.34), // Right AV groove
  new THREE.Vector3(-0.72, 0.12, 0.25),
  new THREE.Vector3(-0.75, -0.10, 0.15),
  new THREE.Vector3(-0.70, -0.32, 0.02), // Acute margin
  new THREE.Vector3(-0.58, -0.50, -0.15),
  new THREE.Vector3(-0.40, -0.62, -0.32),
  new THREE.Vector3(-0.20, -0.70, -0.44), // Crux cordis
  new THREE.Vector3(-0.05, -0.74, -0.48)
];

export const RCA_AM_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(-0.70, -0.32, 0.02),
  new THREE.Vector3(-0.62, -0.48, 0.12),
  new THREE.Vector3(-0.48, -0.62, 0.22),
  new THREE.Vector3(-0.30, -0.72, 0.28)
];

export const RCA_PDA_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(-0.20, -0.70, -0.44), // Posterior Interventricular Sulcus
  new THREE.Vector3(-0.16, -0.78, -0.30),
  new THREE.Vector3(-0.12, -0.86, -0.12),
  new THREE.Vector3(-0.10, -0.92, 0.08)
];

// Left Main Coronary Artery (LMCA trunk)
export const LMCA_TRUNK_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0.00, 0.52, 0.35), // Left coronary aortic sinus
  new THREE.Vector3(0.04, 0.48, 0.48),
  new THREE.Vector3(0.08, 0.45, 0.58)  // Bifurcation into LAD & LCX
];

export function createTubeGeometry(points: THREE.Vector3[], radius: number, tubularSegments = 64) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  return new THREE.TubeGeometry(curve, tubularSegments, radius, 12, false);
}
