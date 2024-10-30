// Gestion des chips (tags)
function addChip(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (value) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.setAttribute('role', 'listitem');
        chip.innerHTML = `
            ${value}
            <button type="button" onclick="removeChip(this)" aria-label="Supprimer ${value}">&times;</button>
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
    return Array.from(document.getElementById(containerId).children)
        .map(chip => chip.textContent.trim().replace('×', ''))
        .filter(text => text.length > 0);
}

function verifierConfig() {
    const form = document.getElementById('configForm');
    const formData = new FormData(form);
    const config = {
        ...Object.fromEntries(formData.entries()),
        objectifs: getChipsValues('objectifs'),
        structures: getChipsValues('structures'),
        vocabulaire: getChipsValues('vocabulaire')
    };

    document.getElementById('review-info').innerHTML = `
        <p><strong>Thème:</strong> ${config.theme}</p>
        <p><strong>Niveau:</strong> ${config.niveau}</p>
        <p><strong>Contexte:</strong> ${config.contexte}</p>
    `;

    document.getElementById('review-chatbot').innerHTML = `
        <p><strong>Rôle:</strong> ${config.role}</p>
        <p><strong>Personnalité:</strong> ${config.personnalite}</p>
        <p><strong>Objectifs:</strong></p>
        <div role="list" class="badge-list">${config.objectifs.map(obj => `<span class="badge" role="listitem">${obj}</span>`).join(' ')}</div>
    `;

    document.getElementById('review-params').innerHTML = `
        <p><strong>Structures grammaticales:</strong></p>
        <div role="list" class="badge-list">${config.structures.map(str => `<span class="badge" role="listitem">${str}</span>`).join(' ')}</div>
        <p><strong>Vocabulaire:</strong></p>
        <div role="list" class="badge-list">${config.vocabulaire.map(voc => `<span class="badge" role="listitem">${voc}</span>`).join(' ')}</div>
        <p><strong>Style de correction:</strong> ${config.correction_style}</p>
        <p><strong>Niveau d'aide:</strong> ${config.aide_niveau}</p>
    `;

    showModal('verificationModal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    // Sauvegarde l'élément qui avait le focus avant l'ouverture de la modale
    modal.lastFocus = document.activeElement;
    
    modal.style.display = 'flex';
    modal.offsetHeight; // Force un reflow
    modal.classList.add('visible');
    
    // Focus sur la modale
    const firstButton = modal.querySelector('button');
    if (firstButton) firstButton.focus();

    // Empêcher le focus de sortir de la modale
    modal.addEventListener('keydown', trapFocus);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('visible');
    
    // Retire le gestionnaire d'événements de focus
    modal.removeEventListener('keydown', trapFocus);
    
    // Restore le focus
    if (modal.lastFocus) {
        modal.lastFocus.focus();
    }
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function trapFocus(e) {
    if (e.key === 'Tab') {
        const modal = e.currentTarget;
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    } else if (e.key === 'Escape') {
        closeModal(e.currentTarget.id);
    }
}

function resetForm() {
    document.getElementById('configForm').reset();
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        document.getElementById(id).innerHTML = '';
        updateAddButton(id);
    });
    closeModal('successModal');
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les boutons d'ajout
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        updateAddButton(id);
        const container = document.getElementById(id);
        container.setAttribute('role', 'list');
    });

    // Gestionnaire pour le formulaire
    document.getElementById('configForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const config = {
            ...Object.fromEntries(formData.entries()),
            objectifs: getChipsValues('objectifs'),
            structures: getChipsValues('structures'),
            vocabulaire: getChipsValues('vocabulaire')
        };

        localStorage.setItem('currentConfig', JSON.stringify(config));
        closeModal('verificationModal');
        showModal('successModal');
    });

    // Permettre l'ajout de chips avec la touche Entrée
    ['newObjectif', 'newStructure', 'newVocab'].forEach(inputId => {
        document.getElementById(inputId).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChip(this.id.replace('new', '').toLowerCase(), this.id);
            }
        });
    });
});
