# プロジェクトのセットアップ

このプロジェクトをセットアップするためには、以下の手順に従ってください。

## 前提条件

- Homebrew がインストールされていること
- Python と pip がインストールされていること
- Node.js と npm がインストールされていること

## バックエンドのセットアップ

1. `backend/` ディレクトリに移動します。
   ```bash
   cd backend/
    ```
2. 仮想環境を作成します。
    ```bash
    python3 -m venv venv
    ```
3. 仮想環境を有効化します。
    ```bash
    source venv/bin/activate
    ```
4. 依存パッケージをインストールします。
    ```bash
    brew install ffmpeg
    pip install pydub
    pip install python-multipart
    pip install librosa soundfile numpy
    pip install fastapi uvicorn
    ```
5. バックエンドを起動します。
    ```bash
    python main.py
    ```

## フロントエンドのセットアップ
1. `frontend/` ディレクトリに移動します。
    ```bash
    cd frontend/
    ```
2. 依存パッケージをインストールします。
    ```bash
    npm install
    ```
3. フロントエンドを起動します。
    ```bash
    npm start
    ```