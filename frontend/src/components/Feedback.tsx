import { Button, Typography, Container, Paper, Box, Divider, Slider, Alert } from '@mui/material';
import { VolumeUp, Speed, RecordVoiceOver, Timer } from '@mui/icons-material';

interface FeedbackProps {
  data: any;
  onBack: () => void;
}

function Feedback({ data, onBack }: FeedbackProps) {
  const { average_volume, speaking_rate, tone, speaking_duration } = data;

  const getSpeakingRateColor = (rate: number) => {
    if (rate >= 270 && rate <= 330) return 'success';
    if ((rate >= 240 && rate < 270) || (rate > 330 && rate <= 360)) return 'warning';
    return 'error';
  };

  const getSpeakingRateMessage = (rate: number) => {
    if (rate >= 270 && rate <= 330) return '適切な速度です';
    if (rate >= 240 && rate < 270) return 'やや遅いです';
    if (rate > 330 && rate <= 360) return 'やや速いです';
    if (rate < 240) return '遅すぎます';
    return '速すぎます';
  };

  const speakingRateColor = getSpeakingRateColor(speaking_rate);
  const speakingRateMessage = getSpeakingRateMessage(speaking_rate);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          フィードバック結果
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Speed color="primary" />
              <Typography variant="h6">
                話す速度: {speaking_rate.toFixed(2)} 文字/分
              </Typography>
            </Box>
            <Slider
              value={speaking_rate}
              min={200}
              max={400}
              step={1}
              marks={[
                { value: 200, label: '200' },
                { value: 300, label: '300' },
                { value: 400, label: '400' },
              ]}
              valueLabelDisplay="auto"
              sx={{ color: speakingRateColor }}
              disabled
            />
            <Alert severity={speakingRateColor} icon={false}>
              {speakingRateMessage}（目安: 300 文字/分）
            </Alert>
          </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VolumeUp color="primary" />
            <Typography variant="h6">
              平均音量: {average_volume.toFixed(2)} dB
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RecordVoiceOver color="primary" />
            <Typography variant="h6">声のトーン: {tone}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Timer color="primary" />
            <Typography variant="h6">
              話した時間: {speaking_duration.toFixed(2)} 秒
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={onBack} size="large">
            トップに戻る
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Feedback;