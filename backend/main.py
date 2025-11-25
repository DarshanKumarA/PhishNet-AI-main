import warnings
warnings.filterwarnings("ignore", category=UserWarning, module='sklearn')
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np
from scipy.sparse import hstack, csr_matrix
from datetime import datetime
from pathlib import Path  # <-- NEW IMPORT
from utils import (
    analyze_url_security, 
    get_url_features, 
    preprocess_url, 
    extract_domain
)

# Initialize App
app = FastAPI(title="Malicious URL Detector API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Variables
model_data = {}
scan_history = [] # In-memory storage for dashboard

@app.on_event("startup")
def load_model():
    global model_data
    
    # --- FIX: Construct model path relative to the script location ---
    # This creates a reliable, absolute path to the .pkl file
    MODEL_PATH = Path(__file__).parent / "malicious_url_detector.pkl"
    # ------------------------------------------------------------------
    
    try:
        print(" Loading model...")
        # Use the corrected path to open the file
        with open(MODEL_PATH, "rb") as f:
            package = pickle.load(f)
            
        model_data["model"] = package['model']
        model_data["tfidf_vectorizer"] = package['tfidf_vectorizer']
        model_data["label_encoder"] = package['label_encoder']
        model_data["feature_cols"] = package['feature_cols']
        
        print(f" Model loaded! Version: {package.get('version', 'Unknown')}")
        
    except FileNotFoundError:
        print(f"Error: {MODEL_PATH} not found! Check file upload.")
    except Exception as e:
        print(f"Error loading model: {str(e)}")

# Data Models
class URLRequest(BaseModel):
    url: str

# Helper to add history
def add_to_history(entry):
    global scan_history
    # Add timestamp
    entry["timestamp"] = datetime.now().isoformat()
    scan_history.append(entry)
    # Keep last 100
    if len(scan_history) > 100:
        scan_history.pop(0)

# Endpoints
@app.get("/")
def home():
    return {"message": "API Running"}

@app.get("/history")
def get_history():
    return scan_history

@app.delete("/history")
def clear_history():
    global scan_history
    scan_history = []
    return {"message": "History cleared"}

@app.post("/predict")
def predict_url(request: URLRequest):
    url = request.url
    if not model_data:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # 1. Heuristic Check
    analysis = analyze_url_security(url)
    if analysis:
        is_safe = analysis["risk_level"] == "SAFE"
        result = {
            "url": url,
            "prediction": "benign" if is_safe else "phishing",
            "confidence": analysis["confidence"],
            "is_safe": is_safe,
            "reason": analysis["reason"],
            "method": "Heuristic Rule"
        }
        add_to_history(result)
        return result

    # 2. Machine Learning Prediction
    try:
        model = model_data["model"]
        tfidf_vectorizer = model_data["tfidf_vectorizer"]
        label_encoder = model_data["label_encoder"]
        feature_cols = model_data["feature_cols"]

        features_dict = get_url_features(url)
        manual_values = [features_dict[col] for col in feature_cols]
        manual_sparse = csr_matrix([manual_values])
        
        processed_url = preprocess_url(url)
        tfidf_sparse = tfidf_vectorizer.transform([processed_url])
        
        X_single = hstack([manual_sparse, tfidf_sparse])

        pred_encoded = model.predict(X_single)[0]
        pred_label = label_encoder.inverse_transform([pred_encoded])[0]
        probs = model.predict_proba(X_single)[0]
        confidence = float(max(probs))

        # ==================================================================
        # IMPROVED THRESHOLD LOGIC
        # Apply the 75% threshold to ALL bad labels (Phishing, Malware, Defacement)
        # ==================================================================
        if pred_label != "benign" and confidence < 0.45:
            reason_text = f"Low Risk (Model Confidence {confidence*100:.1f}% too low)"
            pred_label = "benign"
        else:
            reason_text = "ML Model Prediction"

        result = {
            "url": url,
            "prediction": pred_label,
            "confidence": confidence,
            "is_safe": bool(pred_label == "benign"),
            "reason": reason_text,
            "method": "Machine Learning",
            "probabilities": {
                label: float(prob) 
                for label, prob in zip(label_encoder.classes_, probs)
            }
        }
        add_to_history(result)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {str(e)}")