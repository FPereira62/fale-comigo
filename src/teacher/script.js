// État global
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

// Fonctions vocales
function initBotVoice() {
    speechSynthesis.addEventListener('voiceschanged', () => {
        const voices = speechSynthesis.getVoices();
        botVoice = voices.find(voice => voice.lang.includes('pt')) || voices[0];
    });
}

function speakBotMessage(text) {
    if (speechSynthesis && botVoice) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = botVoice;
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

// Fonctions pour les chips
function addChip(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (value) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `${value}<button type="button" onclick="removeChip(this)">&times;</button>`;
        container.appendChild(chip);
        input.value = '';
        updateAddButton(containerId);
        updateFormState();
    }
}

function removeChip(button) {
    const chip = button.parentElement;
    const container = chip.parentElement;
    chip.remove();
    updateAddButton(container.id);
    updateFormState();
}

function updateAddButton(containerId) {
    const container = document.getElementById(containerId);
    const addButton = container.nextElementSibling.querySelector('button');
    if (container.children.length === 0) {
        addButton.classList.add('empty');
    } else {
        addButton.classList.remove('empty');
    }
}

function getChipsValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return Array.from(container.children)
        .map(chip => chip.textContent.trim().replace('×', ''))
        .filter(text => text.length > 0);
}

// Gestion des modales
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.offsetHeight;
        modal.classList.add('visible');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// Vérification de la configuration
function verifierConfig() {
    updateFormState();
    
    document.getElementById('review-info').innerHTML = `
        <p><strong>Thème:</strong> ${currentConfig.theme}</p>
        <p><strong>Niveau:</strong> ${currentConfig.niveau}</p>
        <p><strong>Contexte:</strong> ${currentConfig.contexte}</p>
    `;

    document.getElementById('review-chatbot').innerHTML = `
        <p><strong>Rôle:</strong> ${currentConfig.role}</p>
        <p><strong>Personnalité:</strong> ${currentConfig.personnalite}</p>
        <p><strong>Objectifs:</strong></p>
        <div>${currentConfig.objectifs.map(obj => `<span class="badge">${obj}</span>`).join(' ')}</div>
    `;

    document.getElementById('review-params').innerHTML = `
        <p><strong>Structures grammaticales:</strong></p>
        <div>${currentConfig.structures.map(str => `<span class="badge">${str}</span>`).join(' ')}</div>
        <p><strong>Vocabulaire:</strong></p>
        <div>${currentConfig.vocabulaire.map(voc => `<span class="badge">${voc}</span>`).join(' ')}</div>
        <p><strong>Style de correction:</strong> ${currentConfig.correction_style}</p>
        <p><strong>Niveau d'aide:</strong> ${currentConfig.aide_niveau}</p>
    `;

    showModal('verificationModal');
}

// Fonctions du chat
function handleChatMessage(event) {
    event.preventDefault();
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (message) {
        addUserMessage(message);
        userInput.value = '';
        generateBotResponse(message);
    }
}

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
    } else {
        alert('O reconhecimento de voz não é suportado pelo seu navegador.');
    }
}

function generateBotResponse(userMessage) {
    setTimeout(() => {
        const messageLC = userMessage.toLowerCase();
        let response = '';

        if (messageLC.includes('oi') || messageLC.includes('olá')) {
            response = 'Oi! Tudo bem? Como posso ajudar você hoje?';
        } else if (messageLC.includes('?')) {
            response = 'Boa pergunta! Vamos explorar isso juntos.';
        } else {
            response = 'Me conte mais sobre isso...';
        }

        addBotMessage(response);
    }, 1000);
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

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Mise à jour de l'état
function updateFormState() {
    currentConfig = {
        theme: document.getElementById('theme').value,
        niveau: document.getElementById('niveau').value,
        contexte: document.getElementById('contexte').value,
        role: document.getElementById('role').value,
        personnalite: document.getElementById('personnalite').value,
        objectifs: getChipsValues('objectifs'),
        structures: getChipsValues('structures'),
        vocabulaire: getChipsValues('vocabulaire'),
        correction_style: document.getElementById('correction_style').value,
        aide_niveau: document.getElementById('aide_niveau').value
    };

    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages && chatMessages.children.length === 0) {
        addBotMessage(`Olá! Vamos praticar ${currentConfig.theme}?`);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initBotVoice();

    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            updateAddButton(id);
            container.setAttribute('role', 'list');
        }
    });

    const form = document.getElementById('configForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            closeModal('verificationModal');
            const saveSuccess = await saveToFirestore(currentConfig);
            if (saveSuccess) {
                showModal('successModal');
            } else {
                alert('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
            }
        });
    }

    ['newObjectif', 'newStructure', 'newVocab'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip(this.id.replace('new', '').toLowerCase(), this.id);
                }
            });
        }
    });

    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleChatMessage(e);
            }
        });
    }

    updateFormState();

    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateFormState);
        input.addEventListener('input', updateFormState);
    });
});
