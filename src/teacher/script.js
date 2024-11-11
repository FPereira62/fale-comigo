// 1. Imports (au début du fichier)
import ChatbotPreview from './components/ChatbotPreview.js';

// 2. Configuration de la reconnaissance vocale
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'fr-FR';
}

// 3. État global du formulaire (nouveau)
let formState = {
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

// 4. Fonctions de gestion des chips (votre code existant)
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
        updateFormState(); // Ajout de cette ligne
    }
}

function removeChip(button) {
    const chip = button.parentElement;
    const container = chip.parentElement;
    chip.remove();
    updateAddButton(container.id);
    updateFormState(); // Ajout de cette ligne
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
    return Array.from(document.getElementById(containerId).children)
        .map(chip => chip.textContent.trim().replace('×', ''))
        .filter(text => text.length > 0);
}

// 5. Fonctions de gestion Firestore (votre code existant)
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

// 6. Fonctions de gestion des modales (votre code existant)
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    modal.offsetHeight; // Force un reflow
    modal.classList.add('visible');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// 7. Nouvelles fonctions pour la prévisualisation
function updateFormState() {
    formState = {
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
    
    updatePreview();
}

function updatePreview() {
    const previewContainer = document.getElementById('chatbotPreview');
    if (previewContainer) {
        ReactDOM.render(
            React.createElement(ChatbotPreview, { config: formState }),
            previewContainer
        );
    }
}

// 8. Fonction de vérification (votre code existant modifié)
function verifierConfig() {
    // Utiliser formState au lieu de créer un nouvel objet
    document.getElementById('review-info').innerHTML = `
        <p><strong>Thème:</strong> ${formState.theme}</p>
        <p><strong>Niveau:</strong> ${formState.niveau}</p>
        <p><strong>Contexte:</strong> ${formState.contexte}</p>
    `;

    document.getElementById('review-chatbot').innerHTML = `
        <p><strong>Rôle:</strong> ${formState.role}</p>
        <p><strong>Personnalité:</strong> ${formState.personnalite}</p>
        <p><strong>Objectifs:</strong></p>
        <div>${formState.objectifs.map(obj => `<span class="badge">${obj}</span>`).join(' ')}</div>
    `;

    document.getElementById('review-params').innerHTML = `
        <p><strong>Structures grammaticales:</strong></p>
        <div>${formState.structures.map(str => `<span class="badge">${str}</span>`).join(' ')}</div>
        <p><strong>Vocabulaire:</strong></p>
        <div>${formState.vocabulaire.map(voc => `<span class="badge">${voc}</span>`).join(' ')}</div>
        <p><strong>Style de correction:</strong> ${formState.correction_style}</p>
        <p><strong>Niveau d'aide:</strong> ${formState.aide_niveau}</p>
    `;

    showModal('verificationModal');
}

// 9. Event listeners (à la fin du fichier)
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des chips containers
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        updateAddButton(id);
        const container = document.getElementById(id);
        container.setAttribute('role', 'list');
    });

    // Écouteurs d'événements pour les champs de formulaire
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateFormState);
        input.addEventListener('input', updateFormState);
    });

    // Initialisation de la prévisualisation
    updateFormState();

    // Gestion du formulaire
    document.getElementById('configForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        closeModal('verificationModal');
        const saveSuccess = await saveToFirestore(formState);
        
        if (saveSuccess) {
            showModal('successModal');
        } else {
            alert('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
        }
    });

    // Gestion de l'ajout de chips avec la touche Entrée
    ['newObjectif', 'newStructure', 'newVocab'].forEach(inputId => {
        document.getElementById(inputId).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChip(this.id.replace('new', '').toLowerCase(), this.id);
                updateFormState();
            }
        });
    });
});

// 10. Exports
export {
    addChip,
    removeChip,
    updateAddButton,
    getChipsValues,
    showModal,
    closeModal,
    verifierConfig,
    resetForm
};
