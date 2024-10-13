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

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    #読み上げる文章を原稿にする
    genkou="""けんせつぎょうおおてのはらぐろけんせつが
      さいたまけんないのとちのばいばいなどをめぐって
      ほうじんぜいすうせんまんえんをだつぜいしたうたがいがつよまり、
      とうきょうちけん とくそうぶなどはきょう、
      ぐんまけんたかさきしのほんしゃなどを
      いっせいにかたくそうさくしました。

      かたくそうさくをうけたのは
      ほんしゃやあくとくきょういちしゃちょうのじたく、
      とちとりひきさきのかいはつがいしゃ「かぶしきがいしゃうらがねしょうじ」
      などすうしゃです。
      またかんけいさきとしてあくいけんと
      さいたまけんちじのじっかも
      かたくそうさくのたいしょうとなっています。"""

    speaking_rate: float = calculate_speaking_rate(audio_data, sr, len(genkou))
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
