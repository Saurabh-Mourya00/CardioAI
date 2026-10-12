
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

import joblib

# Project paths
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

# Read the exact feature names from the trained LAD pipeline
lad_pipeline = joblib.load(MODEL_DIR / "lad_pipeline.joblib")
FEATURE_NAMES = list(
    lad_pipeline.named_steps["preprocessor"].feature_names_in_
)

# Create a synthetic valid request with every required field.
# This is for software testing only, not clinical interpretation.
valid_baseline_payload = {
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

missing = [name for name in FEATURE_NAMES if name not in valid_baseline_payload]
extra = [name for name in valid_baseline_payload if name not in FEATURE_NAMES]

if missing or extra:
    raise ValueError(
        f"Test payload does not match model features. "
        f"Missing: {missing}; extra: {extra}"
    )

payload = {
    name: valid_baseline_payload[name]
    for name in FEATURE_NAMES
}

# Save the request as JSON
output_file = BASE_DIR / "test_request.json"
output_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")

print(f"Feature count: {len(FEATURE_NAMES)}")
print(f"Saved test request: {output_file}")

if len(FEATURE_NAMES) != 54:
    raise ValueError(
        f"Expected 54 features, found {len(FEATURE_NAMES)}"
    )

# Send the generated JSON to FastAPI
request = Request(
    url="http://127.0.0.1:8000/predict",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urlopen(request, timeout=60) as response:
        print("\nHTTP status:", response.status)
        print("API response:")
        print(response.read().decode("utf-8"))

except HTTPError as error:
    print("\nHTTP error:", error.code)
    print(error.read().decode("utf-8"))

except Exception as error:
    print("\nRequest failed:", error)
    print("Check that Uvicorn is running at http://127.0.0.1:8000")
