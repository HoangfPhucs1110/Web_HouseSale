# ml_service/app.py
import os
import requests
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------- CORS ----------
allow = os.getenv("ALLOW_ORIGINS", "*").strip()
origins = ["*"] if allow == "*" else [o.strip() for o in allow.split(",") if o.strip()]

app = FastAPI(title="House Price Predictor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Model loader ----------
MODEL_PATH = os.getenv("MODEL_PATH", "house_price_rf.joblib")
MODEL_URL = os.getenv("MODEL_URL")  # BẮT BUỘC khi không bundle file model

def ensure_model():
    if os.path.exists(MODEL_PATH):
        return
    if not MODEL_URL:
        raise RuntimeError("MODEL_URL chưa được cấu hình và MODEL_PATH không tồn tại.")
    # Tải model theo stream để tiết kiệm RAM
    with requests.get(MODEL_URL, stream=True, timeout=300) as r:
        r.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=1 << 20):
                if chunk:
                    f.write(chunk)

ensure_model()
model = joblib.load(MODEL_PATH)

# ---------- Schemas ----------
class HouseFeatures(BaseModel):
    bedrooms: float
    bathrooms: float
    sqft_living: float
    sqft_lot: float
    floors: float
    waterfront: float
    view: float
    condition: float
    grade: float
    sqft_above: float
    sqft_basement: float
    yr_built: float
    yr_renovated: float
    zipcode: float
    lat: float
    long: float
    sqft_living15: float
    sqft_lot15: float

class PredictIn(BaseModel):
    features: HouseFeatures

class PredictOut(BaseModel):
    predicted_price: float

@app.get("/schema")
def schema():
    return {"features": list(HouseFeatures.model_fields.keys())}

@app.post("/predict", response_model=PredictOut)
def predict(req: PredictIn):
    x = req.features
    ordered = [
        x.bedrooms, x.bathrooms, x.sqft_living, x.sqft_lot, x.floors,
        x.waterfront, x.view, x.condition, x.grade, x.sqft_above,
        x.sqft_basement, x.yr_built, x.yr_renovated, x.zipcode,
        x.lat, x.long, x.sqft_living15, x.sqft_lot15
    ]
    y = model.predict([ordered])[0]
    return {"predicted_price": float(y)}
