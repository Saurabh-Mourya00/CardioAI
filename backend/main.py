# from fastapi import FastAPI
# import joblib
# from pathlib import Path


# app = FastAPI(
#     title="Cardiovascular Risk Prediction API",
#     description="Backend API for CAD and coronary artery stenosis prediction",
#     version="1.0.0"
# )


# # --------------------------------------------------
# # MODEL PATH
# # --------------------------------------------------

# BASE_DIR = Path(__file__).resolve().parent
# MODEL_DIR = BASE_DIR / "models"


# # --------------------------------------------------
# # LOAD MODELS
# # --------------------------------------------------

# lad_model = joblib.load(MODEL_DIR / "lad_pipeline.joblib")
# lcx_model = joblib.load(MODEL_DIR / "lcx_pipeline.joblib")
# rca_model = joblib.load(MODEL_DIR / "rca_pipeline.joblib")
# cad_model = joblib.load(MODEL_DIR / "cad_pipeline.joblib")


# print("All ML models loaded successfully.")


# # --------------------------------------------------
# # ROUTES
# # --------------------------------------------------

# @app.get("/")
# def root():
#     return {
#         "message": "Cardiovascular Risk Prediction API is running"
#     }


# @app.get("/health")
# def health():
#     return {
#         "status": "ok",
#         "models": {
#             "lad": True,
#             "lcx": True,
#             "rca": True,
#             "cad": True
#         }
#     }

from pathlib import Path

import joblib
import pandas as pd
import xgboost as xgb

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Any


# --------------------------------------------------
# 1. Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
LCX_EXPORT_DIR = MODEL_DIR / "lcx_export"


# --------------------------------------------------
# 2. FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Cardiovascular Risk Prediction API",
    description=(
        "Predicts LAD, LCX, RCA stenosis and overall CAD "
        "from clinical features. Educational use only."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# 3. Load the trained models
# --------------------------------------------------

lad_model = joblib.load(MODEL_DIR / "lad_pipeline.joblib")

# LCX: load the fitted preprocessor and portable XGBoost model
lcx_preprocessor = joblib.load(
    LCX_EXPORT_DIR / "lcx_preprocessor.joblib"
)

lcx_model = xgb.XGBClassifier()
lcx_model.load_model(
    str(LCX_EXPORT_DIR / "lcx_xgboost.json")
)

rca_model = joblib.load(MODEL_DIR / "rca_pipeline.joblib")
cad_model = joblib.load(MODEL_DIR / "cad_pipeline.joblib")


# Get the expected input columns from the fitted LAD pipeline.
# These must be the original 54 training features.
FEATURE_NAMES = list(
    lad_model.named_steps["preprocessor"].feature_names_in_
)


# --------------------------------------------------
# 4. Helper functions
# --------------------------------------------------

def positive_class_probability(model, input_df):
    """Return the probability of class 1."""
    probabilities = model.predict_proba(input_df)[0]
    classes = list(model.classes_)

    if 1 not in classes:
        raise RuntimeError("Model does not contain positive class 1.")

    return float(probabilities[classes.index(1)])


def result_for_pipeline(model, input_df, positive_label, negative_label):
    """Predict using a complete sklearn pipeline."""
    prediction = int(model.predict(input_df)[0])
    probability = positive_class_probability(model, input_df)

    return {
        "prediction": prediction,
        "label": positive_label if prediction == 1 else negative_label,
        "probability": round(probability, 4),
        "positive_class_probability": round(probability, 4),
    }


def result_for_lcx(input_df):
    """Predict LCX using its separate preprocessor and XGBoost model."""
    transformed = lcx_preprocessor.transform(input_df)

    prediction = int(lcx_model.predict(transformed)[0])
    probability = positive_class_probability(lcx_model, transformed)

    return {
        "prediction": prediction,
        "label": "Stenotic" if prediction == 1 else "Normal",
        "probability": round(probability, 4),
        "positive_class_probability": round(probability, 4),
    }


TARGET_MODELS = {
    "CAD": cad_model,
    "LAD": lad_model,
    "RCA": rca_model,
}

REFERENCE_PATIENT = {
    "Age": 38,
    "Weight": 74,
    "Length": 178,
    "Sex": "Male",
    "BMI": 23.4,
    "DM": 0,
    "HTN": 0,
    "Current Smoker": 0,
    "EX-Smoker": 0,
    "FH": 0,
    "Obesity": "N",
    "CRF": "N",
    "CVA": "N",
    "Airway disease": "N",
    "Thyroid Disease": "N",
    "CHF": "N",
    "DLP": "N",
    "BP": 118,
    "PR": 62,
    "Edema": 0,
    "Weak Peripheral Pulse": "N",
    "Lung rales": "N",
    "Systolic Murmur": "N",
    "Diastolic Murmur": "N",
    "Typical Chest Pain": 0,
    "Dyspnea": "N",
    "Function Class": 0,
    "Atypical": "N",
    "Nonanginal": "Y",
    "LowTH Ang": "N",
    "Q Wave": 0,
    "St Elevation": 0,
    "St Depression": 0,
    "Tinversion": 0,
    "LVH": "N",
    "Poor R Progression": "N",
    "BBB": "N",
    "FBS": 88,
    "CR": 0.9,
    "TG": 95,
    "LDL": 82,
    "HDL": 58,
    "BUN": 13,
    "ESR": 4,
    "HB": 15.2,
    "K": 4.3,
    "Na": 142,
    "WBC": 5600,
    "Lymph": 34,
    "Neut": 58,
    "PLT": 220,
    "EF-TTE": 65,
    "Region RWMA": 0,
    "VHD": "N",
}


def input_df_from_payload(payload: dict[str, Any]):
    """Build a one-row DataFrame in the model training column order."""
    return pd.DataFrame(
        [{name: payload[name] for name in FEATURE_NAMES}],
        columns=FEATURE_NAMES,
    )


def probability_for_target(target: str, input_df):
    """Return positive-class probability for CAD/LAD/LCX/RCA."""
    if target == "LCX":
        transformed = lcx_preprocessor.transform(input_df)
        return positive_class_probability(lcx_model, transformed)

    model = TARGET_MODELS[target]
    return positive_class_probability(model, input_df)


def validate_prediction_payload(payload: dict[str, Any]):
    """Check required features and value domains for inference endpoints."""
    missing_features = [
        name for name in FEATURE_NAMES if name not in payload
    ]

    if missing_features:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Required input features are missing.",
                "missing_features": missing_features,
            },
        )

    validate_payload_values(payload)


