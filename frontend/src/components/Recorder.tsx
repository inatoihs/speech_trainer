import { Button, Typography, LinearProgress } from '@mui/material';
import { useRecording } from '../hooks/useRecording';

interface RecorderProps {
  onComplete: (data: any) => void;
}

function Recorder({ onComplete }: RecorderProps) {
  const { isRecording, volume, startRecording, stopRecording } = useRecording(onComplete);

  return (
    <div>
      <Typography variant="h4">音声フィードバックシステム</Typography>
      <Button variant="contained" color="primary" onClick={startRecording} disabled={isRecording}>
        会話開始
      </Button>
      <Button variant="contained" color="secondary" onClick={stopRecording} disabled={!isRecording}>
        会話終了
      </Button>
      <Typography variant="h6">現在の音量:</Typography>
      <LinearProgress variant="determinate" value={Math.min(100, volume)} />
    </div>
  );
}

export default Recorder;
