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
    # Check that every required input feature is supplied.
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

    try:
        # Keep only the original training features, in training order.
        # Target columns such as LAD, LCX, RCA and Cath are not inputs.
        input_df = pd.DataFrame(
            [{name: payload[name] for name in FEATURE_NAMES}],
            columns=FEATURE_NAMES,
        )

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