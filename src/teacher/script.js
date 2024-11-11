// Fonctions de gestion des chips (tags)
function addChip(containerId, inputId) {
    console.log('Adding chip to', containerId, 'from', inputId); // Pour le débogage
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
    }
}

function removeChip(button) {
    const chip = button.parentElement;
    const container = chip.parentElement;
    chip.remove();
    updateAddButton(container.id);
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
    console.log('Showing modal', modalId); // Pour le débogage
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
    console.log('Vérification de la configuration'); // Pour le débogage
    const formData = {
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

    // Mise à jour de la modal de vérification
    document.getElementById('review-info').innerHTML = `
        <p><strong>Thème:</strong> ${formData.theme}</p>
        <p><strong>Niveau:</strong> ${formData.niveau}</p>
        <p><strong>Contexte:</strong> ${formData.contexte}</p>
    `;

    document.getElementById('review-chatbot').innerHTML = `
        <p><strong>Rôle:</strong> ${formData.role}</p>
        <p><strong>Personnalité:</strong> ${formData.personnalite}</p>
        <p><strong>Objectifs:</strong></p>
        <div>${formData.objectifs.map(obj => `<span class="badge">${obj}</span>`).join(' ')}</div>
    `;

    document.getElementById('review-params').innerHTML = `
        <p><strong>Structures grammaticales:</strong></p>
        <div>${formData.structures.map(str => `<span class="badge">${str}</span>`).join(' ')}</div>
        <p><strong>Vocabulaire:</strong></p>
        <div>${formData.vocabulaire.map(voc => `<span class="badge">${voc}</span>`).join(' ')}</div>
        <p><strong>Style de correction:</strong> ${formData.correction_style}</p>
        <p><strong>Niveau d'aide:</strong> ${formData.aide_niveau}</p>
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
    closeModal('successModal');
}

// Initialisation

// Gestion de la prévisualisation du chat
function updateFormState() {
    const formData = {
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

    if (window.chatbotPreview) {
        window.chatbotPreview.config = formData;
    } else {
        initializeChatPreview(formData);
    }
}

function initializeChatPreview(config) {
    const previewContainer = document.getElementById('chatbotPreview');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
        <div class="chat-container">
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input">
                <input type="text" id="userInput" placeholder="Écrivez votre message...">
                <button class="send-button" id="sendMessage">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="voice-button" id="voiceInput">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Ajout du message de bienvenue
    addBotMessage(`Bonjour ! Je suis votre ${config.role} ${config.personnalite}. 
                   Je suis là pour vous aider avec ${config.theme}. 
                   Comment puis-je vous aider ?`);

    // Gestionnaires d'événements
    setupChatEventListeners(config);
}

function setupChatEventListeners(config) {
    const sendButton = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const voiceButton = document.getElementById('voiceInput');

    if (sendButton && userInput) {
        sendButton.addEventListener('click', () => handleUserMessage(config));
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserMessage(config);
            }
        });
    }

    if (voiceButton) {
        voiceButton.addEventListener('click', startVoiceRecognition);
    }
}

function handleUserMessage(config) {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (message) {
        addUserMessage(message);
        userInput.value = '';
        generateBotResponse(message, config);
    }
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function generateBotResponse(userMessage, config) {
    setTimeout(() => {
        let response;
        switch(config.correction_style) {
            case 'immediate':
                response = `Je comprends votre message. Dans le contexte de ${config.theme}, au niveau ${config.niveau}, je suggère...`;
                break;
            case 'delayed':
                response = "Je note votre message. Nous reverrons les points importants plus tard.";
                break;
            default:
                response = "Je vous écoute. Continuons notre conversation.";
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

function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.onresult = (event) => {
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = event.results[0][0].transcript;
            }
        };
        recognition.start();
    } else {
        alert('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded'); // Pour le débogage

    // Initialisation des containers de chips
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            updateAddButton(id);
            container.setAttribute('role', 'list');
        }
    });

    // Initialisation de la prévisualisation
updateFormState();

// Ajout des écouteurs pour la mise à jour de la prévisualisation
const formInputs = document.querySelectorAll('input, select, textarea');
formInputs.forEach(input => {
    input.addEventListener('change', updateFormState);
    input.addEventListener('input', updateFormState);
});

    // Gestionnaire du formulaire
    const form = document.getElementById('configForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = {
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

            closeModal('verificationModal');
            const saveSuccess = await saveToFirestore(formData);
            
            if (saveSuccess) {
                showModal('successModal');
            } else {
                alert('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
            }
        });
    }

    // Gestion de l'ajout de chips avec la touche Entrée
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
});