BOOLEAN_INT_FEATURES = {
    "DM",
    "HTN",
    "Current Smoker",
    "EX-Smoker",
    "FH",
    "Edema",
    "Typical Chest Pain",
    "Q Wave",
    "St Elevation",
    "St Depression",
    "Tinversion",
}

CATEGORICAL_FEATURES = {
    "Sex": {"Male", "Female"},
    "Obesity": {"Y", "N"},
    "CRF": {"Y", "N"},
    "CVA": {"Y", "N"},
    "Airway disease": {"Y", "N"},
    "Thyroid Disease": {"Y", "N"},
    "CHF": {"Y", "N"},
    "DLP": {"Y", "N"},
    "Weak Peripheral Pulse": {"Y", "N"},
    "Lung rales": {"Y", "N"},
    "Systolic Murmur": {"Y", "N"},
    "Diastolic Murmur": {"Y", "N"},
    "Dyspnea": {"Y", "N"},
    "Atypical": {"Y", "N"},
    "Nonanginal": {"Y", "N"},
    "LowTH Ang": {"Y", "N"},
    "LVH": {"Y", "N"},
    "Poor R Progression": {"Y", "N"},
    "BBB": {"N", "LBBB", "RBBB"},
    "VHD": {"N", "mild", "Moderate", "Severe"},
}

RANGED_FEATURES = {
    "Age": (18, 100),
    "Weight": (35, 180),
    "Length": (120, 220),
    "BMI": (14, 55),
    "BP": (70, 240),
    "PR": (40, 180),
    "Function Class": (0, 3),
    "FBS": (60, 400),
    "CR": (0.4, 12.0),
    "TG": (40, 800),
    "LDL": (30, 350),
    "HDL": (15, 100),
    "BUN": (5, 120),
    "ESR": (1, 120),
    "HB": (6, 20),
    "K": (2.5, 7.0),
    "Na": (120, 160),
    "WBC": (2000, 30000),
    "Lymph": (5, 75),
    "Neut": (20, 95),
    "PLT": (50, 600),
    "EF-TTE": (15, 80),
    "Region RWMA": (0, 4),
}


