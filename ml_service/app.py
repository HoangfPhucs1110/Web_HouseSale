# ml_service/app.py
import os
import tempfile
import urllib.request
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib

app = FastAPI(title="House Price RF Predictor")

# ========= Config qua ENV =========
MODEL_URL = os.getenv("MODEL_URL", "").strip()
MODEL_PATH = os.getenv("MODEL_PATH", "/tmp/house_price_rf.joblib")

# ========= Tải model nếu chưa có =========
def download_model_if_needed():
    if os.path.exists(MODEL_PATH):
        return
    if not MODEL_URL:
        raise RuntimeError("MODEL_URL is not set.")
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    fd, tmp = tempfile.mkstemp(suffix=".joblib")
    os.close(fd)
    try:
        urllib.request.urlretrieve(MODEL_URL, tmp)
        os.replace(tmp, MODEL_PATH)
    except Exception as e:
        raise RuntimeError(f"Failed to download model from MODEL_URL: {e}")

_model = None
def get_model():
    global _model
    if _model is None:
        download_model_if_needed()
        _model = joblib.load(MODEL_PATH)
    return _model

class PredictRequest(BaseModel):
    data: Dict[str, Any] | None = None
    features: Dict[str, Any] | None = None

def to_vector(payload: Dict[str, Any]):
    order = [
        "bedrooms","bathrooms","sqft_living","sqft_lot","floors","waterfront","view",
        "condition","grade","sqft_above","sqft_basement","yr_built","yr_renovated",
        "zipcode","lat","long","sqft_living15","sqft_lot15"
    ]
    try:
        return [float(payload[k]) for k in order]
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing feature: {e.args[0]}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid feature value: {e}")

@app.get("/")
def root():
    return {"ok": True}

@app.post("/predict")
def predict(req: PredictRequest):
    feats = req.features or (req.data or {})
    if not feats:
        raise HTTPException(status_code=400, detail="Missing 'features' (or 'data')")
    X = [to_vector(feats)]
    model = get_model()
    try:
        y = model.predict(X)[0]
        return {"predicted_price": float(y)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")
