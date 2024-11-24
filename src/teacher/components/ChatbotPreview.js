// Composant de prévisualisation du chatbot
class ChatbotPreview {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.messages = [];
        this.voices = [];
        this.selectedVoice = null;
        
        // Initialisation de la synthèse vocale
        if ('speechSynthesis' in window) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                this.voices = speechSynthesis.getVoices();
                this.selectedVoice = this.voices.find(voice => voice.lang === 'pt-BR') || 
                                   this.voices.find(voice => voice.lang.startsWith('pt')) ||
                                   this.voices[0];
            });
        }

        this.init();
    }

    init() {
        // Création de l'interface du chat
        this.container.innerHTML = `
            <div class="chat-container">
                <div id="chatMessages" class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" id="userInput" placeholder="Écrivez votre message...">
                    <button type="button" class="voice-button" onclick="chatbotPreview.handleVoiceInput()">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button type="button" class="send-button" onclick="chatbotPreview.handleChatMessage()">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    
        // Ajout des écouteurs d'événements
        const input = document.getElementById('userInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleChatMessage();
            }
        });
    
        // Message d'accueil uniquement si les informations nécessaires sont disponibles
        if (this.config.theme && this.config.role) {
            this.addBotMessage(this.getWelcomeMessage());
        }
    }

    getWelcomeMessage() {
        const role = this.config.role || 'assistant';
        const theme = this.config.theme || 'portugais';
        return `Olá! Eu sou seu ${role} para praticar ${theme}. Como posso ajudar você hoje?`;
    }

    handleChatMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (message) {
            this.addUserMessage(message);
            input.value = '';
            this.generateBotResponse(message);
        }
    }

    handleVoiceInput() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        const voiceButton = document.querySelector('.voice-button');
        voiceButton.classList.add('recording');

        recognition.onstart = () => {
            speechSynthesis.cancel();
            this.addBotMessage("Estou ouvindo... Pode falar!");
        };

        recognition.onend = () => {
            voiceButton.classList.remove('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('userInput').value = transcript;
            this.handleChatMessage();
        };

        recognition.onerror = (event) => {
            voiceButton.classList.remove('recording');
            if (event.error === 'no-speech') {
                this.addBotMessage("Não ouvi nada. Pode repetir?");
            }
        };

        recognition.start();
    }

    generateBotResponse(userMessage) {
        // Simuler un délai de "réflexion"
        setTimeout(() => {
            let response;
            const messageLC = userMessage.toLowerCase();

            // Logique de réponse basée sur la configuration
            if (this.config.structures.length > 0 && Math.random() > 0.5) {
                // Utiliser une structure grammaticale comme exemple
                const structure = this.config.structures[Math.floor(Math.random() * this.config.structures.length)];
                response = `Você pode tentar usar esta estrutura: "${structure}". Quer tentar?`;
            } else if (this.config.vocabulaire.length > 0 && Math.random() > 0.7) {
                // Suggérer du vocabulaire
                const mot = this.config.vocabulaire[Math.floor(Math.random() * this.config.vocabulaire.length)];
                response = `Você conhece a palavra "${mot}"? Pode usar em uma frase?`;
            } else if (messageLC.includes('?')) {
                response = 'Boa pergunta! Vamos explorar isso juntos.';
            } else if (messageLC.includes('obrigado') || messageLC.includes('obrigada')) {
                response = 'De nada! Estou aqui para ajudar.';
            } else {
                const responses = [
                    'Me conte mais sobre isso...',
                    'Interessante! E depois?',
                    'Como você se sente sobre isso?',
                    'Pode explicar melhor?',
                    'Entendo... Quer desenvolver essa ideia?'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            }

            this.addBotMessage(response);
        }, 1000);
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        messageDiv.textContent = message;
        document.getElementById('chatMessages').appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.textContent = message;
        document.getElementById('chatMessages').appendChild(messageDiv);
        this.scrollToBottom();
        this.speakMessage(message);
    }

    speakMessage(message) {
        if (this.selectedVoice && !speechSynthesis.speaking) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.voice = this.selectedVoice;
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateConfig(newConfig) {
        this.config = newConfig;
        // Réinitialiser le chat avec la nouvelle configuration
        this.messages = [];
        document.getElementById('chatMessages').innerHTML = '';
        this.addBotMessage(this.getWelcomeMessage());
    }
}

// Instance globale pour la prévisualisation
let chatbotPreview;

// Fonction de mise à jour de la prévisualisation
function updateChatbotPreview() {
    if (!chatbotPreview) {
        chatbotPreview = new ChatbotPreview('chatbotPreview', currentConfig);
    } else {
        chatbotPreview.updateConfig(currentConfig);
    }
}
