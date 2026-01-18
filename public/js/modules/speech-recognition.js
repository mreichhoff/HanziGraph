// Speech-to-text module for voice search
import { hanziBox, searchControl } from "./dom";
import { search } from "./search";
import { getActiveGraph } from "./options";
import { isAiEligible } from "./data-layer";

const speechButton = document.getElementById('search-speech-button');

// Check for browser support (with vendor prefix for Safari)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;
let permissionDenied = false;

function isSpeechRecognitionSupported() {
    return !!SpeechRecognition;
}

function showButton() {
    if (speechButton && !permissionDenied) {
        speechButton.style.display = '';
    }
}

function hideButton() {
    if (speechButton) {
        speechButton.style.display = 'none';
    }
}

function setListeningState(listening) {
    isListening = listening;
    if (speechButton) {
        if (listening) {
            speechButton.classList.add('listening');
            speechButton.setAttribute('aria-label', 'Stop listening');
        } else {
            speechButton.classList.remove('listening');
            speechButton.setAttribute('aria-label', 'Voice search');
        }
    }
}

function getLanguageForRecognition() {
    const graph = getActiveGraph();
    // Map our locale settings to BCP 47 language tags for speech recognition
    if (graph.locale === 'zh-CN' || graph.locale === 'simplified') {
        return 'zh-CN'; // Mandarin Chinese (Simplified)
    } else if (graph.locale === 'zh-TW' || graph.locale === 'traditional') {
        return 'zh-TW'; // Mandarin Chinese (Traditional)
    } else if (graph.locale === 'yue' || graph.locale === 'cantonese') {
        return 'yue-Hant-HK'; // Cantonese
    }
    // Default to Simplified Chinese
    return 'zh-CN';
}

function startListening() {
    if (!SpeechRecognition || permissionDenied) {
        return;
    }

    // Create a new recognition instance each time (some browsers require this)
    recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = getLanguageForRecognition();

    recognition.onstart = () => {
        setListeningState(true);
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            hanziBox.value = transcript;
            // Close the search controls
            searchControl.style.display = 'none';
            // Trigger the search
            search(transcript, getActiveGraph().locale, 'explore');
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListeningState(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            // User denied microphone permission - hide the button permanently
            permissionDenied = true;
            hideButton();
        } else if (event.error === 'no-speech') {
            alert('No speech was detected. Please try again.');
        } else if (event.error === 'aborted') {
            alert('Speech recognition was aborted. Please try again.');
        } else {
            // Other errors - could show a message, but for now just log
            console.warn('Speech recognition failed:', event.error);
        }
    };

    recognition.onend = () => {
        setListeningState(false);
    };

    try {
        recognition.start();
    } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setListeningState(false);
    }
}

function stopListening() {
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            // Ignore errors when stopping
        }
    }
    setListeningState(false);
}

function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function initialize() {
    // Only show the button if speech recognition is supported and user is AI-eligible
    if (!isSpeechRecognitionSupported()) {
        hideButton();
        return;
    }

    // Initially hide - will be shown when search box is focused (by showControlsIfEligible in search.js)
    hideButton();

    if (speechButton) {
        speechButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleListening();
        });
    }

    // Listen for AI eligibility...hide button if not eligible
    document.addEventListener('ai-eligibility-changed', (event) => {
        if (!event.detail || permissionDenied || !isSpeechRecognitionSupported()) {
            hideButton();
        }
    });
}

export { initialize, isSpeechRecognitionSupported, showButton, hideButton };
