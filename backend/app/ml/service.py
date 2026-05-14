"""
Student Pulse — ML Prediction Service
Loads trained model and provides burnout predictions with recommendations.
"""

import os
import json
import joblib
import numpy as np

# Global model cache
_model = None
_scaler = None
_meta = None


def _load_model():
    global _model, _scaler, _meta
    if _model is None:
        model_dir = os.path.dirname(__file__)
        _model = joblib.load(os.path.join(model_dir, "model.pkl"))
        _scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))
        with open(os.path.join(model_dir, "model_meta.json")) as f:
            _meta = json.load(f)
    return _model, _scaler, _meta


def predict_burnout(activity_data: dict) -> dict:
    """Predict burnout from daily activity data."""
    model, scaler, meta = _load_model()
    feature_cols = meta["feature_columns"]

    features = np.array([[
        activity_data.get("sleep_hours", 6),
        activity_data.get("study_hours", 3),
        activity_data.get("gaming_hours", 2),
        activity_data.get("assignment_workload", 5),
        activity_data.get("attendance_pct", 80),
        activity_data.get("screen_time_hours", 5),
        activity_data.get("water_intake_glasses", 5),
        activity_data.get("social_interaction", 5),
        activity_data.get("mood_level", 5),
        activity_data.get("stress_level", 5),
        activity_data.get("energy_level", 5),
        activity_data.get("physical_activity_mins", 30),
    ]])

    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]

    risk_labels = ["low", "moderate", "high"]
    risk_level = risk_labels[prediction]
    burnout_pct = round(float(probabilities[1] * 40 + probabilities[2] * 100), 1)
    burnout_pct = min(100, max(0, burnout_pct))

    # Contributing factors
    factors = _analyze_factors(activity_data, meta)
    recommendations = _generate_recommendations(activity_data, risk_level, factors)

    return {
        "burnout_percentage": burnout_pct,
        "risk_level": risk_level,
        "contributing_factors": factors,
        "recommendations": recommendations,
        "prediction_date": activity_data.get("activity_date", ""),
        "class_probabilities": {
            "low": round(float(probabilities[0]), 3),
            "moderate": round(float(probabilities[1]), 3),
            "high": round(float(probabilities[2]), 3),
        },
    }


def _analyze_factors(data: dict, meta: dict) -> list:
    factors = []
    if data.get("sleep_hours", 7) < 6:
        factors.append({"factor": "Low Sleep", "severity": "high", "detail": f"Only {data['sleep_hours']}h sleep (recommended: 7-9h)"})
    if data.get("stress_level", 5) >= 7:
        factors.append({"factor": "High Stress", "severity": "high", "detail": f"Stress level at {data['stress_level']}/10"})
    if data.get("gaming_hours", 0) > 4:
        factors.append({"factor": "Excessive Gaming", "severity": "moderate", "detail": f"{data['gaming_hours']}h gaming time"})
    if data.get("study_hours", 3) < 2:
        factors.append({"factor": "Low Study Time", "severity": "moderate", "detail": f"Only {data['study_hours']}h of study"})
    if data.get("mood_level", 5) <= 3:
        factors.append({"factor": "Low Mood", "severity": "high", "detail": f"Mood level at {data['mood_level']}/10"})
    if data.get("physical_activity_mins", 30) < 15:
        factors.append({"factor": "Sedentary Lifestyle", "severity": "moderate", "detail": "Less than 15 min exercise"})
    if data.get("attendance_pct", 80) < 60:
        factors.append({"factor": "Low Attendance", "severity": "high", "detail": f"Attendance at {data['attendance_pct']}%"})
    if data.get("water_intake_glasses", 5) < 3:
        factors.append({"factor": "Dehydration Risk", "severity": "low", "detail": f"Only {data['water_intake_glasses']} glasses of water"})
    return factors


def _generate_recommendations(data: dict, risk_level: str, factors: list) -> list:
    recs = []
    if data.get("sleep_hours", 7) < 7:
        recs.append({"icon": "🌙", "text": "Try to get at least 7-8 hours of sleep. Your productivity improves significantly with proper rest.", "priority": "high"})
    if data.get("stress_level", 5) >= 7:
        recs.append({"icon": "🧘", "text": "Your stress levels are elevated. Consider meditation, deep breathing, or a short walk to decompress.", "priority": "high"})
    if data.get("gaming_hours", 0) > 3:
        recs.append({"icon": "🎮", "text": "High gaming hours may correlate with assignment delays. Try setting a gaming schedule after study goals are met.", "priority": "moderate"})
    if data.get("physical_activity_mins", 30) < 20:
        recs.append({"icon": "🏃", "text": "Even 20 minutes of exercise can boost your mood and energy. Try a quick walk or workout!", "priority": "moderate"})
    if data.get("water_intake_glasses", 5) < 4:
        recs.append({"icon": "💧", "text": "Stay hydrated! Aim for at least 8 glasses of water daily for better concentration.", "priority": "low"})
    if data.get("social_interaction", 5) <= 3:
        recs.append({"icon": "👥", "text": "Social connections matter. Reach out to a friend or join a study group.", "priority": "moderate"})
    if risk_level == "high":
        recs.append({"icon": "⚠️", "text": "Your burnout risk is high. Consider talking to a counselor or taking a mental health day.", "priority": "critical"})
    if data.get("study_hours", 3) >= 8:
        recs.append({"icon": "📚", "text": "Great study dedication! Remember to take regular breaks using the Pomodoro technique.", "priority": "low"})
    if not recs:
        recs.append({"icon": "✨", "text": "You're doing great! Keep maintaining your healthy balance.", "priority": "low"})
    return recs
