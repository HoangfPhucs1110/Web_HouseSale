import os
import gc
import joblib
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from contextlib import asynccontextmanager

# ===== ENV =====
MODEL_URL = os.getenv(
    "MODEL_URL",
    "https://huggingface.co/kyrgios/house_price_rf/resolve/main/house_price_rf.joblib",
)
MODEL_PATH = os.getenv("MODEL_PATH", "/tmp/house_price_rf.joblib")
ALLOW_ORIGINS = os.getenv("ALLOW_ORIGINS", "*")

# ===== Pydantic models =====
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

# ===== Lazy model holder =====
_model = {"obj": None}

def _download_model_if_needed():
    """Tải file model về MODEL_PATH nếu chưa có."""
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    if os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 0:
        return
    with requests.get(MODEL_URL, stream=True, timeout=180) as r:
        r.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

def _load_model():
    """Lazy load model + mmap để giảm RAM."""
    if _model["obj"] is None:
        _download_model_if_needed()
        _model["obj"] = joblib.load(MODEL_PATH, mmap_mode="r")
        gc.collect()
    return _model["obj"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # KHỞI ĐỘNG: không load model ở đây để bind port nhanh
    yield
    # TẮT: giải phóng
    _model["obj"] = None
    gc.collect()

app = FastAPI(title="House Price Predictor", lifespan=lifespan)

# ===== CORS =====
allow_origins = ["*"] if ALLOW_ORIGINS == "*" else [o.strip() for o in ALLOW_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Health =====
@app.get("/health")
def health():
    return {"ok": True}

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

# ===== Predict =====
@app.post("/predict", response_model=PredictOut)
def predict(req: PredictIn):
    x = req.features
    ordered = [
        x.bedrooms, x.bathrooms, x.sqft_living, x.sqft_lot, x.floors,
        x.waterfront, x.view, x.condition, x.grade, x.sqft_above,
        x.sqft_basement, x.yr_built, x.yr_renovated, x.zipcode,
        x.lat, x.long, x.sqft_living15, x.sqft_lot15
    ]
    try:
        model = _load_model()
    except MemoryError:
        raise HTTPException(status_code=503, detail="Model quá lớn so với bộ nhớ hiện tại.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Không tải được model: {e}")

    try:
        y = model.predict([ordered])[0]
        return {"predicted_price": float(y)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi dự đoán: {e}")
