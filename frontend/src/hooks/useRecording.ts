import { useState, useRef } from 'react';
import axios from 'axios';

export const useRecording = (onComplete: (data: any) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const [volume, setVolume] = useState<number>(0);
    const [speakingStartTime, setSpeakingStartTime] = useState<number | null>(null);
    const [speakingDuration, setSpeakingDuration] = useState<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const intervalId = useRef<number | null>(null);

    const startRecording = async () => {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();

        mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
            audioChunks.current.push(event.data);
        });

        setSpeakingStartTime(Date.now());

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.fftSize);

        const updateVolume = () => {
            analyser.getByteTimeDomainData(dataArray);
            const rms = Math.sqrt(dataArray.reduce((sum, value) => sum + (value - 128) ** 2, 0) / dataArray.length);
            const dB = 20 * Math.log10(rms + 1e-6);
            setVolume(dB);
        };

        intervalId.current = window.setInterval(updateVolume, 1000);
    };

    const stopRecording = async () => {
        setIsRecording(false);
        mediaRecorderRef.current?.stop();

        if (intervalId.current) {
            window.clearInterval(intervalId.current);
        }

        mediaRecorderRef.current?.addEventListener('stop', async () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');

            const speakingEndTime = Date.now();
            const totalDuration = (speakingEndTime - (speakingStartTime ?? 0)) / 1000;
            setSpeakingDuration(totalDuration);

            const response = await axios.post('http://localhost:8000/analyze', formData);
            const responseData = {
                ...response.data,
                speaking_duration: totalDuration,
            };
            onComplete(responseData);
        });
    };

    return {
        isRecording,
        volume,
        speakingDuration,
        startRecording,
        stopRecording,
    };
};
