from transformers import pipeline
from pathlib import Path
import torch
import ffmpeg
import os
from tempfile import NamedTemporaryFile

class TranscriptionService:
    def __init__(self):
        self.device = "cpu"
        self.transcriber = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-base",
            device=self.device
        )

    def transcribe_section(self, video_path: str, start_time: float, end_time: float) -> str:
        """
        Transcribe a section of a video file between start_time and end_time.
        Returns the transcribed text.
        """
        try:
            # Create a temporary file for the audio section
            with NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
                # Extract audio section using FFmpeg
                stream = ffmpeg.input(video_path, ss=start_time, t=end_time - start_time)
                stream = ffmpeg.output(stream, temp_audio.name, acodec='pcm_s16le', ac=1, ar=16000)
                ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

                # Transcribe the audio section
                result = self.transcriber(temp_audio.name)

                # Clean up temporary file
                os.unlink(temp_audio.name)

                return result["text"]
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")

    def is_valid_video(self, video_path: str) -> bool:
        """
        Check if the video file exists and is accessible.
        """
        try:
            probe = ffmpeg.probe(video_path)
            return True
        except ffmpeg.Error:
            return False
