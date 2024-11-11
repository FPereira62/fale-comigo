class ChatbotPreview {
    constructor(config) {
        this.config = config;
        this.messages = [];
        this.containerEl = document.getElementById('chatbotPreview');
        this.initialize();
    }

    initialize() {
        // Création de l'interface de chat
        this.containerEl.innerHTML = `
            <div class="chat-container">
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input">
                    <input type="text" id="userInput" placeholder="Écrivez votre message...">
                    <button id="sendButton" class="send-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button id="voiceButton" class="voice-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Ajout des écouteurs d'événements
        this.setupEventListeners();
        
        // Message de bienvenue
        this.addBotMessage(this.getWelcomeMessage());
    }

    setupEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const userInput = document.getElementById('userInput');
        const voiceButton = document.getElementById('voiceButton');

        sendButton.addEventListener('click', () => this.handleUserInput());
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

        voiceButton.addEventListener('click', () => this.toggleVoiceRecognition());
    }

    handleUserInput() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        
        if (message) {
            this.addUserMessage(message);
            userInput.value = '';
            this.generateBotResponse(message);
        }
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
    }

    getWelcomeMessage() {
        return `Bonjour ! Je suis votre ${this.config.role} ${this.config.personnalite}. 
                Je suis là pour vous aider avec ${this.config.theme}. 
                Comment puis-je vous aider ?`;
    }

    generateBotResponse(userMessage) {
        // Simulation d'une réponse différée
        setTimeout(() => {
            let response;
            
            // Réponse basée sur le niveau et le style de correction
            if (this.config.correction_style === 'immediate') {
                response = this.generateImmediateResponse(userMessage);
            } else if (this.config.correction_style === 'delayed') {
                response = this.generateDelayedResponse(userMessage);
            } else {
                response = this.generateSelectiveResponse(userMessage);
            }

            this.addBotMessage(response);
        }, 1000);
    }

    generateImmediateResponse(userMessage) {
        // Exemple de réponse immédiate basée sur le niveau
        switch(this.config.niveau) {
            case 'A1':
                return "Je comprends. Permettez-moi de vous aider avec une structure simple.";
            case 'A2':
                return "Bien ! Essayons d'enrichir votre vocabulaire.";
            case 'B1':
                return "Excellent ! Travaillons sur la fluidité de l'expression.";
            case 'B2':
                return "Parfait ! Approfondissons les nuances de la langue.";
            default:
                return "Je vous écoute. Comment puis-je vous aider ?";
        }
    }

    generateDelayedResponse(userMessage) {
        return "Je note vos erreurs et nous les reverrons à la fin de la conversation.";
    }

    generateSelectiveResponse(userMessage) {
        return "Continuons la conversation. Je vous aide quand c'est nécessaire.";
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    toggleVoiceRecognition() {
        // Implémentation de la reconnaissance vocale
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'fr-FR';
            recognition.start();

            recognition.onresult = (event) => {
                const message = event.results[0][0].transcript;
                document.getElementById('userInput').value = message;
            };
        } else {
            alert('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
        }
    }
}

// Export de la classe
window.ChatbotPreview = ChatbotPreview;
