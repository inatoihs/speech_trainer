from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
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


def rms_to_db_with_reference(rms_value):
    return 20 * np.log10(rms_value + 1e-6)


def calculate_average_volume(audio_data):
    rms = librosa.feature.rms(y=audio_data)[0]
    average_rms = np.mean(rms)
    return rms_to_db_with_reference(average_rms)


def calculate_speaking_rate(audio_data, sr):
    non_silent_intervals = librosa.effects.split(audio_data, top_db=20)
    total_speech_duration = (
        sum((end - start) for start, end in non_silent_intervals) / sr
    )
    text_length = 100  # 仮の文字数
    return text_length / total_speech_duration if total_speech_duration > 0 else 0


def analyze_pitch(audio_data, sr):
    pitches, magnitudes = librosa.piptrack(y=audio_data, sr=sr)
    pitch_values = pitches[magnitudes > np.median(magnitudes)]
    pitch_mean = np.mean(pitch_values) if len(pitch_values) > 0 else 0
    if pitch_mean > 1500:
        tone = "高め"
    elif pitch_mean > 1300:
        tone = "中程度"
    else:
        tone = "低め"
    return pitch_mean, tone


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="webm")
    audio_segment = audio_segment.set_channels(1)
    audio_bytes_wav = io.BytesIO()
    audio_segment.export(audio_bytes_wav, format="wav")
    audio_bytes_wav.seek(0)
    audio_data, sr = librosa.load(audio_bytes_wav, sr=None)

    average_volume = calculate_average_volume(audio_data)
    speaking_rate = calculate_speaking_rate(audio_data, sr)
    pitch_mean, tone = analyze_pitch(audio_data, sr)

    return {
        "average_volume": float(average_volume),
        "speaking_rate": float(speaking_rate),
        "tone": tone,
        "pitch_mean": float(pitch_mean),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
