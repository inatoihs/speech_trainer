import { useState, useRef } from 'react';

export const useAudioAnalyzer = () => {
    const [volume, setVolume] = useState<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    const startAnalyzing = (stream: MediaStream) => {
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);

        const scriptProcessor = audioContextRef.current.createScriptProcessor(2048, 1, 1);
        analyser.smoothingTimeConstant = 0;
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContextRef.current.destination);

        scriptProcessor.addEventListener('audioprocess', function () {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            const arraySum = array.reduce((a, value) => a + value, 0);
            const average = arraySum / array.length;
            setVolume(Math.round(average));
        });
    };

    const stopAnalyzing = () => {
        audioContextRef.current?.close();
    };

    return {
        volume,
        startAnalyzing,
        stopAnalyzing,
    };
};
