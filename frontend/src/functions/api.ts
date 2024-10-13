import axios from 'axios';
export const postRecording = async (audioBlob: Blob, totalDuration: number) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    const response = await axios.post('http://localhost:8000/analyze', formData);
    return {
        ...response.data,
        speaking_duration: totalDuration,
    };
};
