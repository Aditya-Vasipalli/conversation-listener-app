import React, { useRef, useState } from 'react';
import Transcript from './components/Transcript.js';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef(null);

  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            setTranscript((prev) => (prev ? prev + "\n" : "") + result[0].transcript);
            setInterim('');
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        setInterim(interimTranscript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
      recognitionRef.current = recognition;
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, []);

  const startListening = () => {
    setTranscript('');
    setInterim('');
    recognitionRef.current && recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current && recognitionRef.current.stop();
    setIsListening(false);
  };

  return (
    <div className="app-container">
      <h1>Meeting Assist - Conversation Listener</h1>
      <div className="controls">
        <button id="start-button" onClick={startListening} disabled={isListening}>Start Listening</button>
        <button id="stop-button" onClick={stopListening} disabled={!isListening}>Stop Listening</button>
      </div>
      <Transcript transcript={transcript} interim={interim} />
    </div>
  );
}

export default App;
