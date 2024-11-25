// Composant de prévisualisation du chatbot
class ChatbotPreview {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.messages = [];
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

        // Initialiser seulement l'interface, pas le chat
        this.initInterface();
    }

    initInterface() {
        // Création de l'interface du chat sans démarrer la conversation
        this.container.innerHTML = `
            <div class="chat-container">
                <div id="chatMessages" class="chat-messages">
                    <div class="chat-placeholder">
                        Remplissez tous les champs requis du formulaire pour voir la prévisualisation du chatbot
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="userInput" placeholder="Écrivez votre message..." disabled>
                    <button type="button" class="voice-button" disabled>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button type="button" class="send-button" disabled>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    initChat() {
        if (this.isInitialized) return;
        
        // Vérifier que tous les champs requis sont remplis
        if (!this.config.theme || !this.config.role || !this.config.niveau || 
            !this.config.contexte || !this.config.personnalite) {
            return;
        }

        // Activer l'interface
        const userInput = document.getElementById('userInput');
        const voiceButton = document.querySelector('.voice-button');
        const sendButton = document.querySelector('.send-button');
        
        if (userInput && voiceButton && sendButton) {
            userInput.disabled = false;
            voiceButton.disabled = false;
            sendButton.disabled = false;

            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleChatMessage();
                }
            });

            voiceButton.onclick = () => this.handleVoiceInput();
            sendButton.onclick = () => this.handleChatMessage();
        }

        // Effacer le placeholder et ajouter le message d'accueil
        document.getElementById('chatMessages').innerHTML = '';
        this.isInitialized = true;
        this.messageCount = 0;
        this.lastMessage = '';
        this.addBotMessage(this.getWelcomeMessage());
    }

    getWelcomeMessage() {
        const role = this.config.role;
        const theme = this.config.theme;
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
        setTimeout(() => {
            const messageLC = userMessage.toLowerCase();
            const responses = [];

            // Réponses basées sur les paramètres de l'activité
            if (this.config.structures.length > 0 && Math.random() > 0.5) {
                const structure = this.config.structures[Math.floor(Math.random() * this.config.structures.length)];
                responses.push(`Você pode tentar usar esta estrutura: "${structure}". Quer tentar?`);
            }

            if (this.config.vocabulaire.length > 0 && Math.random() > 0.7) {
                const mot = this.config.vocabulaire[Math.floor(Math.random() * this.config.vocabulaire.length)];
                responses.push(`Você conhece a palavra "${mot}"? Pode usar em uma frase?`);
            }

            // Réponses contextuelles
            if (messageLC.includes('?')) {
                responses.push('Boa pergunta! Vamos explorar isso juntos.');
            } else if (messageLC.includes('obrigado') || messageLC.includes('obrigada')) {
                responses.push('De nada! Estou aqui para ajudar.');
            }

            // Réponses génériques
            responses.push(
                'Me conte mais sobre isso...',
                'Interessante! E depois?',
                'Como você se sente sobre isso?',
                'Pode explicar melhor?',
                'Entendo... Quer desenvolver essa ideia?'
            );

            // Sélectionner une réponse différente de la dernière
            let response;
            do {
                response = responses[Math.floor(Math.random() * responses.length)];
            } while (response === this.lastMessage && responses.length > 1);

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
        // Éviter les messages répétitifs consécutifs
        if (this.messageCount > 0 && this.lastMessage === message) {
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.textContent = message;
        document.getElementById('chatMessages').appendChild(messageDiv);
        this.scrollToBottom();
        this.speakMessage(message);
        
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
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateConfig(newConfig) {
        this.config = newConfig;
        
        // Ne démarrer le chat que si tous les champs requis sont remplis
        if (!this.isInitialized && 
            newConfig.theme && 
            newConfig.role && 
            newConfig.niveau && 
            newConfig.contexte && 
            newConfig.personnalite) {
            this.initChat();
        } else if (this.isInitialized) {
            // Réinitialiser le chat seulement si la configuration a changé significativement
            const requiresReset = ['theme', 'role', 'niveau'].some(
                key => this.config[key] !== newConfig[key]
            );
            if (requiresReset) {
                this.isInitialized = false;
                this.messages = [];
                this.messageCount = 0;
                this.lastMessage = '';
                document.getElementById('chatMessages').innerHTML = '';
                if (newConfig.theme && newConfig.role && newConfig.niveau &&
                    newConfig.contexte && newConfig.personnalite) {
                    this.initChat();
                } else {
                    this.initInterface();
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
