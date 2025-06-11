class Transcript {
    constructor() {
        this.transcriptContainer = document.getElementById('transcript-content');
    }

    updateTranscript(text) {
        // Only add if text is not empty and not the same as the last entry
        if (!text) return;
        const lastEntry = this.transcriptContainer.lastElementChild;
        if (lastEntry && lastEntry.textContent === text) return;
        const transcriptEntry = document.createElement('p');
        transcriptEntry.textContent = text;
        this.transcriptContainer.appendChild(transcriptEntry);
    }

    clearTranscript() {
        this.transcriptContainer.innerHTML = '';
    }
}

export default Transcript;