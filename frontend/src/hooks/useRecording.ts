import { useState } from 'react';
import { useMediaRecorder } from './useMediaRecorder';
import { useAudioAnalyzer } from './useAudioAnalyzer';
import { postRecording } from '../functions/api';

export const useRecording = (onComplete: (data: any) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const [speakingStartTime, setSpeakingStartTime] = useState<number>(0);
    const [speakingDuration, setSpeakingDuration] = useState<number>(0);
    const [, setStream] = useState<MediaStream | null>(null);

    const { startRecording, stopRecording } = useMediaRecorder(async (audioBlob) => {
        const speakingEndTime = Date.now();
        const totalDuration = (speakingEndTime - (speakingStartTime)) / 1000;
        setSpeakingDuration(totalDuration);

        const responseData = await postRecording(audioBlob, totalDuration);
        onComplete(responseData);
    });

    const { volume, startAnalyzing, stopAnalyzing } = useAudioAnalyzer();

    const handleStartRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(stream);
        setSpeakingStartTime(Date.now());
        setIsRecording(true);

        startRecording(stream);
        startAnalyzing(stream);
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        stopRecording();
        stopAnalyzing();
    };

    return {
        isRecording,
        volume,
        speakingDuration,
        startRecording: handleStartRecording,
        stopRecording: handleStopRecording,
    };
};
