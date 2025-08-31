# ml_service/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="House Price Predictor")

# CORS cho dev (FE chạy ở 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Pydantic models ===
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

# === load model ===
model = joblib.load("house_price_rf.joblib")  # đường dẫn đúng file của bạn

# (không bắt buộc) trả danh sách cột cho FE
@app.get("/schema")
def get_schema():
    return {
        "features": [
            "bedrooms","bathrooms","sqft_living","sqft_lot","floors",
            "waterfront","view","condition","grade","sqft_above","sqft_basement",
            "yr_built","yr_renovated","zipcode","lat","long","sqft_living15","sqft_lot15"
        ]
    }

# === predict ===
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
