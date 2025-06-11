import React, { useRef, useState } from 'react';
import Transcript from './components/Transcript.js';

const ASSEMBLYAI_API_KEY = 'd33337bba3c64713941eccfbaf41fd38'; // <-- Replace with your real API key

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [speakerTranscript, setSpeakerTranscript] = useState([]); // [{speaker, text}]
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

  const startListening = async () => {
    setTranscript('');
    setInterim('');
    setSpeakerTranscript([]);
    setIsUploading(false);
    setIsListening(true);
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    uploadTranscriptToLocalDiarizer();
  };

  async function uploadTranscriptToLocalDiarizer() {
    setIsUploading(true);
    const transcriptSegments = transcript.split('\n').filter(Boolean);
    const diarizeRes = await fetch('http://localhost:5000/diarize', {
      method: 'POST',
      body: JSON.stringify({ segments: transcriptSegments }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await diarizeRes.json();
    setIsUploading(false);
    // Merge consecutive segments from the same speaker and show the actual text
    const merged = [];
    let lastSpeaker = null;
    let lastText = '';
    data.speakers.forEach((spk, i) => {
      const speakerNum = spk.replace('Speaker ', '');
      const segText = transcriptSegments[i] || '';
      if (speakerNum === lastSpeaker) {
        lastText += ' ' + segText;
      } else {
        if (lastSpeaker !== null) merged.push({ speaker: lastSpeaker, text: lastText });
        lastSpeaker = speakerNum;
        lastText = segText;
      }
    });
    if (lastSpeaker !== null) merged.push({ speaker: lastSpeaker, text: lastText });
    setSpeakerTranscript(merged);
  }

  return (
    <div className="app-container">
      <h1>Meeting Assist - Conversation Listener</h1>
      <div className="controls">
        <button id="start-button" onClick={startListening} disabled={isListening || isUploading}>Start Listening</button>
        <button id="stop-button" onClick={stopListening} disabled={!isListening || isUploading}>Stop Listening</button>
      </div>
      {isUploading && <p>Uploading and transcribing audio, please wait...</p>}
      {speakerTranscript.length > 0 ? (
        <div className="transcript-content">
          {speakerTranscript.map((u, i) => (
            <div key={i} className={`transcript-item speaker-${u.speaker}`} style={{marginBottom: '10px'}}>
              <span style={{fontWeight: 'bold', color: '#007bff'}}>Speaker {u.speaker}:</span>
              <span style={{marginLeft: 8}}>{u.text || '[No speech recognized]'}</span>
            </div>
          ))}
        </div>
      ) : (
        <Transcript transcript={transcript} interim={interim} />
      )}
    </div>
  );
}

export default App;
