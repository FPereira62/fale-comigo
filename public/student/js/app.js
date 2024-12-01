// Configuration
const OPENAI_API_KEY = 'your-api-key';  // À remplacer par votre clé API

// État de l'application
let currentActivity = null;
let isRecording = false;

// Éléments DOM
const activitiesSection = document.querySelector('.activities-section');
const chatSection = document.querySelector('.chat-section');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const voiceButton = document.getElementById('voiceButton');

// Gestionnaires d'événements
document.querySelectorAll('.activity-card').forEach(card => {
    card.addEventListener('click', () => startActivity(card.querySelector('h3').textContent));
});

sendButton.addEventListener('click', sendMessage);
voiceButton.addEventListener('click', toggleVoiceRecording);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize du textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
});

// Fonctions principales
function startActivity(activity) {
    currentActivity = activity;
    activitiesSection.style.display = 'none';
    chatSection.style.display = 'block';
    
    // Message de bienvenue
    addMessage({
        role: 'assistant',
        content: `Bonjour! Nous allons pratiquer : ${activity}. Je suis prêt à commencer quand vous voulez.`
    });
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Ajouter le message de l'utilisateur
    addMessage({ role: 'user', content: message });
    userInput.value = '';
    userInput.style.height = 'auto';

    try {
        const response = await callOpenAI(message);
        addMessage(response);
        // Synthèse vocale de la réponse
        speakText(response.content);
    } catch (error) {
        console.error('Erreur:', error);
        addMessage({
            role: 'assistant',
            content: "Désolé, une erreur s'est produite. Pouvez-vous réessayer?"
        });
    }
}

// Reconnaissance vocale
function toggleVoiceRecording() {
    if (!isRecording) {
        startVoiceRecording();
    } else {
        stopVoiceRecording();
    }
    isRecording = !isRecording;
    voiceButton.classList.toggle('recording');
}

function startVoiceRecording() {
    // À implémenter avec l'API Web Speech
    console.log('Début enregistrement...');
}

function stopVoiceRecording() {
    // À implémenter avec l'API Web Speech
    console.log('Fin enregistrement...');
}

// Synthèse vocale
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';  // Portugais du Brésil
    speechSynthesis.speak(utterance);
}

// Affichage des messages
function addMessage({ role, content }) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Appel à l'API OpenAI
async function callOpenAI(message) {
    // Simulé pour le moment - à remplacer par un vrai appel API
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                role: 'assistant',
                content: "Je comprends votre message. Comment puis-je vous aider à pratiquer?"
            });
        }, 1000);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Code d'initialisation si nécessaire
});