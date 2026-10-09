<div align="center">

# 🫀 CardioAI

**Cardiovascular Risk Prediction & 3D Coronary Visualization Platform**

*An interactive clinical decision-support prototype that predicts coronary artery disease (CAD) and vessel-specific stenosis risk across LAD, LCX, and RCA arteries — with real-time 3D heart visualization and SHAP-based model explainability.*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.143-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?logo=three.js&logoColor=white)](https://threejs.org)
[![License: Educational](https://img.shields.io/badge/License-Educational_Use-orange)](#disclaimer)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture & Data Pipeline](#architecture--data-pipeline)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Contract](#api-contract)
- [Data Pipeline Flow](#data-pipeline-flow)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Extending the System](#extending-the-system)
- [Technical Considerations](#technical-considerations)
- [Disclaimer](#disclaimer)

---

## Overview

CardioAI is a full-stack clinical decision-support prototype built for the cardiovascular domain. It accepts **54 clinical input features** (demographics, vitals, ECG, laboratory, echocardiography) from the [Z-Alizadeh Sani dataset](https://archive.ics.uci.edu/ml/datasets/Z-Alizadeh+Sani) and produces:

| Output | Description |
|---|---|
| **CAD Prediction** | Overall coronary artery disease probability |
| **LAD Stenosis** | Left Anterior Descending artery risk (the "widow maker") |
| **LCX Stenosis** | Left Circumflex artery risk (lateral/posterior wall) |
| **RCA Stenosis** | Right Coronary Artery risk (inferior wall) |
| **3D Heart Visualization** | Interactive WebGL heart model with risk-colored vessels |
| **SHAP Explanations** | Feature importance breakdown for model interpretability |

### Key Features

- 🔬 **4 Independent ML Models** — Separate scikit-learn/XGBoost pipelines for CAD, LAD, LCX, and RCA prediction
- 🫀 **Real-Time 3D Heart** — Procedurally generated anatomical heart with WebGL (no GPU required)
- 🎨 **Risk-Colored Vessels** — Coronary arteries dynamically colored by predicted stenosis probability
- 📊 **SHAP Explainability** — Feature importance waterfall chart for clinical transparency
- 🔄 **Mock & Live Mode** — Develop frontend independently or connect to the live FastAPI backend
- 📱 **Responsive Layout** — Adapts from desktop workstation to mobile with collapsible panels

---

## Architecture & Data Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CardioAI Architecture                            │
│                                                                             │
│  ┌─────────────────────────┐          ┌──────────────────────────────────┐  │
│  │   Frontend (React)       │          │   Backend (FastAPI)              │  │
│  │                          │          │                                  │  │
│  │  ┌──────────────────┐   │  HTTP    │  ┌────────────────────────────┐  │  │
│  │  │ Patient Form     │   │  POST    │  │ POST /predict              │  │  │
│  │  │ (54 Features)    │───┼─────────>│  │                            │  │  │
│  │  └──────────────────┘   │ /predict │  │  ┌─────────┐ ┌─────────┐  │  │  │
│  │                          │          │  │  │LAD Model│ │LCX Model│  │  │  │
│  │  ┌──────────────────┐   │  JSON    │  │  │(sklearn)│ │(XGBoost)│  │  │  │
│  │  │ predictionApi.ts │<──┼─────────<│  │  └─────────┘ └─────────┘  │  │  │
│  │  │ (Adapter Layer)  │   │ Response │  │  ┌─────────┐ ┌─────────┐  │  │  │
│  │  └──────┬───────────┘   │          │  │  │RCA Model│ │CAD Model│  │  │  │
│  │         │                │          │  │  │(sklearn)│ │(sklearn)│  │  │  │
│  │         ▼                │          │  │  └─────────┘ └─────────┘  │  │  │
│  │  ┌──────────────────┐   │          │  └────────────────────────────┘  │  │
│  │  │ usePrediction()  │   │          │                                  │  │
│  │  │ (React Hook)     │   │          │  ┌────────────────────────────┐  │  │
│  │  └──┬───────────┬───┘   │          │  │ GET /health               │  │  │
│  │     │           │        │          │  │ GET /features             │  │  │
│  │     ▼           ▼        │          │  └────────────────────────────┘  │  │
│  │ ┌────────┐ ┌────────┐   │          └──────────────────────────────────┘  │
│  │ │3D Heart│ │Risk    │   │                                                │
│  │ │Canvas  │ │Cards + │   │                                                │
│  │ │(WebGL) │ │SHAP    │   │                                                │
│  │ └────────┘ └────────┘   │                                                │
│  └─────────────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### End-to-End Data Flow

```
Patient Form (54 clinical features)
  → transformPayloadForBackend()        // Frontend: encode PatientData to JSON
    → POST /predict (FastAPI)           // Network: HTTP request
      → sklearn/XGBoost .predict()      // Backend: ML inference on 4 models
        → { success, predictions }      // Backend: wrapped response
          → adaptBackendResponse()      // Frontend: transform to flat format
            → PredictionResponse        // Frontend: { cad, lad, lcx, rca }
              → HeartCanvas             // 3D vessel colors update
              → CadRiskCard             // Overall CAD probability
              → VesselRiskCard × 3      // LAD, LCX, RCA probabilities
              → ExplanationView         // SHAP waterfall chart
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI component framework |
| **TypeScript 7** | Type-safe development |
| **Vite 8** | Build tool & dev server |
| **Three.js r186** | 3D WebGL rendering |
| **@react-three/fiber** | React renderer for Three.js |
| **@react-three/drei** | Three.js helper components |
| **TailwindCSS 4** | Utility-first CSS framework |
| **Recharts** | Data visualization charts |
| **Lucide React** | Icon library |
| **Motion** | Animations & transitions |

### Backend

| Technology | Purpose |
|---|---|
| **Python 3.10+** | Runtime |
| **FastAPI 0.143** | REST API framework |
| **Uvicorn** | ASGI server |
| **scikit-learn 1.6** | ML pipelines (LAD, RCA, CAD) |
| **XGBoost 3.4** | ML model (LCX) |
| **Pandas / NumPy** | Data manipulation |
| **Joblib** | Model serialization |

---

## Quick Start

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm` (or `bun`)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/cardioai.git
cd cardioai
```

### 2. Start the Backend (FastAPI)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at **http://localhost:8000**. Visit http://localhost:8000/docs for the interactive Swagger documentation.

### 3. Start the Frontend (React + Vite)

```bash
# Open a new terminal — navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:3000**.

### 4. Connect Frontend to Backend

By default, the frontend runs in **Mock Mode** (no backend required). To switch to **Live Mode**:

**Option A — Via UI:**
1. Click the ⚙️ gear icon in the header
2. Switch from "Mock Mode" to "Live FastAPI"
3. Verify the Ping button shows "Connected"
4. Click "Save Settings"

**Option B — Via Environment Variables:**
```bash
# In frontend/.env, change:
VITE_USE_MOCK_API=false
```

Then restart the frontend dev server.

### 5. Run a Prediction

1. Select a patient preset (e.g., **"67M High CAD"**) from the left sidebar
2. Click **"Run Prediction"** (▶ button)
3. Observe:
   - 3D heart vessels change color based on predicted risk
   - Right panel shows CAD, LAD, LCX, RCA probability cards
   - SHAP explanation panel shows feature contributions

---

## API Contract

### `GET /health`

Returns backend health status and loaded model information.

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": {
    "LAD": true,
    "LCX": true,
    "RCA": true,
    "CAD": true
  },
  "expected_input_features": 54
}
```

### `GET /features`

Returns the exact feature names the ML models expect.

**Response:**
```json
{
  "features": ["Age", "Weight", "Length", "Sex", "BMI", "DM", "HTN", ...],
  "count": 54
}
```

### `POST /predict`

Accepts 54 clinical features and returns predictions for all 4 models.

**Request Body:**
```json
{
  "Age": 67,
  "Weight": 84,
  "Length": 172,
  "Sex": "Male",
  "BMI": 28.4,
  "DM": 1,
  "HTN": 1,
  "Current Smoker": 1,
  "EX-Smoker": 0,
  "FH": 1,
  "Obesity": "N",
  "CRF": "N",
  "CVA": "N",
  "Airway disease": "N",
  "Thyroid Disease": "N",
  "CHF": "N",
  "DLP": "Y",
  "BP": 155,
  "PR": 82,
  "Edema": 0,
  "Weak Peripheral Pulse": "Y",
  "Lung rales": "N",
  "Systolic Murmur": "N",
  "Diastolic Murmur": "N",
  "Typical Chest Pain": 1,
  "Dyspnea": "Y",
  "Function Class": 2,
  "Atypical": "N",
  "Nonanginal": "N",
  "LowTH Ang": "Y",
  "Q Wave": 0,
  "St Elevation": 0,
  "St Depression": 1,
  "Tinversion": 1,
  "LVH": "Y",
  "Poor R Progression": "Y",
  "BBB": "N",
  "FBS": 168,
  "CR": 1.3,
  "TG": 245,
  "LDL": 168,
  "HDL": 34,
  "BUN": 24,
  "ESR": 28,
  "HB": 13.8,
  "K": 4.2,
  "Na": 139,
  "WBC": 8900,
  "Lymph": 24,
  "Neut": 72,
  "PLT": 248,
  "EF-TTE": 42,
  "Region RWMA": 2,
  "VHD": "mild"
}
```

**Response:**
```json
{
  "success": true,
  "predictions": {
    "LAD": {
      "prediction": 1,
      "label": "Stenotic",
      "probability": 0.8234,
      "positive_class_probability": 0.8234
    },
    "LCX": {
      "prediction": 0,
      "label": "Normal",
      "probability": 0.3145,
      "positive_class_probability": 0.3145
    },
    "RCA": {
      "prediction": 1,
      "label": "Stenotic",
      "probability": 0.7412,
      "positive_class_probability": 0.7412
    },
    "CAD": {
      "prediction": 1,
      "label": "CAD",
      "probability": 0.8921,
      "positive_class_probability": 0.8921
    }
  },
  "disclaimer": "Educational decision-support prototype only. This output is not a diagnosis and must not replace clinical assessment or formal diagnostic imaging."
}
```

> **Note:** The frontend includes a response adapter layer (`adaptBackendResponse()`) that automatically transforms this backend format into the flat `{ cad, lad, lcx, rca }` shape the UI components expect.

**Error Response (422 — Missing Features):**
```json
{
  "detail": {
    "message": "Required input features are missing.",
    "missing_features": ["Age", "Sex"]
  }
}
```

---

## Data Pipeline Flow

### 1. Clinical Input (54 Features)

Features are organized into 5 clinical categories:

| Category | Features | Examples |
|---|---|---|
| **Demographics & Vitals** | 7 | Age, Sex, Weight, Height, BMI, BP, Pulse Rate |
| **History & Comorbidities** | 11 | DM, HTN, Smoking, Family History, Obesity, CRF, DLP |
| **Symptoms & Exam** | 10 | Typical Chest Pain, Dyspnea, Edema, Lung Rales, Murmurs |
| **ECG Findings** | 7 | Q Wave, ST Elevation/Depression, T-Inversion, LVH, BBB |
| **Laboratory & Echo** | 19 | FBS, Creatinine, Lipids, CBC, EF-TTE, RWMA, VHD |

### 2. Model Inference

Each model is an independent sklearn pipeline with a fitted `ColumnTransformer` preprocessor:

| Model | Type | Target | Output |
|---|---|---|---|
| `lad_pipeline.joblib` | scikit-learn Pipeline | LAD stenosis | Normal / Stenotic |
| `lcx_preprocessor.joblib` + `lcx_xgboost.json` | XGBoost + Preprocessor | LCX stenosis | Normal / Stenotic |
| `rca_pipeline.joblib` | scikit-learn Pipeline | RCA stenosis | Normal / Stenotic |
| `cad_pipeline.joblib` | scikit-learn Pipeline | Overall CAD | Normal / CAD |

### 3. Frontend Adapter Layer

The frontend's `predictionApi.ts` contains an adapter that bridges the backend ↔ frontend contract:

```
Backend Response                    Frontend PredictionResponse
─────────────────                   ──────────────────────────
{                                   {
  success: true,          ──►         cad: { label, probability },
  predictions: {                      lad: { label, probability },
    CAD: { ... },                     lcx: { label, probability },
    LAD: { ... },                     rca: { label, probability }
    LCX: { ... },                   }
    RCA: { ... }
  }
}
```

### 4. 3D Visualization Mapping

Risk probabilities are mapped to vessel colors in the 3D heart:

| Probability Range | Risk Category | Vessel Color |
|---|---|---|
| 0.00 – 0.29 | Low Risk | 🟢 Teal `#1f8a65` |
| 0.30 – 0.59 | Moderate Risk | 🟡 Amber `#c08532` |
| 0.60 – 0.79 | High Risk | 🟠 Red-Orange `#f54e00` |
| 0.80 – 1.00 | Very High Risk | 🔴 Crimson `#cf2d56` |

---

## Configuration

### Environment Variables

Create a `frontend/.env` file (a template exists at `frontend/.env.example`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI backend URL |
| `VITE_USE_MOCK_API` | `true` | `"true"` = mock mode (no backend needed), `"false"` = live FastAPI |

### Runtime API Settings

The frontend provides an in-app **API Settings Modal** (⚙️ icon in header) that allows switching between Mock and Live modes at runtime. These settings are persisted in `localStorage`.

---

## Project Structure

```
CARDIOAI/
├── README.md                          # This file
│
├── backend/                           # FastAPI ML Prediction Server
│   ├── main.py                        # API endpoints (/predict, /health, /features)
│   ├── requirements.txt               # Python dependencies
│   ├── models/                        # Trained ML model artifacts
│   │   ├── lad_pipeline.joblib        # LAD stenosis (sklearn pipeline)
│   │   ├── lcx_pipeline.joblib        # LCX stenosis (legacy, unused)
│   │   ├── lcx_export/               # LCX stenosis (XGBoost + preprocessor)
│   │   │   ├── lcx_preprocessor.joblib
│   │   │   └── lcx_xgboost.json
│   │   ├── rca_pipeline.joblib        # RCA stenosis (sklearn pipeline)
│   │   └── cad_pipeline.joblib        # Overall CAD (sklearn pipeline)
│   ├── generate_test_request.py       # Generate test payload from model features
│   ├── test_lcx.py                    # Standalone LCX model verification
│   └── test_request.json              # Sample 54-feature test payload
│
├── frontend/                          # React + Three.js Dashboard
│   ├── package.json                   # Node.js dependencies & scripts
│   ├── vite.config.ts                 # Vite build configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── index.html                     # HTML entry point
│   ├── .env                           # Environment variables (VITE_API_BASE_URL, etc.)
│   ├── .env.example                   # Environment template
│   └── src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Root component → Dashboard
│       ├── index.css                  # Global styles
│       │
│       ├── api/
│       │   └── predictionApi.ts       # API client with adapter layer
│       │
│       ├── hooks/
│       │   └── usePrediction.ts       # Core prediction state hook
│       │
│       ├── types/
│       │   ├── patient.ts             # PatientData interface (54 features)
│       │   └── prediction.ts          # PredictionResponse, VesselInfo, risk utils
│       │
│       ├── data/
│       │   ├── featureSchema.ts       # 54-feature metadata & validation rules
│       │   └── mockData.ts            # 3 patient presets with mock predictions
│       │
│       ├── pages/
│       │   └── Dashboard.tsx          # Main 3-column dashboard layout
│       │
│       └── components/
│           ├── Header/
│           │   ├── Header.tsx         # App header with settings button
│           │   └── ApiSettingsModal.tsx # Mock/Live mode switcher
│           ├── Disclaimer/
│           │   └── MedicalDisclaimer.tsx # Clinical use disclaimer banner
│           ├── PatientForm/
│           │   ├── PatientForm.tsx     # 54-feature clinical input form
│           │   └── PresetSelector.tsx  # Patient preset dropdown
│           ├── HeartViewer/
│           │   ├── HeartCanvas.tsx     # Three.js canvas wrapper
│           │   ├── ProceduralHeart.tsx # Procedural anatomical heart geometry
│           │   ├── GLTFHeart.tsx       # Optional GLTF model loader
│           │   ├── VesselMesh.tsx      # Coronary artery tube meshes
│           │   ├── VesselCurves.ts     # Bezier curves for LAD, LCX, RCA paths
│           │   ├── VesselSpriteLabel.tsx # Floating vessel labels in 3D
│           │   └── ViewerControls.tsx  # Camera presets & display controls
│           ├── PredictionCard/
│           │   ├── CadRiskCard.tsx     # Overall CAD risk display
│           │   └── VesselRiskCard.tsx  # Individual vessel risk display
│           ├── Vessel/
│           │   └── VesselDetailCard.tsx # Vessel anatomy & clinical info
│           └── ExplanationPanel/
│               └── ExplanationView.tsx # SHAP feature importance chart
```

---

## Extending the System

### Adding a New Prediction Model

1. **Train the model** using the same 54-feature schema and save it with `joblib`:
   ```python
   import joblib
   joblib.dump(your_pipeline, 'backend/models/your_model_pipeline.joblib')
   ```

2. **Load it in `backend/main.py`**:
   ```python
   your_model = joblib.load(MODEL_DIR / "your_model_pipeline.joblib")
   ```

3. **Add to the `/predict` endpoint's results dict**:
   ```python
   results["YOUR_TARGET"] = result_for_pipeline(
       your_model, input_df, "Positive", "Normal"
   )
   ```

4. **Update the frontend types** in `frontend/src/types/prediction.ts` to include the new key.

5. **Update `adaptBackendResponse()`** in `predictionApi.ts` to map the new key.

### Adding a New Clinical Feature

1. **Add the feature** to `frontend/src/types/patient.ts` (`PatientData` interface)
2. **Add metadata** to `frontend/src/data/featureSchema.ts` (label, type, range, unit)
3. **Add to mock presets** in `frontend/src/data/mockData.ts`
4. **Retrain models** with the expanded feature set and redeploy `.joblib` files

### Adding a New Anatomical Structure

1. **Define the Bezier curves** in `frontend/src/components/HeartViewer/VesselCurves.ts`
2. **Add a `<VesselMesh>`** in `ProceduralHeart.tsx` with the new curve
3. **Add to `VesselKey` type** and `VESSEL_DETAILS` in `prediction.ts`
4. **Train a model** for the new structure and add to the backend

---

## Technical Considerations

### GPU-Free 3D Rendering

The 3D heart visualization uses **WebGL through Three.js** with software-accelerated rendering. It is designed to maintain responsive interaction in modern web browsers **without requiring a dedicated GPU**:

- Procedural geometry (no heavy GLTF assets by default)
- Efficient `TubeGeometry` for coronary vessels
- `OrbitControls` with damping for smooth interaction
- `powerPreference: 'high-performance'` WebGL context hint
- Optional GLTF model support for higher-fidelity needs

### Extensible Architecture

The application is architected for **modular extension** without complete redesign:

- **Models are hot-swappable** — add new `.joblib` files and register them in `main.py`
- **Frontend types are decoupled** — the `PredictionResponse` interface can be extended
- **Adapter pattern** — `adaptBackendResponse()` isolates backend format changes from UI components
- **Component architecture** — each UI element (HeartCanvas, VesselRiskCard, ExplanationView) is independently composable
- **Hook-based state** — `usePrediction()` centralizes all prediction/explanation state management

### Model-Visualization Correspondence

The system maintains **consistent correspondence** between model outputs and displayed anatomy:

| Model Output | Visualization Element | UI Component |
|---|---|---|
| `predictions.LAD` | Anterior descending vessel tube (green/red gradient) | `VesselRiskCard` + `VesselMesh` |
| `predictions.LCX` | Circumflex vessel tube (lateral course) | `VesselRiskCard` + `VesselMesh` |
| `predictions.RCA` | Right coronary vessel tube (right AV groove) | `VesselRiskCard` + `VesselMesh` |
| `predictions.CAD` | Overall heart glow / risk badge | `CadRiskCard` |

Vessel colors are **directly computed** from `probability` values using `getRiskColorHex()`, ensuring the 3D rendering always reflects the current model output in real time.

---

## Disclaimer

> **⚠️ Educational Decision-Support Prototype Only**
>
> This application is designed for **educational and research purposes only**. It is not a medical device, not FDA-cleared, and must not be used for clinical diagnosis or treatment decisions.
>
> - Model predictions are based on statistical patterns in the Z-Alizadeh Sani dataset and do not constitute medical advice
> - The 3D visualization represents anatomical approximations, not patient-specific imaging
> - Always consult qualified healthcare professionals for clinical assessment
> - This output must not replace formal diagnostic imaging (coronary angiography, CT angiography, etc.)

---

<div align="center">

*Built with ❤️ for cardiovascular health education and clinical AI transparency*

</div>
