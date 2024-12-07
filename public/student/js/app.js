// Import Firebase
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Initialisation de Firebase
function initializeFirestore(app) {
    state.db = getFirestore(app);
}

// Gestionnaires d'événements
function setupEventListeners() {
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('click', () => startActivity(card.querySelector('h3').textContent));
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
}

// Fonctions principales
async function startActivity(activity) {
    state.currentActivity = activity;
    elements.activitiesSection.style.display = 'none';
    elements.chatSection.style.display = 'block';
    
    try {
        // Création d'une nouvelle conversation dans Firestore
        const conversationRef = await addDoc(collection(state.db, 'conversations'), {
            activity,
            startedAt: new Date(),
            userId: 'anonymous' // À remplacer par l'ID de l'utilisateur authentifié
        });
        state.currentConversation = conversationRef.id;

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
        
        // Sauvegarde dans Firestore
        await addDoc(collection(state.db, `conversations/${state.currentConversation}/messages`), {
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Réinitialisation de l'input
        elements.userInput.value = '';
        elements.userInput.style.height = 'auto';

        // Simulation de réponse (à remplacer par l'appel à votre API)
        const response = await getAIResponse(message);
        
        // Ajout de la réponse de l'assistant
        addMessage(response);
        
        // Sauvegarde de la réponse dans Firestore
        await addDoc(collection(state.db, `conversations/${state.currentConversation}/messages`), {
            ...response,
            timestamp: new Date()
        });

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
    utterance.lang = 'pt-