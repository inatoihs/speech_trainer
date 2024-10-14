import { Button, Typography, LinearProgress, Container, Paper, Box, Divider } from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
import { useRecording } from '../hooks/useRecording';

interface RecorderProps {
  onComplete: (data: any) => void;
}

function Recorder({ onComplete }: RecorderProps) {
  const { isRecording, volume, startRecording, stopRecording } = useRecording(onComplete);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          音声フィードバックシステム
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom align="center">
          この文章を読み上げよう！
        </Typography>
        <Box sx={{ my: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body1" paragraph>
            建設業大手の腹黒(はらぐろ)建設が埼玉県内の土地の売買などをめぐって法人税数千万円を脱税した疑いが強まり、東京地検特捜部などはきょう、群馬県高崎市の本社などを一斉に家宅捜索しました。
          </Typography>
          <Typography variant="body1" paragraph>
            家宅捜索を受けたのは本社や悪徳(あくとく)狂一(きょういち)社長の自宅、土地取引先の開発会社「株式会社裏金商事」など数社です。
          </Typography>
          <Typography variant="body1">
            また関係先として悪井(あくい)嫌人(けんと)埼玉県知事の実家も家宅捜索の対象となっています。
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={startRecording}
            disabled={isRecording}
            startIcon={<Mic />}
            size="large"
          >
            会話開始
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={stopRecording}
            disabled={!isRecording}
            startIcon={<Stop />}
            size="large"
          >
            会話終了
          </Button>
        </Box>
        <Typography variant="h6" gutterBottom>
          現在の音量:
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, volume)}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Paper>
    </Container>
  );
}

export default Recorder;