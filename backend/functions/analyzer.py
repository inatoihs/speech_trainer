from typing import Tuple
import numpy as np
import librosa


def rms_to_db_with_reference(rms_value: float) -> float:
    return 20 * np.log10(rms_value + 1e-6)


def calculate_average_volume(audio_data: np.ndarray) -> float:
    rms: np.ndarray = librosa.feature.rms(y=audio_data)[0]
    average_rms: float = np.mean(rms)
    return rms_to_db_with_reference(average_rms)


def calculate_speaking_rate(audio_data: np.ndarray, sr: int, text_length: int) -> float:
    total_speech_duration: float = len(audio_data) / sr
    return 60 * text_length / total_speech_duration if total_speech_duration > 0 else 0


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
