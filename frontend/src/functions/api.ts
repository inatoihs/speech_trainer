import axios from 'axios';
export const postRecording = async (audioBlob: Blob, totalDuration: number) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    // TODO: 環境変数からURLを取得する
    const response = await axios.post('http://localhost:8000/analyze', formData);
    return {
        ...response.data,
        speaking_duration: totalDuration,
    };
};

export const startWebSocketConnection = (onMessage: (data: any) => void) => {
    const socket = new WebSocket('ws://localhost:8000/ws/analyze');

    socket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        onMessage(messageData);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return {
        send: (data: ArrayBuffer) => {
            socket.send(data);
        },
        close: () => {
            socket.close();
        }
    };
};

