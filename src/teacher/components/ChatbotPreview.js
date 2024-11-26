// Composant de prévisualisation du chatbot
class ChatbotPreview {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.voices = [];
        this.selectedVoice = null;
        this.isInitialized = false;
        this.messageCount = 0;
        this.lastMessage = '';
        
        // Initialisation de la synthèse vocale
        if ('speechSynthesis' in window) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                this.voices = speechSynthesis.getVoices();
                this.selectedVoice = this.voices.find(voice => voice.lang === 'pt-BR') || 
                                   this.voices.find(voice => voice.lang.startsWith('pt')) ||
                                   this.voices[0];
            });
        }

        this.initInterface();
    }

    initInterface() {
        this.container.innerHTML = `
            <div class="chat-container" role="region" aria-label="Prévisualisation du chat">
                <div id="chatMessages" class="chat-messages" role="log" aria-live="polite">
                    <div class="chat-placeholder">
                        Remplissez d'abord les informations de l'activité pour voir la prévisualisation
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" 
                           id="userInput" 
                           placeholder="Écrivez votre message..." 
                           disabled
                           aria-label="Message à envoyer">
                    <button type="button" 
                            class="voice-button" 
                            disabled
                            aria-label="Activer la reconnaissance vocale">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" 
                                  stroke-width="2" 
                                  stroke-linecap="round" 
                                  stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button type="button" 
                            class="send-button" 
                            disabled
                            aria-label="Envoyer le message">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" 
                                  stroke-width="2" 
                                  stroke-linecap="round" 
                                  stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const userInput = document.getElementById('userInput');
        const voiceButton = this.container.querySelector('.voice-button');
        const sendButton = this.container.querySelector('.send-button');

        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !userInput.disabled) {
                    e.preventDefault();
                    this.handleChatMessage();
                }
            });
        }

        if (voiceButton) {
            voiceButton.addEventListener('click', () => {
                if (!voiceButton.disabled) {
                    this.handleVoiceInput();
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => {
                if (!sendButton.disabled) {
                    this.handleChatMessage();
                }
            });
        }
    }

    canInitialize() {
        return this.config.theme && 
               this.config.role && 
               this.config.niveau && 
               this.config.contexte && 
               this.config.personnalite;
    }

    initChat() {
        if (this.isInitialized || !this.canInitialize()) return;

        const userInput = document.getElementById('userInput');
        const voiceButton = this.container.querySelector('.voice-button');
        const sendButton = this.container.querySelector('.send-button');
        const messagesContainer = document.getElementById('chatMessages');

        if (userInput && voiceButton && sendButton && messagesContainer) {
            userInput.disabled = false;
            voiceButton.disabled = false;
            sendButton.disabled = false;
            messagesContainer.innerHTML = '';
            
            this.isInitialized = true;
            this.messageCount = 0;
            this.lastMessage = '';
            
            this.addBotMessage(this.getWelcomeMessage());
        }
    }

    getWelcomeMessage() {
        const role = this.config.role || 'assistant';
        const theme = this.config.theme || 'conversation';
        return `Olá! Eu sou seu ${role} para praticar ${theme}. Como posso ajudar você hoje?`;
    }

    handleChatMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        
        if (message) {
            this.addUserMessage(message);
            userInput.value = '';
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

        const voiceButton = this.container.querySelector('.voice-button');
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
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = transcript;
                this.handleChatMessage();
            }
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
        setTimeout(() => {
            const messageLC = userMessage.toLowerCase();
            let response = null;

            // Utiliser les structures grammaticales
            if (this.config.structures.length > 0 && Math.random() > 0.6) {
                const structure = this.config.structures[Math.floor(Math.random() * this.config.structures.length)];
                response = `Você pode tentar usar esta estrutura: "${structure}". Quer tentar?`;
            }
            // Suggérer du vocabulaire
            else if (this.config.vocabulaire.length > 0 && Math.random() > 0.7) {
                const mot = this.config.vocabulaire[Math.floor(Math.random() * this.config.vocabulaire.length)];
                response = `Você conhece a palavra "${mot}"? Pode usar em uma frase?`;
            }
            // Réponses contextuelles
            else if (messageLC.includes('?')) {
                response = 'Boa pergunta! Vamos explorar isso juntos.';
            }
            else if (messageLC.includes('obrigado') || messageLC.includes('obrigada')) {
                response = 'De nada! Estou aqui para ajudar.';
            }
            // Réponses génériques
            else {
                const responses = [
                    'Me conte mais sobre isso...',
                    'Interessante! E depois?',
                    'Como você se sente sobre isso?',
                    'Pode explicar melhor?',
                    'Entendo... Quer desenvolver essa ideia?'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            }

            // Éviter la répétition de la dernière réponse
            if (response === this.lastMessage) {
                this.generateBotResponse(userMessage); // Regénérer une réponse
                return;
            }

            this.addBotMessage(response);
        }, 1000);
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        messageDiv.setAttribute('role', 'listitem');
        messageDiv.setAttribute('aria-label', `Vous : ${message}`);
        messageDiv.textContent = message;
        
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }
    }

    addBotMessage(message) {
        if (this.messageCount > 0 && this.lastMessage === message) {
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.setAttribute('role', 'listitem');
        messageDiv.setAttribute('aria-label', `Chatbot : ${message}`);
        messageDiv.textContent = message;
        
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
            this.speakMessage(message);
        }
        
        this.lastMessage = message;
        this.messageCount++;
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
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    updateConfig(newConfig) {
        this.config = newConfig;
        
        if (!this.isInitialized && this.canInitialize()) {
            this.initChat();
        } else if (this.isInitialized) {
            const requiresReset = ['theme', 'role', 'niveau'].some(
                key => this.config[key] !== newConfig[key]
            );
            
            if (requiresReset) {
                this.isInitialized = false;
                this.messageCount = 0;
                this.lastMessage = '';
                this.initInterface();
                if (this.canInitialize()) {
                    this.initChat();
                }
            }
        }
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
