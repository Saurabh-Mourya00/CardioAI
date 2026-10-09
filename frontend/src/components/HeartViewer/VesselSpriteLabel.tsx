import React, { useMemo } from 'react';
import * as THREE from 'three';
import { VesselKey, SinglePrediction, getRiskColorHex, getRiskLabel, getRiskCategory } from '../../types/prediction';

interface VesselSpriteLabelProps {
  position: THREE.Vector3;
  vesselKey: VesselKey;
  prediction?: SinglePrediction;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
}

export const VesselSpriteLabel: React.FC<VesselSpriteLabelProps> = ({
  position,
  vesselKey,
  prediction,
  isSelected,
  isHovered,
  onClick
}) => {
  const prob = prediction ? prediction.probability : 0.2;
  const riskColor = getRiskColorHex(prob);
  const label = prediction ? prediction.label : 'Normal';
  const riskLabel = getRiskLabel(getRiskCategory(prob));

  // Generate crisp 2D canvas texture for the billboard sprite
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    if (!ctx) return new THREE.Texture();

    // Scale & padding
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rounded rectangle background
    const x = 16;
    const y = 20;
    const width = 480;
    const height = 120;
    const radius = 24;

    ctx.save();

    // Draw background pill
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = isSelected ? '#1c1b16' : '#26251ef0';
    ctx.fill();

    // Border
    ctx.lineWidth = isSelected ? 8 : 3;
    ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();

    // Risk indicator circle
    const dotX = x + 38;
    const dotY = y + height / 2;
    const dotRadius = 14;

    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = riskColor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Text: Artery Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "IBM Plex Mono", monospace, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(vesselKey.toUpperCase(), dotX + 28, dotY - 14);

    // Text: Probability & Risk Status
    ctx.fillStyle = isSelected ? '#ffffff' : '#e6e5e0';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    const percentText = `${Math.round(prob * 100)}% • ${label}`;
    ctx.fillText(percentText, dotX + 120, dotY - 14);

    // Subtitle: Risk category (e.g. High Risk)
    ctx.fillStyle = isSelected ? '#f54e00' : 'rgba(255, 255, 255, 0.7)';
    ctx.font = '500 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(riskLabel.toUpperCase(), dotX + 28, dotY + 26);

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [vesselKey, prob, label, riskLabel, riskColor, isSelected]);

  // Clean sprite scale in 3D world space
  const spriteScale: [number, number, number] = isSelected
    ? [0.72, 0.24, 1]
    : isHovered
    ? [0.65, 0.21, 1]
    : [0.58, 0.19, 1];

  return (
    <sprite
      position={position}
      scale={spriteScale}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <spriteMaterial
        map={texture}
        depthTest={false}
        depthWrite={false}
        transparent={true}
      />
    </sprite>
  );
};
