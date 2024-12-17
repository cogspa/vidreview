# Video Review Application

A web application for uploading videos, dividing them into sections, and generating transcriptions.

## Features

- Video upload and playback
- Section management
- Automatic transcription
- User-friendly interface

## Setup

### Frontend

```bash
cd video-processor-ui
npm install
npm run dev
```

### Backend

```bash
cd video-processor-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```
