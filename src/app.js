import Transcript from './components/Transcript.js';

const startListeningButton = document.getElementById('start-button');
const stopListeningButton = document.getElementById('stop-button');
const transcriptDisplay = document.getElementById('transcript-content');

let recognition;
const transcript = new Transcript();
let interimElement = null;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                // Remove interim element if present
                if (interimElement) {
                    interimElement.remove();
                    interimElement = null;
                }
                transcript.updateTranscript(result[0].transcript);
            } else {
                interimTranscript += result[0].transcript;
            }
        }
        // Show interim transcript as a single, updating line
        if (interimTranscript) {
            if (!interimElement) {
                interimElement = document.createElement('p');
                interimElement.style.opacity = '0.6';
                transcript.transcriptContainer.appendChild(interimElement);
            }
            interimElement.textContent = interimTranscript;
        } else if (interimElement) {
            interimElement.remove();
            interimElement = null;
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
} else {
    console.error('Speech recognition not supported in this browser.');
}

startListeningButton.addEventListener('click', () => {
    transcript.clearTranscript();
    recognition.start();
    startListeningButton.disabled = true;
    stopListeningButton.disabled = false;
});

stopListeningButton.addEventListener('click', () => {
    recognition.stop();
    startListeningButton.disabled = false;
    stopListeningButton.disabled = true;
});