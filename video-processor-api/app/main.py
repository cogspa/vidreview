from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import shutil
import os
from pydantic import BaseModel

app = FastAPI()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount the uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class TranscriptionRequest(BaseModel):
    video_path: str
    start_time: float
    end_time: float

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "path": str(file_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcribe")
async def transcribe_section(request: TranscriptionRequest):
    try:
        # Import TranscriptionService only when needed
        from .transcription import TranscriptionService

        # Initialize service if needed
        if not hasattr(app.state, "transcription_service"):
            app.state.transcription_service = TranscriptionService()

        if not app.state.transcription_service.is_valid_video(request.video_path):
            raise HTTPException(status_code=400, detail="Invalid video file")

        text = app.state.transcription_service.transcribe_section(
            request.video_path,
            request.start_time,
            request.end_time
        )
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
