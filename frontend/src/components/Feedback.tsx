import { Button, Typography, Container } from '@mui/material';

interface FeedbackProps {
  data: any;
  onBack: () => void;
}

function Feedback({ data, onBack }: FeedbackProps) {
  const { average_volume, speaking_rate, tone, speaking_duration } = data;

  return (
    <Container>
      <Typography variant="h4">フィードバック結果</Typography>
      <Typography variant="h6">平均音量: {average_volume.toFixed(2)} dB</Typography>
      <Typography variant="h6">話す速度: {speaking_rate.toFixed(2)} 文字 / 秒</Typography>
      <Typography variant="h6">声のトーン: {tone}</Typography>
      <Typography variant="h6">話した時間: {speaking_duration.toFixed(2)} 秒</Typography>
      <Button variant="contained" onClick={onBack}>
        トップに戻る
      </Button>
    </Container>
  );
}

export default Feedback;
