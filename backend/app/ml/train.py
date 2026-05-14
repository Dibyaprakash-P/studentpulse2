"""
Student Pulse — ML Training Script
Generates synthetic dataset and trains burnout prediction model.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json


def generate_synthetic_dataset(n_samples=15000):
    np.random.seed(42)
    sleep = np.random.normal(6.5, 1.5, n_samples).clip(2, 12)
    study = np.random.normal(4, 2, n_samples).clip(0, 14)
    gaming = np.random.normal(2.5, 1.5, n_samples).clip(0, 10)
    workload = np.random.randint(1, 11, n_samples)
    attendance = np.random.normal(75, 15, n_samples).clip(10, 100)
    screen = np.random.normal(6, 2, n_samples).clip(1, 16)
    water = np.random.randint(1, 12, n_samples)
    social = np.random.randint(1, 11, n_samples)
    physical = np.random.normal(30, 20, n_samples).clip(0, 180)

    stress_base = (8 - sleep) * 0.8 + workload * 0.5 + gaming * 0.3 - physical * 0.02 - social * 0.2
    stress = (stress_base + np.random.normal(0, 1, n_samples)).clip(1, 10).astype(int)
    mood = (10 - stress * 0.6 + sleep * 0.3 + social * 0.2 + np.random.normal(0, 1, n_samples)).clip(1, 10).astype(int)
    energy = (sleep * 0.8 + physical * 0.02 - stress * 0.3 + np.random.normal(0, 1, n_samples)).clip(1, 10).astype(int)

    burnout_score = (
        (8 - sleep) * 8 + stress * 6 + (10 - mood) * 4 + workload * 3 +
        gaming * 2.5 - study * 1.5 - (attendance / 100) * 10 -
        physical * 0.1 - social * 1.5 - water * 0.5 +
        (10 - energy) * 3 + np.random.normal(0, 5, n_samples)
    ).clip(0, 100)

    burnout_level = np.zeros(n_samples, dtype=int)
    burnout_level[burnout_score >= 35] = 1
    burnout_level[burnout_score >= 65] = 2

    return pd.DataFrame({
        'sleep_hours': np.round(sleep, 1), 'study_hours': np.round(study, 1),
        'gaming_hours': np.round(gaming, 1), 'assignment_workload': workload,
        'attendance_pct': np.round(attendance, 1), 'screen_time_hours': np.round(screen, 1),
        'water_intake': water, 'social_interaction': social,
        'mood_level': mood, 'stress_level': stress,
        'energy_level': energy, 'physical_activity_mins': physical.astype(int),
        'burnout_score': np.round(burnout_score, 1), 'burnout_level': burnout_level,
    })


def train_model():
    print("Training Student Pulse burnout model...")
    df = generate_synthetic_dataset(15000)
    feature_cols = [
        'sleep_hours', 'study_hours', 'gaming_hours', 'assignment_workload',
        'attendance_pct', 'screen_time_hours', 'water_intake', 'social_interaction',
        'mood_level', 'stress_level', 'energy_level', 'physical_activity_mins'
    ]
    X = df[feature_cols].values
    y_class = df['burnout_level'].values

    X_train, X_test, y_train, y_test = train_test_split(X, y_class, test_size=0.2, random_state=42, stratify=y_class)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train_scaled, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test_scaled))
    print(f"Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, model.predict(X_test_scaled), target_names=["Low", "Moderate", "High"]))

    model_dir = os.path.dirname(__file__)
    joblib.dump(model, os.path.join(model_dir, "model.pkl"))
    joblib.dump(scaler, os.path.join(model_dir, "scaler.pkl"))

    meta = {"feature_columns": feature_cols, "accuracy": float(accuracy), "class_labels": ["low", "moderate", "high"],
            "feature_importance": {f: float(i) for f, i in zip(feature_cols, model.feature_importances_)}}
    with open(os.path.join(model_dir, "model_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print("Model saved successfully!")


if __name__ == "__main__":
    train_model()
