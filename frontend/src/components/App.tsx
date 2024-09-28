import { useState } from 'react';
import Recorder from './Recorder';
import Feedback from './Feedback';
import { Container } from '@mui/material';

function App() {
  const [stage, setStage] = useState<'record' | 'feedback'>('record');
  const [feedbackData, setFeedbackData] = useState<any>(null);

  const handleRecordingComplete = (data: any) => {
    setFeedbackData(data);
    setStage('feedback');
  };

  const handleBackToRecord = () => {
    setStage('record');
    setFeedbackData(null);
  };

  return (
    <Container>
      {stage === 'record' ? (
        <Recorder onComplete={handleRecordingComplete} />
      ) : (
        <Feedback data={feedbackData} onBack={handleBackToRecord} />
      )}
    </Container>
  );
}

export default App;
