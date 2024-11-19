// Configuration globale et état
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

// Fonctions utilitaires principales
function getGreetingByTime() {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
}

function getHintByLevel(level) {
    switch(level) {
        case 'A1': return "Vou usar frases simples e claras";
        case 'A2': return "Podemos praticar situações do dia a dia";
        case 'B1': return "Vamos conversar sobre temas mais complexos";
        case 'B2': return "Podemos discutir temas avançados";
        default: return "Como posso ajudar você hoje?";
    }
}

// Fonctions de conversation naturelle
function getPreferenceResponse(theme) {
    const preferences = {
        'viagens': 'Adoro viajar! Conhecer lugares novos é muito especial',
        'comida': 'A culinária brasileira é maravilhosa! Você já provou feijoada?',
        'esportes': 'Futebol, vôlei... O Brasil é o país do esporte!',
        'música': 'A música brasileira é muito rica. Do samba ao funk',
        'cultura': 'A cultura brasileira é muito diversa e colorida',
        default: `${theme} é um assunto fascinante! Qual sua experiência com isso?`
    };
    return preferences[theme.toLowerCase()] || preferences.default;
}

function getA1Response(message) {
    if (message.includes('?')) {
        return `Sim! ${getSimpleContext(currentConfig.theme)}. E você?`;
    }
    return `Legal! Me conte mais sobre isso.`;
}

function getA2Response(message) {
    if (message.includes('porque')) {
        return `Ah, entendi! ${getSimpleContext(currentConfig.theme)}. O que você acha?`;
    }
    return `Que interessante! Quer me contar mais?`;
}

function getB1Response(message) {
    if (message.includes('acho')) {
        return `Seu ponto de vista é muito interessante! ${getComplexContext(currentConfig.theme)}`;
    }
    return `Que legal sua opinião! Vamos explorar mais esse assunto?`;
}

function getB2Response(message) {
    const contexts = getComplexContext(currentConfig.theme);
    return `${contexts}. Como você vê isso na sua experiência?`;
}

function getSimpleContext(theme) {
    const contexts = {
        'viagens': 'viajar nos traz muitas experiências novas',
        'comida': 'cada região tem seus pratos típicos',
        'esportes': 'fazer esporte é bom para a saúde',
        'música': 'a música expressa nossos sentimentos',
        'cultura': 'cada lugar tem seus costumes especiais',
        default: `${theme} faz parte do nosso dia a dia`
    };
    return contexts[theme.toLowerCase()] || contexts.default;
}

function getComplexContext(theme) {
    const contexts = {
        'viagens': 'cada viagem nos transforma de alguma forma',
        'comida': 'a gastronomia conta a história de um povo',
        'esportes': 'o esporte une as pessoas de maneira única',
        'música': 'a música reflete as mudanças da sociedade',
        'cultura': 'a diversidade cultural nos enriquece',
        default: `${theme} tem múltiplas perspectivas interessantes`
    };
    return contexts[theme.toLowerCase()] || contexts.default;
}

function getCorrection(message) {
    const corrections = {
        'eu tem': 'usamos "eu tenho"',
        'voce pode': 'não esqueça o acento em "você"',
        'nós vai': 'usamos "nós vamos"',
        'eles tem': 'usamos "eles têm"',
        'tu é': 'usamos "tu és"'
    };
    
    for (let error in corrections) {
        if (message.includes(error)) {
            return corrections[error];
        }
    }
    return null;
}

// Gestion des chips (tags)
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
    addButton.classList.toggle('empty', container.children.length === 0);
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

// Fonctions principales
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
        const welcomeMessage = `${getGreetingByTime()}! 
                              Sou ${currentConfig.role || 'seu assistente'} ${currentConfig.personnalite || 'amigável'}. 
                              Vamos conversar sobre ${currentConfig.theme || 'vários assuntos'}? 
                              ${getHintByLevel(currentConfig.niveau)}`;
        addBotMessage(welcomeMessage);
    }
}

// Gestion du chat
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
            addBotMessage("Pode falar! Estou ouvindo...");
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
                addBotMessage("Não ouvi nada. Pode falar de novo?");
            }
        };

        recognition.start();
    } else {
        alert('O reconhecimento de voz não é suportado pelo seu navegador.');
    }
}

function generateBotResponse(userMessage) {
    setTimeout(() => {
        const userMessageLower = userMessage.toLowerCase();
        let response = '';

        // Salutations
        if (userMessageLower.includes('oi') || userMessageLower.includes('olá')) {
            response = `${getGreetingByTime()}! Que bom conversar sobre ${currentConfig.theme}!`;
            addBotMessage(response);
            return;
        }

        // Questions personnelles
        if (userMessageLower.includes('você') || userMessageLower.includes('voce')) {
            if (userMessageLower.includes('gosta')) {
                response = getPreferenceResponse(currentConfig.theme);
                addBotMessage(response);
                return;
            }
        }

        // Réponses selon niveau
        switch(currentConfig.niveau) {
            case 'A1': response = getA1Response(userMessageLower); break;
            case 'A2': response = getA2Response(userMessageLower); break;
            case 'B1': response = getB1Response(userMessageLower); break;
            case 'B2': response = getB2Response(userMessageLower); break;
            default: response = `Que interessante! Vamos falar mais sobre isso?`;
        }

        // Correction si nécessaire
        if (currentConfig.correction_style === 'immediate') {
            const correction = getCorrection(userMessageLower);
            if (correction) {
                response += `\n💡 Dica: ${correction}`;
            }
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
    }
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

    // Gestion des touches
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

    // Initialisation du formulaire
    updateFormState();

    // Mise à jour en temps réel
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateFormState);
        input.addEventListener('input', updateFormState);
    });
});
