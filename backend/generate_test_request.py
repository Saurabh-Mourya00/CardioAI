
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

# Create a synthetic test request with every required field.
# This is for software testing only, not clinical interpretation.
payload = {name: 0 for name in FEATURE_NAMES}

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