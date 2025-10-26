from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import os
from datetime import datetime
import hashlib
from dotenv import load_dotenv
import pandas as pd
from fastapi.responses import JSONResponse

load_dotenv()

DATA_FILE = "../generated_phishing_data.csv"
phish_data = pd.read_csv(DATA_FILE)
user_progress = {}  # {user_id: index_of_next_email}

app = FastAPI(title="PhishPlay Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventRequest(BaseModel):
    user_id: str
    action: str
    score: float
    message_hash: str
    selected_elements: list = []

class EventResponse(BaseModel):
    ok: bool
    event_id: str

BUFFER_FILE = "buffered_events.csv"

@app.get("/ping")
def ping():
    return {"msg": "pong"}

@app.post("/api/event", response_model=EventResponse)
def log_event(req: EventRequest):
    event_id = hashlib.sha256(f"{req.user_id}-{req.message_hash}-{datetime.now()}".encode()).hexdigest()
    row = [datetime.now().isoformat(), req.user_id, req.action, req.score, req.message_hash, event_id, "|".join(req.selected_elements)]

    file_exists = os.path.isfile(BUFFER_FILE)
    try:
        with open(BUFFER_FILE, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["timestamp","user_id","action","score","message_hash","event_id","selected_elements"])
            writer.writerow(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write CSV: {str(e)}")

    return EventResponse(ok=True, event_id=event_id)

@app.get("/api/next_email/{user_id}")
def next_email(user_id: str):
    idx = user_progress.get(user_id, 0)
    if idx >= len(phish_data):
        return JSONResponse(content={"msg": "No more emails"}, status_code=404)

    row = phish_data.iloc[idx]
    user_progress[user_id] = idx + 1

    # Ensure cues are properly formatted
    cues = []
    if pd.notna(row.get("tags", "")):
        cues = row["tags"].split("|")
    
    # Clean up any empty strings from cues
    cues = [cue.strip() for cue in cues if cue.strip()]

    return {
        "id": str(idx),
        "theme": "default",
        "sender": row["sender_email"],
        "subject": row.get("subject", "No Subject"),
        "body": row["body"],
        "cues": cues,
        "difficulty": row["difficulty"],
        "is_phishing": bool(row["is_phishing"])
    }