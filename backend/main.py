from functions.analyzer import (
    calculate_average_volume,
    calculate_speaking_rate,
    analyze_pitch,
)
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Tuple
from pydantic import BaseModel
from pydub import AudioSegment
import uvicorn
import librosa
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    # TODO: ここで音声データからテキストを抽出して、その長さをtext_lengthに代入する
    # もしくはテキストを動的に変更する
    manuscript = """建設業大手の腹黒建設が
      埼玉県内の土地の売買などをめぐって
      法人税数千万円を脱税した疑いが強まり、
      東京地検 特捜部などはきょう、
      群馬県高崎市の本社などを
      一斉に家宅捜索しました。

      家宅捜索を受けたのは
      本社や悪徳狂一社長の自宅、
      土地取引先の開発会社「株式会社裏金商事」
      な ど数社です。
      また関係先として悪井嫌人
      埼玉県知事の実家も
      家宅捜索の対象となっています。"""

    manuscript_length = len(
        manuscript.replace("\n", "")
        .replace(" ", "")
        .replace("、", "")
        .replace("。", "")
        .replace("「", "")
        .replace("」", "")
    )
    print(manuscript_length)

    speaking_rate: float = calculate_speaking_rate(audio_data, sr, manuscript_length)
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
