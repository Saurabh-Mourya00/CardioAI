
import joblib
import xgboost as xgb
import pandas as pd
from pathlib import Path

folder = Path("models/lcx_export")

preprocessor = joblib.load(folder / "lcx_preprocessor.joblib")

model = xgb.XGBClassifier()
model.load_model(folder / "lcx_xgboost.json")

# Use the original pipeline's feature names if available.
# This creates a test row with the correct columns, but neutral
# values here are only for testing the software—not a real patient.
feature_names = list(preprocessor.feature_names_in_)

sample = pd.DataFrame(
    [{name: 0 for name in feature_names}],
    columns=feature_names
)

transformed = preprocessor.transform(sample)
prediction = model.predict(transformed)
probabilities = model.predict_proba(transformed)

print("Prediction test passed!")
print("Predicted class:", prediction[0])
print("Class labels:", model.classes_)
print("Probabilities:", probabilities[0])