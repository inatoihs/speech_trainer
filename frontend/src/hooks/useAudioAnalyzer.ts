import { useState, useRef } from 'react';
import { startWebSocketConnection } from '../functions/api';

export const useAudioAnalyzer = () => {
    const [volume, setVolume] = useState<number>(0);
    const [articulationScore, setArticulationScore] = useState<number | null>(null);
    const socketRef = useRef<any>(null);

    const startAnalyzing = (stream: MediaStream) => {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0 && socketRef.current) {
                const arrayBuffer = await event.data.arrayBuffer();
                socketRef.current.send(arrayBuffer);
            }
        };

        mediaRecorder.start(100); // 100msごとにデータを送信

        socketRef.current = startWebSocketConnection((data) => {
            setVolume(data.volume);
            setArticulationScore(data.articulation_score); // 滑舌の評価値を設定
        });
    };

    const stopAnalyzing = () => {
        socketRef.current?.close();
    };

    return {
        volume,
        articulationScore,
        startAnalyzing,
        stopAnalyzing,
    };
};
