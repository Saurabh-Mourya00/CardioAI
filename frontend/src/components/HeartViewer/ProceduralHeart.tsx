import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { VesselKey, PredictionResponse } from '../../types/prediction';
import { VesselMesh } from './VesselMesh';
import { LMCA_TRUNK_POINTS, createTubeGeometry } from './VesselCurves';

interface ProceduralHeartProps {
  prediction?: PredictionResponse | null;
  selectedVessel: VesselKey | null;
  hoveredVessel: VesselKey | null;
  showLabels: boolean;
  myocardiumOpacity: number;
  isBeating: boolean;
  bpm?: number;
  onSelectVessel: (vessel: VesselKey) => void;
  onHoverVessel: (vessel: VesselKey | null) => void;
}

export const ProceduralHeart: React.FC<ProceduralHeartProps> = ({
  prediction,
  selectedVessel,
  hoveredVessel,
  showLabels,
  myocardiumOpacity,
  isBeating,
  bpm = 72,
  onSelectVessel,
  onHoverVessel
}) => {
  const heartGroupRef = useRef<THREE.Group>(null);
  const ventriclesRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef<number>(0);

  // Left Main Coronary Artery geometry
  const lmcaGeom = useMemo(() => createTubeGeometry(LMCA_TRUNK_POINTS, 0.046, 32), []);

  // Anatomical myocardium materials
  const myocardiumMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94333c'), // Natural myocardial crimson-burgundy
      roughness: 0.55,
      metalness: 0.1,
      transparent: myocardiumOpacity < 1.0,
      opacity: myocardiumOpacity,
      depthWrite: myocardiumOpacity >= 0.8,
      wireframe: false
    });
  }, [myocardiumOpacity]);

  const atriaMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#852a35'),
      roughness: 0.6,
      metalness: 0.08,
      transparent: myocardiumOpacity < 1.0,
      opacity: myocardiumOpacity * 0.95
    });
  }, [myocardiumOpacity]);

  const aortaMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#b34045'),
      roughness: 0.35,
      metalness: 0.2,
      transparent: myocardiumOpacity < 1.0,
      opacity: Math.max(0.6, myocardiumOpacity)
    });
  }, [myocardiumOpacity]);

  const pulmonaryMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#46688d'), // Deoxygenated pulmonary blue-gray
      roughness: 0.4,
      metalness: 0.15,
      transparent: myocardiumOpacity < 1.0,
      opacity: Math.max(0.6, myocardiumOpacity)
    });
  }, [myocardiumOpacity]);

  // Cardiac cycle animation (Lub-Dub physiological systolic contraction)
  useFrame((_, delta) => {
    if (!isBeating || !heartGroupRef.current) return;

    timeRef.current += delta * (bpm / 60) * Math.PI * 2;
    const t = timeRef.current;

    // Dual peak (atrial systole then ventricular systole)
    const cycle = Math.sin(t) * Math.sin(t * 0.5);
    const lubDub = Math.max(0, Math.sin(t * 2)) * 0.04 + Math.max(0, Math.sin(t * 2 + 0.6)) * 0.025;

    const baseScale = 1.0;
    const currentScale = baseScale + lubDub;
    heartGroupRef.current.scale.set(currentScale, currentScale * (1 - lubDub * 0.5), currentScale);
  });

  return (
    <group ref={heartGroupRef} position={[0, -0.1, 0]}>
      {/* 1. Main Ventricular Mass (Myocardium: LV & RV apex) */}
      <group>
        {/* Left Ventricle (apex pointing down and slightly left) */}
        <mesh
          ref={ventriclesRef}
          position={[-0.04, -0.22, 0.08]}
          rotation={[0.15, 0.08, -0.18]}
          material={myocardiumMaterial}
        >
          {/* Anatomical modified sphere/ellipsoid for muscular ventricular apex */}
          <sphereGeometry args={[0.82, 48, 48]} />
        </mesh>

        {/* Right Ventricle bulge (anterior & rightward) */}
        <mesh
          position={[-0.32, -0.16, 0.28]}
          rotation={[0.2, -0.3, 0.1]}
          scale={[0.75, 0.85, 0.65]}
          material={myocardiumMaterial}
        >
          <sphereGeometry args={[0.7, 36, 36]} />
        </mesh>

        {/* Cardiac Apex tip taper */}
        <mesh
          position={[-0.12, -0.88, 0.32]}
          rotation={[0.15, 0, -0.12]}
          scale={[0.42, 0.5, 0.42]}
          material={myocardiumMaterial}
        >
          <coneGeometry args={[0.65, 0.9, 32]} />
        </mesh>
      </group>

      {/* 2. Atria (Base of the heart) */}
      <group>
        {/* Left Atrium (Posterior base) */}
        <mesh position={[0.25, 0.35, -0.25]} material={atriaMaterial}>
          <sphereGeometry args={[0.55, 32, 32]} />
        </mesh>

        {/* Right Atrium (Anterolateral right base) */}
        <mesh position={[-0.52, 0.28, 0.05]} material={atriaMaterial}>
          <sphereGeometry args={[0.52, 32, 32]} />
        </mesh>

        {/* Superior Vena Cava */}
        <mesh position={[-0.58, 0.72, -0.05]} material={pulmonaryMaterial}>
          <cylinderGeometry args={[0.14, 0.16, 0.5, 24]} />
        </mesh>
      </group>

      {/* 3. Great Arteries (Aortic Arch & Pulmonary Trunk) */}
      <group>
        {/* Ascending Aorta */}
        <mesh position={[-0.05, 0.65, 0.15]} rotation={[0.08, 0, -0.1]} material={aortaMaterial}>
          <cylinderGeometry args={[0.22, 0.24, 0.65, 32]} />
        </mesh>

        {/* Aortic Arch curve */}
        <mesh position={[0.04, 0.95, -0.02]} rotation={[Math.PI / 2.8, 0, 0.35]} material={aortaMaterial}>
          <torusGeometry args={[0.3, 0.18, 20, 36, Math.PI * 0.9]} />
        </mesh>

        {/* Brachiocephalic & Carotid branches from arch */}
        <mesh position={[-0.08, 1.15, 0.02]} material={aortaMaterial}>
          <cylinderGeometry args={[0.06, 0.06, 0.28, 16]} />
        </mesh>
        <mesh position={[0.06, 1.18, -0.05]} material={aortaMaterial}>
          <cylinderGeometry args={[0.055, 0.055, 0.25, 16]} />
        </mesh>
        <mesh position={[0.18, 1.15, -0.12]} material={aortaMaterial}>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
        </mesh>

        {/* Pulmonary Trunk crossing anterior to Aorta */}
        <mesh
          position={[0.15, 0.58, 0.36]}
          rotation={[-0.32, 0.28, 0.35]}
          material={pulmonaryMaterial}
        >
          <cylinderGeometry args={[0.19, 0.21, 0.62, 32]} />
        </mesh>
      </group>

      {/* 4. Left Main Coronary Artery (LMCA) trunk */}
      <mesh geometry={lmcaGeom}>
        <meshStandardMaterial
          color={new THREE.Color('#d9383a')}
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>

      {/* 5. The Three Coronary Target Vessels */}
      {/* LAD - Left Anterior Descending */}
      <VesselMesh
        vesselKey="lad"
        prediction={prediction?.lad}
        isSelected={selectedVessel === 'lad'}
        isHovered={hoveredVessel === 'lad'}
        showLabels={showLabels}
        isIsolated={selectedVessel === 'lad'}
        otherVesselSelected={selectedVessel !== null && selectedVessel !== 'lad'}
        onSelect={() => onSelectVessel('lad')}
        onHover={(hov) => onHoverVessel(hov ? 'lad' : null)}
      />

      {/* LCX - Left Circumflex */}
      <VesselMesh
        vesselKey="lcx"
        prediction={prediction?.lcx}
        isSelected={selectedVessel === 'lcx'}
        isHovered={hoveredVessel === 'lcx'}
        showLabels={showLabels}
        isIsolated={selectedVessel === 'lcx'}
        otherVesselSelected={selectedVessel !== null && selectedVessel !== 'lcx'}
        onSelect={() => onSelectVessel('lcx')}
        onHover={(hov) => onHoverVessel(hov ? 'lcx' : null)}
      />

      {/* RCA - Right Coronary Artery */}
      <VesselMesh
        vesselKey="rca"
        prediction={prediction?.rca}
        isSelected={selectedVessel === 'rca'}
        isHovered={hoveredVessel === 'rca'}
        showLabels={showLabels}
        isIsolated={selectedVessel === 'rca'}
        otherVesselSelected={selectedVessel !== null && selectedVessel !== 'rca'}
        onSelect={() => onSelectVessel('rca')}
        onHover={(hov) => onHoverVessel(hov ? 'rca' : null)}
      />
    </group>
  );
};
