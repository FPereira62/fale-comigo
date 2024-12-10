// État de l'application
const state = {
    currentActivity: null,
    isRecording: false,
    recognition: null,
    synthesis: window.speechSynthesis,
    db: null,
    currentConversation: null
};

// Éléments DOM
const elements = {
    activitiesSection: document.querySelector('.activities-section'),
    chatSection: document.querySelector('.chat-section'),
    chatMessages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userInput'),
    sendButton: document.getElementById('sendButton'),
    voiceButton: document.getElementById('voiceButton')
};

// Configuration de la reconnaissance vocale
function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        state.recognition = new webkitSpeechRecognition();
        state.recognition.continuous = false;
        state.recognition.interimResults = false;
        state.recognition.lang = 'pt-BR';

        state.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            elements.userInput.value = text;
            sendMessage();
        };

        state.recognition.onerror = (event) => {
            console.error('Erreur de reconnaissance vocale:', event.error);
            stopVoiceRecording();
        };
    }
}

// Fonctions principales
async function startActivity(activity) {
    state.currentActivity = activity;
    elements.activitiesSection.style.display = 'none';
    elements.chatSection.style.display = 'block';
    
    try {
        // Message de bienvenue
        addMessage({
            role: 'assistant',
            content: getWelcomeMessage(activity)
        });
    } catch (error) {
        console.error('Erreur lors du démarrage de l\'activité:', error);
    }
}

function getWelcomeMessage(activity) {
    const messages = {
        '1. Faça-me perguntas básicas': 'Olá! Vou fazer algumas perguntas para praticarmos sua apresentação pessoal. Vamos começar? Como você se chama?',
        '2. Simule uma conversa': 'Oi! Vamos simular uma conversa informal. Imagine que nos encontramos pela primeira vez. Como você me cumprimentaria?'
    };
    return messages[activity] || `Vamos praticar: ${activity}. Estou pronto para começar!`;
}

async function sendMessage() {
    const message = elements.userInput.value.trim();
    if (!message) return;

    try {
        // Ajout du message utilisateur
        addMessage({ role: 'user', content: message });
        
        // Réinitialisation de l'input
        elements.userInput.value = '';
        elements.userInput.style.height = 'auto';

        // Simulation de réponse (à remplacer par l'appel à votre API)
        const response = {
            role: 'assistant',
            content: 'Entendi sua mensagem. Como posso ajudar você a praticar?'
        };
        
        // Ajout de la réponse de l'assistant
        addMessage(response);

        // Synthèse vocale de la réponse
        speakText(response.content);

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        addMessage({
            role: 'assistant',
            content: "Desculpe, ocorreu um erro. Pode tentar novamente?"
        });
    }
}

// Fonctions de reconnaissance vocale
function toggleVoiceRecording() {
    if (!state.recognition) return;

    if (!state.isRecording) {
        startVoiceRecording();
    } else {
        stopVoiceRecording();
    }
}

function startVoiceRecording() {
    if (state.recognition) {
        state.isRecording = true;
        elements.voiceButton.classList.add('recording');
        state.recognition.start();
    }
}

function stopVoiceRecording() {
    if (state.recognition) {
        state.isRecording = false;
        elements.voiceButton.classList.remove('recording');
        state.recognition.stop();
    }
}

// Synthèse vocale
function speakText(text) {
    if (!state.synthesis) return;
    
    // Arrêt de toute synthèse vocale en cours
    state.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    state.synthesis.speak(utterance);
}

// Affichage des messages
function addMessage({ role, content }) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Configuration des événements au chargement
document.addEventListener('DOMContentLoaded', () => {
    setupSpeechRecognition();
    
    // Configuration des gestionnaires d'événements
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            startActivity(title);
        });
    });

    elements.sendButton.addEventListener('click', sendMessage);
    elements.voiceButton.addEventListener('click', toggleVoiceRecording);

    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    elements.userInput.addEventListener('input', () => {
        elements.userInput.style.height = 'auto';
        elements.userInput.style.height = `${elements.userInput.scrollHeight}px`;
    });
});