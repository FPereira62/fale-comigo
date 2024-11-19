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

// Fonctions utilitaires (placées en haut pour être disponibles partout)
function getGreetingByTime() {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia!";
    if (hour < 18) return "Boa tarde!";
    return "Boa noite!";
}

function getHintByLevel(level) {
    switch(level) {
        case 'A1': return "Vou usar frases simples e claras.";
        case 'A2': return "Podemos praticar situações do dia a dia.";
        case 'B1': return "Vamos conversar sobre temas mais complexos.";
        case 'B2': return "Podemos discutir temas avançados e aspectos culturais.";
        default: return "Como posso ajudar você hoje?";
    }
}

// Fonctions de gestion des chips (tags)
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

// Fonctions de gestion des modales
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
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Fonctions principales
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
        const welcomeMessage = `Olá! ${getGreetingByTime()} 
                              Sou ${currentConfig.role || 'seu assistente'} ${currentConfig.personnalite || 'amigável'}. 
                              Vamos praticar ${currentConfig.theme || 'português'}? 
                              ${getHintByLevel(currentConfig.niveau)}`;
        addBotMessage(welcomeMessage);
    }
}

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

// Fonctions de chat
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
                addBotMessage("Não ouvi nada. Pode repetir, por favor?");
            }
        };

        recognition.start();
    } else {
        alert('O reconhecimento de voz não é suportado pelo seu navegador.');
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

function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }
}

function generateBotResponse(userMessage) {
    setTimeout(() => {
        const themeVocabulary = currentConfig.vocabulaire.join(', ');
        const userMessageLower = userMessage.toLowerCase();
        let response = '';
        let correction = '';

        if (currentConfig.correction_style === 'immediate') {
            if (userMessageLower.includes('eu tem')) {
                correction = "\n💡 Correção: Use 'eu tenho' em vez de 'eu tem'.";
            } else if (userMessageLower.includes('voce pode')) {
                correction = "\n💡 Correção: Não esqueça do acento em 'você'.";
            }
        }

        switch(currentConfig.niveau) {
            case 'A1':
                response = userMessageLower.includes('?') 
                    ? `Vou responder de forma simples. Algumas palavras úteis sobre ${currentConfig.theme}: ${themeVocabulary}`
                    : `Muito bem! Vamos praticar mais? Tente usar estas palavras: ${themeVocabulary.split(',')[0]}`;
                break;
            case 'A2':
                response = userMessageLower.includes('como')
                    ? `Para explicar ${currentConfig.theme}, podemos usar: ${themeVocabulary}. Quer tentar formar uma frase?`
                    : `Boa! Agora vamos tentar usar algumas expressões mais comuns.`;
                break;
            case 'B1':
                response = userMessageLower.includes('pode')
                    ? `Claro! Em ${currentConfig.theme}, existem várias maneiras de se expressar. Que tal usarmos algumas expressões idiomáticas?`
                    : `Você está se expressando bem! Vamos explorar vocabulário mais específico?`;
                break;
            case 'B2':
                response = `Excelente colocação! No contexto de ${currentConfig.theme}, podemos aprofundar mais. O que você acha de discutirmos aspectos culturais?`;
                break;
            default:
                response = `Que interessante! Vamos explorar mais esse tema?`;
        }

        if (currentConfig.objectifs.length > 0) {
            response += `\n\n🎯 Objetivo: ${currentConfig.objectifs[0]}`;
        }

        if (correction) {
            response += correction;
        }

        addBotMessage(response);
    }, 1000);
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
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
