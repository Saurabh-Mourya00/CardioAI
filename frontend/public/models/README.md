# Coronary Anatomical 3D Models Directory

This directory hosts 3D anatomical coronary heart assets for CardioPulse 3D.

## Default Procedural Model vs Custom GLB

By default, CardioPulse 3D includes a high-fidelity **procedural anatomical Three.js model** that represents:
- Muscular myocardium (Left Ventricle, Right Ventricle, Left Atrium, Right Atrium, apex)
- Ascending Aorta & Pulmonary Trunk
- **LAD** (Left Anterior Descending Artery) with diagonal branches D1 & D2
- **LCX** (Left Circumflex Artery) with obtuse marginal branches OM1
- **RCA** (Right Coronary Artery) with acute marginal branches & PDA

## How to Drop In a Real Anatomical GLB/GLTF Model

To replace the procedural model with a real medical GLTF/GLB scan:

1. Place your model file at:
   ```
   public/models/heart.glb
   ```

2. **Mesh Node Naming Convention**:
   The `GLTFHeart` component (`src/components/HeartViewer/GLTFHeart.tsx`) automatically inspects mesh node names and binds dynamic risk materials to:
   - **LAD**: Any mesh named `LAD`, `lad`, `left_anterior`, or `anterior_descending`
   - **LCX**: Any mesh named `LCX`, `lcx`, `circumflex`, or `left_circumflex`
   - **RCA**: Any mesh named `RCA`, `rca`, or `right_coronary`
   - **Myocardium**: Meshes containing `heart`, `myocardium`, `ventricle`, or `muscle` (their opacity will respond to the transparency slider)

3. Recommended Open-Access Sources:
   - **NIH 3D Print Exchange**: Heart and coronary vasculature models (Creative Commons / Public Domain)
   - **BodyParts3D / Anatomography**: Human coronary artery tree anatomy
   - **Sketchfab (CC-BY)**: Anatomical coronary tree models (ensure permissible commercial/research license)
