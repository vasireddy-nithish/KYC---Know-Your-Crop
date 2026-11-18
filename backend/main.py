
import joblib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# 1. Create ONE FastAPI application
app = FastAPI(
    title="Crop Recommendation API",
    description="Backend for Crop Recommendation System",
    version="1.0.0"
)


# 2. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 3. Load the trained model
artifact = joblib.load("crop_recommendation_model.joblib")

model = artifact["model"]
feature_names = artifact["feature_names"]

print("Model loaded successfully!")
print("Model:", artifact["model_name"])
print("Features:", feature_names)


# 4. Define input structure
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


# 5. Home route
@app.get("/")
def home():
    return {"message": "Welcome to Crop Recommendation API"}


# 6. Health check
@app.get("/health")
def health():
    return {"status": "healthy"}


# 7. Prediction endpoint

@app.post("/predict")
def predict_crop(data: CropInput):

    input_values = [[
        data.N,
        data.P,
        data.K,
        data.temperature,
        data.humidity,
        data.ph,
        data.rainfall
    ]]

    # Get predicted crop
    prediction = model.predict(input_values)[0]

    # Get probabilities for all crops
    probabilities = model.predict_proba(input_values)[0]

    # Match probabilities with crop names
    crop_probabilities = [
        {
            "crop": str(crop),
            "probability": round(float(probability) * 100, 2)
        }
        for crop, probability in zip(model.classes_, probabilities)
    ]

    # Sort from highest to lowest probability
    crop_probabilities.sort(
        key=lambda x: x["probability"],
        reverse=True
    )

    # Return top 3 predictions
    top_predictions = crop_probabilities[:3]

    return {
        "recommended_crop": str(prediction),
        "prediction_probability": top_predictions[0]["probability"],
        "top_predictions": top_predictions
    }
