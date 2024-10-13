from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Tuple
from pydantic import BaseModel
from pydub import AudioSegment
import uvicorn
import librosa
import numpy as np
import io

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def rms_to_db_with_reference(rms_value: float) -> float:
    return 20 * np.log10(rms_value + 1e-6)


def calculate_average_volume(audio_data: np.ndarray) -> float:
    rms: np.ndarray = librosa.feature.rms(y=audio_data)[0]
    average_rms: float = np.mean(rms)
    return rms_to_db_with_reference(average_rms)


def calculate_speaking_rate(audio_data: np.ndarray, sr: int) -> float:
    non_silent_intervals: np.ndarray = librosa.effects.split(audio_data, top_db=20)
    total_speech_duration: float = (
        sum((end - start) for start, end in non_silent_intervals) / sr
    )
    text_length: int = 100  # 仮の文字数
    return text_length / total_speech_duration if total_speech_duration > 0 else 0


def analyze_pitch(audio_data: np.ndarray, sr: int) -> Tuple[float, str]:
    pitches: np.ndarray
    magnitudes: np.ndarray
    pitches, magnitudes = librosa.piptrack(y=audio_data, sr=sr)
    pitch_values: np.ndarray = pitches[magnitudes > np.median(magnitudes)]
    pitch_mean: float = np.mean(pitch_values) if len(pitch_values) > 0 else 0
    if pitch_mean > 1500:
        tone: str = "高め"
    elif pitch_mean > 1300:
        tone = "中程度"
    else:
        tone = "低め"
    return pitch_mean, tone


# Pydanticのレスポンスモデル定義
class AnalysisResult(BaseModel):
    average_volume: float
    speaking_rate: float
    tone: str
    pitch_mean: float


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(file: UploadFile = File(...)) -> AnalysisResult:
    audio_bytes: bytes = await file.read()
    audio_segment: AudioSegment = AudioSegment.from_file(
        io.BytesIO(audio_bytes), format="webm"
    )
    audio_segment = audio_segment.set_channels(1)
    audio_bytes_wav: io.BytesIO = io.BytesIO()
    audio_segment.export(audio_bytes_wav, format="wav")
    audio_bytes_wav.seek(0)
    audio_data, sr = librosa.load(audio_bytes_wav, sr=None)

    average_volume: float = calculate_average_volume(audio_data)
    speaking_rate: float = calculate_speaking_rate(audio_data, sr)
    pitch_mean: float
    tone: str
    pitch_mean, tone = analyze_pitch(audio_data, sr)

    return AnalysisResult(
        average_volume=average_volume,
        speaking_rate=speaking_rate,
        tone=tone,
        pitch_mean=pitch_mean,
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
