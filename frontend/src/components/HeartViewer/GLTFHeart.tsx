import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { VesselKey, PredictionResponse, getRiskColorHex } from '../../types/prediction';

interface GLTFHeartProps {
  modelUrl: string;
  prediction?: PredictionResponse | null;
  selectedVessel: VesselKey | null;
  myocardiumOpacity: number;
  onSelectVessel: (vessel: VesselKey) => void;
  onError?: () => void;
}

/**
 * GLTF/GLB heart model loader component.
 * Expects mesh nodes or materials named or containing:
 * - 'lad', 'anterior_descending', or 'left_anterior' -> LAD
 * - 'lcx', 'circumflex', or 'left_circumflex' -> LCX
 * - 'rca', 'right_coronary' -> RCA
 * - 'heart', 'myocardium', 'muscle', 'ventricle' -> Myocardium
 */
export const GLTFHeart: React.FC<GLTFHeartProps> = ({
  modelUrl,
  prediction,
  selectedVessel,
  myocardiumOpacity,
  onSelectVessel,
  onError
}) => {
  const gltf = useGLTF(modelUrl, true, false, (error) => {
    console.warn(`GLTF model could not be loaded from ${modelUrl}:`, error);
    if (onError) onError();
  });

  const clonedScene = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf]);

  // Color mapping onto nodes
  useEffect(() => {
    if (!clonedScene) return;

    const ladColor = new THREE.Color(getRiskColorHex(prediction?.lad.probability ?? 0.2));
    const lcxColor = new THREE.Color(getRiskColorHex(prediction?.lcx.probability ?? 0.2));
    const rcaColor = new THREE.Color(getRiskColorHex(prediction?.rca.probability ?? 0.2));

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = (mesh.name || '').toLowerCase();

        if (name.includes('lad') || name.includes('anterior')) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: ladColor,
            emissive: ladColor,
            emissiveIntensity: selectedVessel === 'lad' ? 0.8 : 0.2,
            roughness: 0.3
          });
        } else if (name.includes('lcx') || name.includes('circumflex')) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: lcxColor,
            emissive: lcxColor,
            emissiveIntensity: selectedVessel === 'lcx' ? 0.8 : 0.2,
            roughness: 0.3
          });
        } else if (name.includes('rca') || name.includes('right')) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: rcaColor,
            emissive: rcaColor,
            emissiveIntensity: selectedVessel === 'rca' ? 0.8 : 0.2,
            roughness: 0.3
          });
        } else {
          // Myocardium
          if (mesh.material instanceof THREE.Material) {
            mesh.material.transparent = myocardiumOpacity < 1.0;
            mesh.material.opacity = myocardiumOpacity;
          }
        }
      }
    });
  }, [clonedScene, prediction, selectedVessel, myocardiumOpacity]);

  if (!clonedScene) return null;

  return (
    <primitive
      object={clonedScene}
      onClick={(e: any) => {
        const name = (e.object?.name || '').toLowerCase();
        if (name.includes('lad')) onSelectVessel('lad');
        else if (name.includes('lcx')) onSelectVessel('lcx');
        else if (name.includes('rca')) onSelectVessel('rca');
      }}
    />
  );
};
