from fastapi import FastAPI, WebSocket, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from functions.analyzer import (
    calculate_average_volume,
    analyze_pitch,
    calculate_speaking_rate,
)
import librosa
from pydub import AudioSegment
import traceback
import io
import uvicorn
from typing import Optional


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
    pitch_mean: float
    tone: str


class RealTimeUpdate(BaseModel):
    volume: float


@app.websocket("/ws/analyze")
async def websocket_analyze(websocket: WebSocket) -> None:
    await websocket.accept()
    former_data: Optional[bytes] = None

    while True:
        try:
            # TODO: ストリーミングで音声データを受け取るようにする。
            # 現状でデータ結合せずに処理しようとすると、２番目以降のデータにヘッダーなどが含まれず、
            # ヘッダーを追加したとしてもクラスターのファイルやポジションの整合性が取れないため、
            # うまく処理できない。フロント側でのデータの送り方を変える必要があるかもしれない。
            coming_data: bytes = await websocket.receive_bytes()
            data: bytes = former_data + coming_data if former_data else coming_data

            audio_segment: AudioSegment = AudioSegment.from_file(
                io.BytesIO(data), format="webm"
            )
            audio_segment = audio_segment.set_channels(1)
            audio_bytes_wav: io.BytesIO = io.BytesIO()
            audio_segment.export(audio_bytes_wav, format="wav")
            audio_bytes_wav.seek(0)

            # TODO: offsetを使って開始時間を指定する。ループでiを増やしていくとか。
            # 現状なぜかoffsetが効かないので調査が必要。
            audio_data, sr = librosa.load(audio_bytes_wav, sr=None)
            volume: float = calculate_average_volume(audio_data)

            await websocket.send_json({"volume": float(volume % 10 * 10)})

            former_data = data

        except Exception as e:
            await websocket.close()
            error_message: str = traceback.format_exc()
            print(f"An error occurred:\n{error_message}")
            break


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_complete(file: UploadFile = File(...)) -> AnalysisResult:
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

    manuscript: str = """建設業大手の腹黒建設が
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

    manuscript_length: int = len(
        manuscript.replace("\n", "")
        .replace(" ", "")
        .replace("、", "")
        .replace("。", "")
        .replace("「", "")
        .replace("」", "")
    )

    speaking_rate: float = calculate_speaking_rate(audio_data, sr, manuscript_length)
    pitch_mean: float
    tone: str
    pitch_mean, tone = analyze_pitch(audio_data, sr)

    return AnalysisResult(
        average_volume=average_volume,
        speaking_rate=speaking_rate,
        pitch_mean=pitch_mean,
        tone=tone,
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