def validate_payload_values(payload: dict[str, Any]):
    """Reject malformed clinical values before model inference."""
    invalid_features = []

    for name in BOOLEAN_INT_FEATURES:
        value = payload.get(name)
        if value not in (0, 1):
            invalid_features.append({
                "feature": name,
                "message": "Expected integer 0 or 1.",
            })

    for name, allowed_values in CATEGORICAL_FEATURES.items():
        value = payload.get(name)
        if value not in allowed_values:
            invalid_features.append({
                "feature": name,
                "message": f"Expected one of {sorted(allowed_values)}.",
            })

    for name, (minimum, maximum) in RANGED_FEATURES.items():
        value = payload.get(name)
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            invalid_features.append({
                "feature": name,
                "message": "Expected a numeric value.",
            })
            continue

        if value < minimum or value > maximum:
            invalid_features.append({
                "feature": name,
                "message": f"Expected value between {minimum} and {maximum}.",
            })

    if invalid_features:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Input feature values are invalid.",
                "invalid_features": invalid_features,
            },
        )


# --------------------------------------------------
# 5. Basic endpoints
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Cardiovascular Risk Prediction API is running.",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": {
            "LAD": lad_model is not None,
            "LCX": lcx_model is not None,
            "RCA": rca_model is not None,
            "CAD": cad_model is not None,
        },
        "expected_input_features": len(FEATURE_NAMES),
    }


@app.get("/features")
def features():
    """Return the exact feature names the models expect, for frontend validation."""
    return {
        "features": FEATURE_NAMES,
        "count": len(FEATURE_NAMES),
    }


# --------------------------------------------------
# 6. Prediction endpoint
# --------------------------------------------------

@app.post("/predict")
def predict(payload: dict[str, Any]):
    validate_prediction_payload(payload)

    try:
        # Keep only the original training features, in training order.
        # Target columns such as LAD, LCX, RCA and Cath are not inputs.
        input_df = input_df_from_payload(payload)

        results = {
            "LAD": result_for_pipeline(
                lad_model, input_df, "Stenotic", "Normal"
            ),
            "LCX": result_for_lcx(input_df),
            "RCA": result_for_pipeline(
                rca_model, input_df, "Stenotic", "Normal"
            ),
            "CAD": result_for_pipeline(
                cad_model, input_df, "CAD", "Normal"
            ),
        }

        return {
            "success": True,
            "predictions": results,
            "disclaimer": (
                "Educational decision-support prototype only. "
                "This output is not a diagnosis and must not replace "
                "clinical assessment or formal diagnostic imaging."
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}",
        ) from exc


@app.post("/explain")
def explain(payload: dict[str, Any]):
    target = str(payload.get("target", "CAD")).upper()

    if target not in {"CAD", "LAD", "LCX", "RCA"}:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Explanation target must be one of CAD, LAD, LCX or RCA.",
            },
        )

    feature_payload = {
        name: payload[name]
        for name in FEATURE_NAMES
        if name in payload
    }
    validate_prediction_payload(feature_payload)

    try:
        input_df = input_df_from_payload(feature_payload)
        current_probability = probability_for_target(target, input_df)

        reference_payload = {
            name: REFERENCE_PATIENT[name]
            for name in FEATURE_NAMES
        }
        reference_df = input_df_from_payload(reference_payload)
        base_value = probability_for_target(target, reference_df)

        features = []
        for name in FEATURE_NAMES:
            if feature_payload[name] == reference_payload[name]:
                continue

            counterfactual_payload = dict(reference_payload)
            counterfactual_payload[name] = feature_payload[name]
            counterfactual_df = input_df_from_payload(counterfactual_payload)
            counterfactual_probability = probability_for_target(
                target,
                counterfactual_df,
            )
            attribution = counterfactual_probability - base_value

            if abs(attribution) < 0.00005:
                continue

            features.append({
                "feature": name,
                "value": feature_payload[name],
                "shap_value": round(attribution, 4),
            })

        features.sort(
            key=lambda item: abs(item["shap_value"]),
            reverse=True,
        )

        return {
            "target": target,
            "base_value": round(base_value, 4),
            "features": features[:10],
            "method": "single-feature reference attribution",
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation failed: {str(exc)}",
        ) from exc
