from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import Optional
from pathlib import Path
import pandas as pd
import pickle

# Resolve base directories
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model" / "model.pkl"
FRONTEND_DIR = BASE_DIR / "frontend"

# Create FastAPI app
app = FastAPI(title="Solar Predict API", description="Solar Power Generation Prediction & Forecasting API")

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the saved ML model
with open(MODEL_PATH, "rb") as file:
    model = pickle.load(file)


# Input data schema
class SolarInput(BaseModel):
    WindSpeed: float
    Sunshine: float
    AirPressure: float
    Radiation: float
    AirTemperature: float
    RelativeAirHumidity: float
    DateHour: Optional[datetime] = None

    # Computed fields
    @computed_field
    @property
    def current_dt(self) -> datetime:
        return self.DateHour if self.DateHour is not None else datetime.now()

    @computed_field
    @property
    def Hour(self) -> int:
        return self.current_dt.hour

    @computed_field
    @property
    def Month(self) -> int:
        return self.current_dt.month

    @computed_field
    @property
    def Year(self) -> int:
        return self.current_dt.year

    @computed_field
    @property
    def Day(self) -> int:
        return self.current_dt.day

    @computed_field
    @property
    def Week(self) -> int:
        return self.current_dt.isocalendar().week

    @computed_field
    @property
    def day_night(self) -> str:
        if self.Hour < 6 or self.Hour > 19:
            return "night"
        else:
            return "day"

    @computed_field
    @property
    def Radiation_Norm(self) -> float:
        return self.Radiation / 899.7

    @computed_field
    @property
    def Radiation_Cum(self) -> float:
        return self.Radiation


def run_prediction(data: SolarInput) -> dict:
    # Create input for ML model
    input_data = pd.DataFrame([{
        "WindSpeed": data.WindSpeed,
        "Sunshine": data.Sunshine,
        "AirPressure": data.AirPressure,
        "Radiation": data.Radiation,
        "AirTemperature": data.AirTemperature,
        "RelativeAirHumidity": data.RelativeAirHumidity,
        "Hour": data.Hour,
        "Month": data.Month,
        "Year": data.Year,
        "Day": data.Day,
        "Week": data.Week,
        "Day/Night": data.day_night,
        "Radiation_Norm": data.Radiation_Norm,
        "Radiation_Cum": data.Radiation_Cum
    }])

    # Make prediction
    prediction = model.predict(input_data)

    # Return prediction
    return {
        "predicted_power": float(prediction[0])
    }


# Prediction Endpoints (support both /predict and /api/predict)
@app.post("/predict")
def predict(data: SolarInput):
    return run_prediction(data)


@app.post("/api/predict")
def predict_api(data: SolarInput):
    return run_prediction(data)


# API status / health endpoint
@app.get("/api/health")
def health():
    return {
        "status": "online",
        "model_loaded": True,
        "message": "Solar Power Prediction API is running"
    }


# Static Frontend Hosting
if FRONTEND_DIR.exists():
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend_dir")
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend_root")
else:
    @app.get("/")
    def home():
        return {
            "message": "Solar Power Prediction API is running"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
