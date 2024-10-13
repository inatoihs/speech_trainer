import { useRef } from 'react';

export const useMediaRecorder = (onDataAvailable: (data: Blob) => void) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startRecording = (stream: MediaStream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();
        mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
            audioChunks.current.push(event.data);
        });
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current?.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            onDataAvailable(audioBlob);
        });
    };

    return {
        startRecording,
        stopRecording,
    };
};
