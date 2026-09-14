import re
import os
import httpx
from functools import lru_cache
from typing import Dict, Any, Tuple
from rapidfuzz import fuzz

class EntityValidator:
    """
    Classifies raw strings into Ontological Entity Types using a Frontier LLM (Gemini),
    falling back to an MVP Regex engine for safety and speed.
    """
    RULES = {
        "INSTITUTION": r"\b(museum|hospital|school|college|university|institute)\b",
        "GOVERNMENT_BODY": r"\b(gov|govt|government|ministry|department|mcd|ndmc|authority)\b",
        "GOVERNMENT_PROPERTY": r"\b(parliament|rashtrapati|bhawan|secretariat|embassy|station)\b",
        "PRIVATE_COMPANY": r"\b(pvt|ltd|limited|inc|llp|company|corporation|corp|enterprises)\b",
        "TRUST_SOCIETY": r"\b(trust|society|foundation|ngo|charity)\b",
        "LANDMARK_BUILDING": r"\b(tower|plaza|mall|complex|stadium|park|monument)\b"
    }

    @staticmethod
    @lru_cache(maxsize=1000)
    def identify_type(name: str) -> str:
        if not name or name == "UNREGISTERED_ENTITY":
            return "UNKNOWN"
            
        # 1. Attempt Frontier LLM Classification (No Limit on Size/Intelligence)
        llm_type = EntityValidator._call_frontier_llm(name)
        if llm_type:
            return llm_type
            
        # 2. MVP Grade Fallback (Regex) - Executes if LLM fails or API key missing
        name_lower = name.lower()
        for entity_type, pattern in EntityValidator.RULES.items():
            if re.search(pattern, name_lower):
                return entity_type
                
        # If it doesn't match any organizational keywords, assume it's a PERSON
        return "PERSON"

    @staticmethod
    def _call_frontier_llm(name: str) -> str:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None # Graceful fallback to MVP engine
            
        prompt = f"""
        You are an elite Geospatial AI Entity Classifier.
        Classify the following property owner name into EXACTLY ONE of these categories:
        PERSON, INSTITUTION, GOVERNMENT_BODY, GOVERNMENT_PROPERTY, PRIVATE_COMPANY, TRUST_SOCIETY, LANDMARK_BUILDING
        
        Entity Name: "{name}"
        
        Respond with ONLY the category string. No other text.
        """
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.0, "maxOutputTokens": 10}
            }
            # Timeout set to 3s to prevent the demo from hanging if API is slow
            resp = httpx.post(url, json=payload, timeout=3.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip().upper()
                if text in EntityValidator.RULES.keys() or text == "PERSON":
                    return text
            return None
        except Exception:
            return None # Graceful fallback to MVP engine

    @staticmethod
    def is_compatible(type_a: str, type_b: str) -> bool:
        if type_a == "UNKNOWN" or type_b == "UNKNOWN":
            return True # Cannot deterministically say they conflict
            
        # Specific exception rules can be added here
        # E.g., GOVERNMENT_BODY and GOVERNMENT_PROPERTY might be loosely compatible
        
        return type_a == type_b

class MatchScorer:
    """
    Evaluates raw matching features and computes unified scores.
    """
    @staticmethod
    def calculate_attribute_similarity(cad_owner: str, mun_owner: str) -> float:
        if cad_owner and mun_owner:
            return fuzz.ratio(str(cad_owner).lower(), str(mun_owner).lower()) / 100.0
        return 0.0

class ConflictEngine:
    """
    Generates structured conflict objects.
    """
    @staticmethod
    def detect_conflicts(iou: float, centroid_dist: float, attr_sim: float, has_owners: bool, entity_a_type: str = "UNKNOWN", entity_b_type: str = "UNKNOWN", entity_compatible: bool = True) -> Dict[str, Any]:
        conflicts = {}
        
        if not entity_compatible:
            conflicts["entity_conflict"] = True
            conflicts["entity_a_type"] = entity_a_type
            conflicts["entity_b_type"] = entity_b_type
            conflicts["entity_evidence"] = f"Entity Type Mismatch ({entity_a_type} vs {entity_b_type})"
            
        if iou < 0.85:
            conflicts["geometry_conflict"] = True
            conflicts["geometry_evidence"] = f"IoU is {iou:.2f} (< 0.85)"
            
        if centroid_dist > 5.0:
            conflicts["centroid_conflict"] = True
            conflicts["centroid_evidence"] = f"Centroids are {centroid_dist:.2f}m apart (> 5m)"
            
        if has_owners and attr_sim < 0.7:
            conflicts["attribute_conflict"] = True
            conflicts["attribute_evidence"] = f"Fuzzy match ratio is {attr_sim:.2f} (< 0.7)"
            
        return conflicts

from sqlalchemy.orm import Session
from src.models import models
from sklearn.ensemble import RandomForestClassifier

class GeoAIModel:
    """
    True Machine Learning model trained dynamically via Active Learning (RLHF).
    Retrieves real human decisions from the database to replace synthetic hallucination.
    """
    _model = None
    _is_trained = False

    @classmethod
    def get_model(cls, db: Session):
        # We only retrain if it hasn't been trained in this session, or we could force a retrain
        # To ensure the demo dynamically updates, we'll fetch real data on demand.
        print("Fetching Real Human RLHF Data from Audit Logs...")
        
        # Query human decisions: actor != 'SYSTEM'
        human_audits = db.query(models.AuditLog, models.MatchResult).join(
            models.MatchResult, models.AuditLog.match_id == models.MatchResult.id
        ).filter(models.AuditLog.actor != 'SYSTEM').all()
        
        X_data = []
        y_data = []
        
        for audit, match in human_audits:
            # Features: [iou, centroid_dist, attr_sim, has_owners]
            iou = match.iou
            centroid_dist = match.centroid_dist
            attr_sim = match.attribute_similarity
            # We assume has_owners if attr_sim > 0.0 or if names exist (for simplicity here, we'll infer it)
            has_owners = 1 if attr_sim > 0 else 0
            
            # Map actions to labels:
            # "HUMAN_APPROVED_*" -> 2 (HIGH)
            # "REJECTED" -> 0 (LOW)
            if "APPROVED" in audit.action.upper():
                label = 2
            elif "REJECTED" in audit.action.upper():
                label = 0
            else:
                label = 1 # fallback
                
            X_data.append([iou, centroid_dist, attr_sim, has_owners])
            y_data.append(label)
            
        # Minimum threshold for Random Forest to prevent extreme overfitting
        if len(X_data) > 5:
            print(f"Training Random Forest Classifier on {len(X_data)} Real Human Feedback vectors...")
            # We don't need train_test_split here as we are doing online learning on tiny sets, 
            # but we use standard params.
            clf = RandomForestClassifier(n_estimators=100, max_depth=10, min_samples_split=2, random_state=42, n_jobs=-1)
            clf.fit(X_data, y_data)
            
            # In a real deployment, accuracy would be computed against a hold-out test set
            print("✅ ML Engine Refined via Real-World Active Learning.")
            cls._model = clf
            cls._is_trained = True
        else:
            print(f"⚠️ Cold Start: Only {len(X_data)} human decisions found. Falling back to Deterministic Ruleset.")
            cls._model = None
            cls._is_trained = False
            
        return cls._model

class DecisionPolicy:
    """
    Translates model predictions into explicit, rule-based safe harmonization policies.
    """
    @staticmethod
    def evaluate(iou: float, centroid_dist: float, attr_sim: float, has_owners: bool, db: Session) -> Tuple[str, str]:
        """
        Returns (confidence, status) using either the RLHF Scikit-Learn Model or a Cold-Start Fallback.
        """
        model = GeoAIModel.get_model(db)
        
        if model is not None:
            # Predict using the Active Learning ML Model
            features = [[iou, centroid_dist, attr_sim, int(has_owners)]]
            prediction = model.predict(features)[0]
            
            if prediction == 2:
                return "HIGH", "auto_harmonized"
            elif prediction == 1:
                return "MEDIUM", "manual_review"
            else:
                return "LOW", "manual_review"
        else:
            # COLD START DETERMINISTIC FALLBACK (Zero Hallucination)
            if iou > 0.85 and centroid_dist < 3.0 and (not has_owners or attr_sim > 0.8):
                return "HIGH", "auto_harmonized"
            elif iou > 0.4 or (has_owners and attr_sim > 0.6):
                return "MEDIUM", "manual_review"
            else:
                return "LOW", "manual_review"

