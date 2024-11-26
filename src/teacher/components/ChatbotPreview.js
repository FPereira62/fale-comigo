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

        this.initInterface();
    }

    initInterface() {
        this.container.innerHTML = `
            <div class="chat-container" role="region" aria-label="Zone de chat">
                <div id="chatMessages" class="chat-messages" role="log" aria-live="polite">
                    <div class="chat-placeholder">
                        Remplissez tous les champs requis du formulaire pour voir la prévisualisation du chatbot
                    </div>
                </div>
                <div class="chat-input">
                    <label for="userInput" class="sr-only">Message à envoyer</label>
                    <input 
                        type="text" 
                        id="userInput" 
                        placeholder="Écrivez votre message..." 
                        aria-label="Message à envoyer"
                        disabled
                    >
                    <button 
                        type="button" 
                        class="voice-button" 
                        aria-label="Activer la reconnaissance vocale"
                        disabled
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button 
                        type="button" 
                        class="send-button" 
                        aria-label="Envoyer le message"
                        disabled
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Ajout des écouteurs d'événements
        const input = document.getElementById('userInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleChatMessage();
                }
            });
        }
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

            voiceButton.onclick = () => this.handleVoiceInput();
            sendButton.onclick = () => this.handleChatMessage();
        }

        // Effacer le placeholder et ajouter le message d'accueil
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
        this.isInitialized = true;
        this.messageCount = 0;
        this.lastMessage = '';
        this.addBotMessage(this.getWelcomeMessage());
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        messageDiv.setAttribute('role', 'listitem');
        messageDiv.setAttribute('aria-label', `Votre message : ${message}`);
        messageDiv.textContent = message;
        document.getElementById('chatMessages').appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        if (this.messageCount > 0 && this.lastMessage === message) {
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.setAttribute('role', 'listitem');
        messageDiv.setAttribute('aria-label', `Message du chatbot : ${message}`);
        messageDiv.textContent = message;
        document.getElementById('chatMessages').appendChild(messageDiv);
        this.scrollToBottom();
        this.speakMessage(message);
        
        this.lastMessage = message;
        this.messageCount++;
    }

    // ... reste du code inchangé ...
}

// Ajout des styles pour masquer visuellement les labels tout en les gardant accessibles
const style = document.createElement('style');
style.textContent = `
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
`;
document.head.appendChild(style);
