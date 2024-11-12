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

// Fonctions de gestion des chips (tags)
function addChip(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (value) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            ${value}
            <button type="button" onclick="removeChip(this)">&times;</button>
        `;
        container.appendChild(chip);
        input.value = '';
        updateAddButton(containerId);
        updateFormState(); // Met à jour la prévisualisation
    }
}

function removeChip(button) {
    const chip = button.parentElement;
    const container = chip.parentElement;
    chip.remove();
    updateAddButton(container.id);
    updateFormState(); // Met à jour la prévisualisation
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
        modal.offsetHeight; // Force un reflow
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

// Fonction de vérification de la configuration
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

// Fonction pour sauvegarder dans Firestore
async function saveToFirestore(config) {
    try {
        const docRef = await db.collection('activites').add({
            ...config,
            dateCreation: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Document sauvegardé avec ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde: ", error);
        return false;
    }
}

// Fonction de réinitialisation du formulaire
function resetForm() {
    document.getElementById('configForm').reset();
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
            updateAddButton(id);
        }
    });
    updateFormState();
    closeModal('successModal');
}
// Fonctions de gestion du chat
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

    // Initialise ou met à jour le chat si nécessaire
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages && chatMessages.children.length === 0) {
        addBotMessage(`Bonjour ! Je suis votre ${currentConfig.role || 'assistant'} ${currentConfig.personnalite || 'amical'}. 
                      Je suis là pour vous aider avec ${currentConfig.theme || 'la conversation'}. 
                      Comment puis-je vous aider ?`);
    }
}

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

// Modifier la configuration de la reconnaissance vocale
function handleVoiceInput(event) {
    event.preventDefault();
    const voiceButton = event.currentTarget;
    
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR'; // Changé pour le portugais brésilien
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

// Améliorer la fonction de réponse du bot
function generateBotResponse(userMessage) {
    setTimeout(() => {
        let response = '';
        const themeVocabulary = currentConfig.vocabulaire.join(', ');
        const userMessageLower = userMessage.toLowerCase();
        
        // Corriger les erreurs courantes
        let correction = '';
        if (currentConfig.correction_style === 'immediate') {
            if (userMessageLower.includes('eu tem')) {
                correction = "\n💡 Correção: Use 'eu tenho' em vez de 'eu tem'.";
            } else if (userMessageLower.includes('voce pode')) {
                correction = "\n💡 Correção: Não esqueça do acento em 'você'.";
            }
        }

        // Réponses basées sur le niveau et le contexte
        switch(currentConfig.niveau) {
            case 'A1':
                if (userMessageLower.includes('?')) {
                    response = `Vou responder de forma simples. 
                              Algumas palavras úteis sobre ${currentConfig.theme}: ${themeVocabulary}`;
                } else {
                    response = `Muito bem! Vamos praticar mais? 
                              Tente usar estas palavras: ${themeVocabulary.split(',')[0]}`;
                }
                break;

            case 'A2':
                if (userMessageLower.includes('como')) {
                    response = `Para explicar ${currentConfig.theme}, podemos usar: ${themeVocabulary}. 
                              Quer tentar formar uma frase?`;
                } else {
                    response = `Boa! Agora vamos tentar usar algumas expressões mais comuns.`;
                }
                break;

            case 'B1':
                if (userMessageLower.includes('pode')) {
                    response = `Claro! Em ${currentConfig.theme}, existem várias maneiras de se expressar.
                              Que tal usarmos algumas expressões idiomáticas?`;
                } else {
                    response = `Você está se expressando bem! Vamos explorar vocabulário mais específico?`;
                }
                break;

            case 'B2':
                response = `Excelente colocação! No contexto de ${currentConfig.theme}, 
                          podemos aprofundar mais. O que você acha de discutirmos aspectos culturais?`;
                break;

            default:
                response = `Que interessante! Vamos explorar mais esse tema?`;
        }

        // Ajouter des suggestions basées sur les objectifs pédagogiques
        if (currentConfig.objectifs.length > 0) {
            const currentObjective = currentConfig.objectifs[0];
            response += `\n\n🎯 Objetivo: ${currentObjective}`;
        }

        // Ajouter la correction si nécessaire
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

// Fonctions utilitaires
function getGreetingByTime() {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia!";
    if (hour < 18) return "Boa tarde!";
    return "Boa noite!";
}

function getHintByLevel(level) {
    switch(level) {
        case 'A1':
            return "Vou usar frases simples e claras.";
        case 'A2':
            return "Podemos praticar situações do dia a dia.";
        case 'B1':
            return "Vamos conversar sobre temas mais complexos.";
        case 'B2':
            return "Podemos discutir temas avançados e aspectos culturais.";
        default:
            return "Como posso ajudar você hoje?";
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des containers de chips
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            updateAddButton(id);
            container.setAttribute('role', 'list');
        }
    });

    // Gestionnaire du formulaire
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

    // Gestion de la touche Entrée pour les chips
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

    // Gestion de la touche Entrée pour le chat
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleChatMessage(e);
            }
        });
    }

    // Initialisation de l'état du formulaire
    updateFormState();
    
    // Message de bienvenue plus contextualisé
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages && chatMessages.children.length === 0) {
        const welcomeMessage = `Olá! ${getGreetingByTime()} 
                              Sou ${currentConfig.role || 'seu assistente'} ${currentConfig.personnalite || 'amigável'}. 
                              Vamos praticar ${currentConfig.theme || 'português'}? 
                              ${getHintByLevel(currentConfig.niveau)}`;
        addBotMessage(welcomeMessage);
    }
}


    // Ajout des écouteurs pour la mise à jour de la prévisualisation
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateFormState);
        input.addEventListener('input', updateFormState);
    });
});