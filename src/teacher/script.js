// État global et configuration
let currentConfig = {
    theme: '',
    niveau: '',
    contexte: '',
    role: '',
    personnalite: '',
    objectifs: [],
    structures: [],
    vocabulaire: [],
    correction_style: 'immediate',
    aide_niveau: 'minimal'
};

// Configuration vocale
let speechSynthesis = window.speechSynthesis;
let botVoice = null;

// Initialisation de la voix portugaise
function initBotVoice() {
    speechSynthesis.addEventListener('voiceschanged', () => {
        const voices = speechSynthesis.getVoices();
        botVoice = voices.find(voice => voice.lang.includes('pt')) || voices[0];
    });
}

// Synthèse vocale pour le bot
function speakBotMessage(text) {
    if (speechSynthesis && botVoice) {
        speechSynthesis.cancel(); // Arrête toute synthèse en cours
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = botVoice;
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

// Fonctions de réponses thématiques
function getThematicResponse(message, theme, level) {
    const responses = {
        'viagens': {
            'A1': getA1TravelResponses(message),
            'A2': getA2TravelResponses(message),
            'B1': getB1TravelResponses(message),
            'B2': getB2TravelResponses(message)
        },
        'gastronomia': {
            'A1': getA1FoodResponses(message),
            'A2': getA2FoodResponses(message),
            'B1': getB1FoodResponses(message),
            'B2': getB2FoodResponses(message)
        }
    };
    
    return responses[theme]?.[level] || getDefaultResponse(message);
}

// Réponses pour le thème Voyages
function getA1TravelResponses(message) {
    const messageLC = message.toLowerCase();
    const responses = {
        'gost': ['Legal! Para onde você quer viajar?', 'Que bom! Você prefere praia ou montanha?'],
        'praia': ['A praia é muito bonita! Você nada no mar?'],
        'montanha': ['As montanhas são lindas! Você gosta de fazer trilha?'],
        'default': ['Me conte mais...', 'Que interessante! Continue...']
    };

    return chooseResponse(messageLC, responses);
}

function getA2TravelResponses(message) {
    const messageLC = message.toLowerCase();
    const responses = {
        'hotel': ['Você prefere hotel ou pousada?'],
        'transport': ['Como você prefere viajar: de avião ou de carro?'],
        'país': ['Você já viajou para outro país?'],
        'default': ['Conte mais sobre sua experiência...']
    };

    return chooseResponse(messageLC, responses);
}

// Fonctions utilitaires
function chooseResponse(message, responses) {
    for (const [key, options] of Object.entries(responses)) {
        if (message.includes(key)) {
            return options[Math.floor(Math.random() * options.length)];
        }
    }
    return responses.default[Math.floor(Math.random() * responses.default.length)];
}

// Gestion des messages du chatbot
function generateBotResponse(userMessage) {
    setTimeout(() => {
        const response = getThematicResponse(userMessage, currentConfig.theme, currentConfig.niveau);
        const correction = currentConfig.correction_style === 'immediate' ? 
            getCorrection(userMessage.toLowerCase()) : null;

        addBotMessage(correction ? `${response}\n💡 ${correction}` : response);
    }, 1000);
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
        speakBotMessage(message);
    }
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }
}

// Gestion de la reconnaissance vocale
function handleVoiceInput(event) {
    event.preventDefault();
    const voiceButton = event.currentTarget;
    
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            voiceButton.style.backgroundColor = '#dc3545';
            speechSynthesis.cancel();
            addBotMessage("Estou ouvindo... Pode falar!");
        };

        recognition.onend = () => {
            voiceButton.style.backgroundColor = '';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            addUserMessage(transcript);
            generateBotResponse(transcript);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                addBotMessage("Não ouvi nada. Pode repetir?");
            }
        };

        recognition.start();
    }
}

// Corrections grammaticales
function getCorrection(message) {
    const corrections = {
        'eu tem': 'seria "eu tenho"',
        'voce pode': 'com acento: "você pode"',
        'nós vai': 'seria "nós vamos"',
        'eles tem': 'com acento: "eles têm"'
    };

    for (const [error, correction] of Object.entries(corrections)) {
        if (message.includes(error)) {
            return correction;
        }
    }
    return null;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initBotVoice();
    updateFormState();

    // Gestion des événements
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleChatMessage(e);
            }
        });
    }

    // Message de bienvenue
    const welcomeMessage = `Olá! Vamos praticar ${currentConfig.theme}?`;
    addBotMessage(welcomeMessage);
});
