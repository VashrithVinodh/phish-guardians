from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import os
from datetime import datetime
import hashlib

# -----------------------
# FastAPI app
# -----------------------
app = FastAPI(title="PhishPlay Backend")

# -----------------------
# Enable CORS for frontend
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Models
# -----------------------
class ScoreRequest(BaseModel):
    text: str

class ScoreResponse(BaseModel):
    score: float
    top_tokens: list
    cues: dict
    threshold: float

class EventRequest(BaseModel):
    user_id: str
    action: str
    score: float
    message_hash: str

class EventResponse(BaseModel):
    ok: bool
    event_id: str

# -----------------------
# Ping endpoint (test)
# -----------------------
@app.get("/ping")
def ping():
    return {"msg": "pong"}

# -----------------------
# /api/score_text (stub)
# -----------------------
@app.post("/api/score_text", response_model=ScoreResponse)
def score_text(req: ScoreRequest):
    text = req.text.lower()
    # Simple stub logic for testing
    score = 0.9 if "verify" in text or "password" in text else 0.1
    top_tokens = [word for word in text.split()[:3]]
    cues = {
        "urgency": "verify" in text,
        "link_mismatch": "http" in text,
        "pii_request": "password" in text
    }
    threshold = 0.5
    return ScoreResponse(score=score, top_tokens=top_tokens, cues=cues, threshold=threshold)

# -----------------------
# /api/event (log to CSV)
# -----------------------
BUFFER_FILE = "buffered_events.csv"

@app.post("/api/event", response_model=EventResponse)
def log_event(req: EventRequest):
    event_id = hashlib.sha256(f"{req.user_id}-{req.message_hash}-{datetime.now()}".encode()).hexdigest()
    row = [datetime.now().isoformat(), req.user_id, req.action, req.score, req.message_hash, event_id]

    # Ensure CSV file exists
    file_exists = os.path.isfile(BUFFER_FILE)
    try:
        with open(BUFFER_FILE, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not file_exists:
                # write header
                writer.writerow(["timestamp","user_id","action","score","message_hash","event_id"])
            writer.writerow(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write CSV: {str(e)}")

    return EventResponse(ok=True, event_id=event_id)
