================================================================================
SOLAR PREDICT - PHOTOVOLTAIC ENERGY FORECASTING DASHBOARD & API
================================================================================

1. PROJECT OVERVIEW
-------------------
Solar Predict is an end-to-end Machine Learning web application and telemetry 
monitoring dashboard designed to predict real-time photovoltaic power generation (in kW) 
based on atmospheric, solar radiation, and meteorological parameters.

Key Features:
- Real-time ML Inference: Powered by a trained Scikit-learn pipeline regressor.
- Interactive Web Dashboard: Modern cyber-dark UI with live SVG radial gauges, 
  dynamic 24-hour generation curves, interactive sliders, and KPI meters.
- 7-Day Weather & Yield Projections: Estimated weekly yield curves with peak tracking.
- Historical Sensor Telemetry: Searchable data table with instant CSV/JSON export.
- FastAPI REST Engine: High-performance asynchronous API with automatic Swagger 
  documentation and CORS support.


2. PROJECT DIRECTORY STRUCTURE
------------------------------
Solar_Project/
│
├── backend/
│   ├── app.py                 # FastAPI backend, ML prediction endpoint, static host
│   └── __pycache__/
│
├── dataset/
│   └── Solar Power Plant Data.csv  # Historical meteorological & generation telemetry
│
├── frontend/
│   ├── index.html             # Solar Predict dashboard layout
│   ├── style.css              # Cyber-forensic dark glassmorphism styling
│   └── app.js                 # Dashboard controllers, SVG renderers, API fetch
│
├── model/
│   └── model.pkl              # Serialized ML Pipeline (ColumnTransformer + Regressor)
│
├── notebook/                  # Exploratory Data Analysis & experiments
├── .venv/                     # Python virtual environment (if created)
├── index.html                 # Root redirector to frontend/index.html
├── train.py                   # Model training and evaluation script
├── requirements.txt           # Python dependency specifications
└── readme.txt                 # Project documentation (this file)


3. PREREQUISITES & INSTALLATION
-------------------------------
Python 3.10+ is recommended.

Step 1: Open a terminal in the project directory:
   cd d:\Git\Solar_Project

Step 2: (Optional if not already present) Create a Python virtual environment:
   python -m venv .venv

Step 3: Activate the virtual environment:
   - On Windows (PowerShell):
       .\.venv\Scripts\Activate.ps1
   - On Windows (Command Prompt):
       .\.venv\Scripts\activate.bat
   - On Linux/macOS:
       source .venv/bin/activate

Step 4: Install the required dependencies:
   pip install -r requirements.txt


4. RUNNING THE APPLICATION
--------------------------
You can start the complete application (Backend API + Interactive Frontend) 
using any of the following methods:

METHOD A (Recommended - FastAPI + Web Dashboard):
   From the project root (d:\Git\Solar_Project):
   python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload

   Or directly run:
   python backend/app.py

   Once started, open your web browser and navigate to:
   - Dashboard UI:        http://127.0.0.1:8000/
   - Interactive Docs:    http://127.0.0.1:8000/docs
   - Alternative Docs:    http://127.0.0.1:8000/redoc
   - API Health Check:    http://127.0.0.1:8000/api/health

METHOD B (Standalone Frontend):
   You can also double-click or open `frontend/index.html` directly in any 
   modern web browser. It will automatically connect to the local backend API 
   at http://127.0.0.1:8000/api/predict, with built-in client-side estimation 
   fallback if the backend is temporarily offline.


5. API SPECIFICATIONS
---------------------
1. GET /
   Serves the interactive frontend web dashboard.

2. GET /api/health
   Returns the API status and confirms that the ML model is loaded.
   Response:
   {
       "status": "online",
       "model_loaded": true,
       "message": "Solar Power Prediction API is running"
   }

3. POST /api/predict (and /predict)
   Calculates predicted solar generation in kilowatts (kW).
   
   Request Headers:
       Content-Type: application/json
   
   Request Body JSON:
   {
       "WindSpeed": 7.4,
       "Sunshine": 9.1,
       "AirPressure": 1014.0,
       "Radiation": 845.0,
       "AirTemperature": 28.6,
       "RelativeAirHumidity": 62.0,
       "DateHour": "2026-10-22T13:00:00"   (Optional; defaults to current time)
   }

   Response JSON:
   {
       "predicted_power": 1845.72
   }


6. MODEL TRAINING & RETRAINING
------------------------------
If you want to retrain the model on updated dataset records:
1. Ensure `dataset/Solar Power Plant Data.csv` is present.
2. Run the training script:
   python train.py
3. The script will perform data cleaning, feature engineering 
   (Hour, Month, Day, Week, Day/Night categorization, Radiation Normalization, 
   Cumulative Radiation), fit the pipeline, evaluate R2 and MAE scores, 
   and export the trained model to `model/model.pkl`.


7. TROUBLESHOOTING
------------------
- "Failed to fetch / Connection refused":
  Ensure the FastAPI server is running (`python -m uvicorn backend.app:app --port 8000`).
- "Address already in use (port 8000)":
  Run on a different port, e.g.:
  python -m uvicorn backend.app:app --host 127.0.0.1 --port 8080
- "ModuleNotFoundError":
  Verify you have activated `.venv` and installed requirements:
  pip install -r requirements.txt
================================================================================

