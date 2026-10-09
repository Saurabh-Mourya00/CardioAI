import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { VesselKey, PredictionResponse } from '../../types/prediction';
import { ProceduralHeart } from './ProceduralHeart';
import { GLTFHeart } from './GLTFHeart';
import { ViewerControls, CameraViewPreset } from './ViewerControls';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface HeartCanvasProps {
  prediction?: PredictionResponse | null;
  selectedVessel: VesselKey | null;
  onSelectVessel: (vessel: VesselKey) => void;
  className?: string;
}

// Preset camera coordinate mappings
const CAMERA_PRESETS: Record<CameraViewPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  ap: { pos: [0, 0, 3.8], target: [0, -0.1, 0] },
  lao_cranial: { pos: [-2.4, 1.4, 2.5], target: [0, -0.1, 0] },
  rao_caudal: { pos: [2.5, -1.3, 2.2], target: [0, -0.1, 0] },
  posterior: { pos: [0, 0.4, -3.8], target: [0, -0.1, 0] },
  apex: { pos: [0.1, -3.4, 1.1], target: [0, -0.1, 0] }
};

// Smooth camera transition controller
function CameraController({
  preset,
  resetTrigger
}: {
  preset: CameraViewPreset;
  resetTrigger: number;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...CAMERA_PRESETS[preset].pos));

  useEffect(() => {
    targetPos.current.set(...CAMERA_PRESETS[preset].pos);
  }, [preset, resetTrigger]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.08);
  });

  return null;
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  className = ''
}) => {
  const [hoveredVessel, setHoveredVessel] = useState<VesselKey | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isBeating, setIsBeating] = useState(true);
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(0.85);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('ap');
  const [resetTrigger, setResetTrigger] = useState(0);

  // Check if a custom GLTF heart model was placed under /models/heart.glb
  const [useGltf, setUseGltf] = useState(false);
  const [glbError, setGlbError] = useState(false);

  useEffect(() => {
    // Probe if /models/heart.glb exists in public folder
    fetch('/models/heart.glb', { method: 'HEAD' })
      .then((res) => {
        if (res.ok && res.headers.get('content-type')?.includes('model')) {
          setUseGltf(true);
        }
      })
      .catch(() => {
        // Fall back to high-fidelity procedural anatomical model
        setUseGltf(false);
      });
  }, []);

  const handleResetCamera = () => {
    setCameraPreset('ap');
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className={`relative flex flex-col h-full rounded-xl overflow-hidden border border-[rgba(38,37,30,0.12)] bg-[#f7f7f4] shadow-sm ${className}`}>
      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 pointer-events-auto">
        <ViewerControls
          prediction={prediction}
          selectedVessel={selectedVessel}
          showLabels={showLabels}
          isBeating={isBeating}
          myocardiumOpacity={myocardiumOpacity}
          currentPreset={cameraPreset}
          onSelectVessel={onSelectVessel}
          onSelectCameraView={setCameraPreset}
          onToggleLabels={() => setShowLabels((prev) => !prev)}
          onToggleBeating={() => setIsBeating((prev) => !prev)}
          onChangeOpacity={setMyocardiumOpacity}
          onResetCamera={handleResetCamera}
        />
      </div>

      {/* 3D WebGL Canvas */}
      <div className="flex-1 min-h-0 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 42, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Subtle warm background lighting matching Cursor aesthetic */}
          <ambientLight intensity={1.1} />
          {/* Key light */}
          <directionalLight position={[4, 5, 4]} intensity={1.5} castShadow={false} />
          {/* Fill light */}
          <directionalLight position={[-4, 2, 2]} intensity={0.8} />
          {/* Rim light */}
          <directionalLight position={[0, -4, -3]} intensity={0.6} />

          <CameraController preset={cameraPreset} resetTrigger={resetTrigger} />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1.8}
            maxDistance={7.5}
            dampingFactor={0.08}
          />

          <Suspense fallback={null}>
            {useGltf && !glbError ? (
              <GLTFHeart
                modelUrl="/models/heart.glb"
                prediction={prediction}
                selectedVessel={selectedVessel}
                myocardiumOpacity={myocardiumOpacity}
                onSelectVessel={onSelectVessel}
                onError={() => {
                  setGlbError(true);
                  setUseGltf(false);
                }}
              />
            ) : (
              <ProceduralHeart
                prediction={prediction}
                selectedVessel={selectedVessel}
                hoveredVessel={hoveredVessel}
                showLabels={showLabels}
                myocardiumOpacity={myocardiumOpacity}
                isBeating={isBeating}
                bpm={72}
                onSelectVessel={onSelectVessel}
                onHoverVessel={setHoveredVessel}
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Medical Legend & Guidance Bar */}
      <div className="z-10 bg-[#ebeae5]/90 backdrop-blur-md px-4 py-2.5 border-t border-[rgba(38,37,30,0.1)] flex flex-wrap items-center justify-between gap-3 text-xs text-[#26251e]">
        {/* Risk Gradient Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] font-semibold text-[rgba(38,37,30,0.65)] uppercase tracking-wider">
            Risk Scale:
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1f8a65]" />
              <span className="text-[#1f8a65] font-semibold">Low (&lt;30%)</span>
            </span>
            <span className="text-[rgba(38,37,30,0.3)]">|</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c08532]" />
              <span className="text-[#c08532] font-semibold">Mod (30-59%)</span>
            </span>
            <span className="text-[rgba(38,37,30,0.3)]">|</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f54e00]" />
              <span className="text-[#f54e00] font-semibold">High (60-79%)</span>
            </span>
            <span className="text-[rgba(38,37,30,0.3)]">|</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cf2d56]" />
              <span className="text-[#cf2d56] font-semibold">Very High (80-100%)</span>
            </span>
          </div>
        </div>

        {/* Clinical Note on coordinates vs risk */}
        <div className="flex items-center gap-1.5 text-[11px] text-[rgba(38,37,30,0.65)] italic">
          <HelpCircle className="w-3.5 h-3.5 text-[rgba(38,37,30,0.5)] shrink-0" />
          <span>Vessel colors represent model-predicted risk, not physical lesion coordinates.</span>
        </div>
      </div>
    </div>
  );
};
