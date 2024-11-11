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
