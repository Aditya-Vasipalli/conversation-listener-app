import React from 'react';

function Transcript({ transcript, interim }) {
  // Split transcript by newlines and render each as a paragraph
  return (
    <div className="transcript-content">
      {transcript.split('\n').map((line, idx) => line && <p key={idx}>{line}</p>)}
      {interim && <p style={{ opacity: 0.6 }}>{interim}</p>}
    </div>
  );
}

export default Transcript;