import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  VesselKey,
  SinglePrediction,
  getRiskColorHex,
  getRiskCategory,
  getRiskLabel
} from '../../types/prediction';
import {
  createTubeGeometry,
  LAD_MAIN_POINTS,
  LAD_DIAGONAL_1_POINTS,
  LAD_DIAGONAL_2_POINTS,
  LCX_MAIN_POINTS,
  LCX_OM1_POINTS,
  RCA_MAIN_POINTS,
  RCA_AM_POINTS,
  RCA_PDA_POINTS
} from './VesselCurves';
import { VesselSpriteLabel } from './VesselSpriteLabel';

interface VesselMeshProps {
  vesselKey: VesselKey;
  prediction?: SinglePrediction;
  isSelected: boolean;
  isHovered: boolean;
  showLabels: boolean;
  isIsolated: boolean;
  otherVesselSelected: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

export const VesselMesh: React.FC<VesselMeshProps> = ({
  vesselKey,
  prediction,
  isSelected,
  isHovered,
  showLabels,
  isIsolated,
  otherVesselSelected,
  onSelect,
  onHover
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<number>(0);

  const prob = prediction ? prediction.probability : 0.2;
  const riskColorHex = getRiskColorHex(prob);
  const riskColor = useMemo(() => new THREE.Color(riskColorHex), [riskColorHex]);
  const highlightColor = useMemo(() => new THREE.Color('#ffffff'), []);

  // Compute geometries for vessel trunk and anatomical branches
  const geometries = useMemo(() => {
    if (vesselKey === 'lad') {
      return [
        { geom: createTubeGeometry(LAD_MAIN_POINTS, 0.042, 70), isMain: true },
        { geom: createTubeGeometry(LAD_DIAGONAL_1_POINTS, 0.026, 40), isMain: false },
        { geom: createTubeGeometry(LAD_DIAGONAL_2_POINTS, 0.024, 40), isMain: false }
      ];
    } else if (vesselKey === 'lcx') {
      return [
        { geom: createTubeGeometry(LCX_MAIN_POINTS, 0.038, 70), isMain: true },
        { geom: createTubeGeometry(LCX_OM1_POINTS, 0.025, 40), isMain: false }
      ];
    } else {
      // RCA
      return [
        { geom: createTubeGeometry(RCA_MAIN_POINTS, 0.040, 70), isMain: true },
        { geom: createTubeGeometry(RCA_AM_POINTS, 0.026, 40), isMain: false },
        { geom: createTubeGeometry(RCA_PDA_POINTS, 0.024, 40), isMain: false }
      ];
    }
  }, [vesselKey]);

  // Label positioning point along main vessel trunk
  const labelPosition = useMemo(() => {
    if (vesselKey === 'lad') {
      return new THREE.Vector3(0.10, 0.15, 0.88);
    } else if (vesselKey === 'lcx') {
      return new THREE.Vector3(0.58, 0.38, 0.36);
    } else {
      return new THREE.Vector3(-0.76, 0.12, 0.28);
    }
  }, [vesselKey]);

  // Pulsating animation for selected vessel or high risk
  useFrame((_, delta) => {
    pulseRef.current += delta * 4;
    if (groupRef.current) {
      if (isSelected) {
        const scaleVal = 1 + Math.sin(pulseRef.current) * 0.03;
        groupRef.current.scale.set(scaleVal, scaleVal, scaleVal);
      } else {
        groupRef.current.scale.set(1, 1, 1);
      }
    }
  });

  // Material opacity & emissive tuning
  const opacity = isIsolated ? 1.0 : otherVesselSelected ? 0.45 : 1.0;
  const emissiveIntensity = isSelected ? 0.85 : isHovered ? 0.65 : 0.25;

  const riskCat = getRiskCategory(prob);
  const riskLbl = getRiskLabel(riskCat);

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        onHover(false);
      }}
    >
      {geometries.map((item, idx) => (
        <mesh key={idx} geometry={item.geom}>
          <meshStandardMaterial
            color={isSelected || isHovered ? highlightColor.clone().lerp(riskColor, 0.3) : riskColor}
            emissive={riskColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.25}
            metalness={0.2}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      ))}

      {/* Floating 3D Billboard Label (Pure Three.js sprite, immune to React 19 root unmount errors) */}
      {showLabels && (
        <VesselSpriteLabel
          position={labelPosition}
          vesselKey={vesselKey}
          prediction={prediction}
          isSelected={isSelected}
          isHovered={isHovered}
          onClick={onSelect}
        />
      )}
    </group>
  );
};
