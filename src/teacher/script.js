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

function handleVoiceInput(event) {
    event.preventDefault();
    const voiceButton = event.currentTarget;
    
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            voiceButton.style.backgroundColor = '#dc3545';
        };

        recognition.onend = () => {
            voiceButton.style.backgroundColor = '';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            addUserMessage(transcript);
            generateBotResponse(transcript);
        };

        recognition.start();
    } else {
        alert('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
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
        let response = '';
        
        switch(currentConfig.niveau) {
            case 'A1':
                response = `En tant que ${currentConfig.role}, je vais vous aider avec des phrases simples sur ${currentConfig.theme}.`;
                break;
            case 'A2':
                response = `Pratiquons ${currentConfig.theme} ensemble. Je peux vous aider à enrichir votre vocabulaire.`;
                break;
            case 'B1':
                response = `Excellent ! Continuons à explorer ${currentConfig.theme} avec plus de détails.`;
                break;
            case 'B2':
                response = `Parfait ! Approfondissons ${currentConfig.theme} avec des expressions plus sophistiquées.`;
                break;
            default:
                response = `Je suis là pour vous aider avec ${currentConfig.theme}. Que souhaitez-vous pratiquer ?`;
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

    // Ajout des écouteurs pour la mise à jour de la prévisualisation
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateFormState);
        input.addEventListener('input', updateFormState);
    });
});