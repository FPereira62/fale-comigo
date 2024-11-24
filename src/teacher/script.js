// État global
let currentConfig = {
    id: null,
    theme: '',
    niveau: '',
    contexte: '',
    role: '',
    personnalite: '',
    objectifs: [],
    structures: [],
    vocabulaire: [],
    correction_style: 'immediate',
    aide_niveau: 'minimal',
    dateCreation: null,
    lastModified: null
};

// Gestionnaire de vues
const ViewManager = {
    showActivitiesList() {
        document.getElementById('activitiesView').style.display = 'block';
        document.getElementById('configView').style.display = 'none';
        loadActivities(); // Recharge la liste
    },

    showConfigForm() {
        document.getElementById('activitiesView').style.display = 'none';
        document.getElementById('configView').style.display = 'block';
    }
};

// Gestion de Firebase
async function saveToFirestore(config) {
    try {
        const activityData = {
            ...config,
            dateCreation: config.dateCreation || firebase.firestore.FieldValue.serverTimestamp(),
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        };

        let docRef;
        if (config.id) {
            docRef = db.collection('activities').doc(config.id);
            await docRef.update(activityData);
        } else {
            docRef = await db.collection('activities').add(activityData);
            currentConfig.id = docRef.id;
        }

        return true;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        showError("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
        return false;
    }
}

async function loadActivities() {
    try {
        const filterLevel = document.getElementById('filterLevel').value;
        let query = db.collection('activities').orderBy('lastModified', 'desc');
        
        if (filterLevel) {
            query = query.where('niveau', '==', filterLevel);
        }

        const snapshot = await query.get();
        const activities = [];
        snapshot.forEach(doc => {
            activities.push({ id: doc.id, ...doc.data() });
        });

        displayActivities(activities);
        return true;
    } catch (error) {
        console.error("Erreur lors du chargement des activités:", error);
        showError("Impossible de charger les activités. Veuillez rafraîchir la page.");
        return false;
    }
}

async function deleteActivity(id) {
    try {
        await db.collection('activities').doc(id).delete();
        await loadActivities();
        showSuccess("Activité supprimée avec succès");
        return true;
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showError("Impossible de supprimer l'activité. Veuillez réessayer.");
        return false;
    }
}

async function loadActivityForEdit(id) {
    try {
        const doc = await db.collection('activities').doc(id).get();
        if (doc.exists) {
            currentConfig = {
                id: doc.id,
                ...doc.data()
            };
            fillFormWithActivity(currentConfig);
            ViewManager.showConfigForm();
            return true;
        }
        return false;
    } catch (error) {
        console.error("Erreur lors du chargement de l'activité:", error);
        showError("Impossible de charger l'activité. Veuillez réessayer.");
        return false;
    }
}

// Gestion de l'affichage
function displayActivities(activities) {
    const container = document.getElementById('activitiesList');
    if (!container) return;

    container.innerHTML = activities.length ? '' : 
        '<div class="no-activities">Aucune activité créée. Cliquez sur "Nouvelle activité" pour commencer.</div>';

    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        const date = activity.lastModified?.toDate() || new Date();
        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);

        card.innerHTML = `
            <div class="activity-header">
                <h3>${escapeHtml(activity.theme || 'Sans titre')}</h3>
                <span class="badge-niveau">${activity.niveau}</span>
            </div>
            <div class="activity-content">
                <p>${escapeHtml(activity.contexte || 'Aucun contexte défini')}</p>
                <div class="objectives">
                    ${activity.objectifs.map(obj => `<span class="badge">${escapeHtml(obj)}</span>`).join('')}
                </div>
            </div>
            <div class="activity-footer">
                <span class="date">Modifié le ${formattedDate}</span>
                <div class="actions">
                    <button onclick="loadActivityForEdit('${activity.id}')" class="btn-edit">
                        Modifier
                    </button>
                    <button onclick="confirmDelete('${activity.id}')" class="btn-delete">
                        Supprimer
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Gestion du formulaire
function fillFormWithActivity(activity) {
    // Remplir les champs simples
    ['theme', 'niveau', 'contexte', 'role', 'personnalite', 'correction_style', 'aide_niveau'].forEach(field => {
        const element = document.getElementById(field);
        if (element) element.value = activity[field] || '';
    });

    // Remplir les chips
    ['objectifs', 'structures', 'vocabulaire'].forEach(field => {
        const container = document.getElementById(field);
        if (container) {
            container.innerHTML = '';
            activity[field].forEach(value => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.innerHTML = `${escapeHtml(value)}<button type="button" onclick="removeChip(this)">&times;</button>`;
                container.appendChild(chip);
            });
            updateAddButton(field);
        }
    });

    // Mettre à jour la prévisualisation
    updateChatbotPreview();
}

function resetForm() {
    currentConfig = {
        id: null,
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
    
    document.getElementById('configForm').reset();
    
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
            updateAddButton(id);
        }
    });
    
    updateChatbotPreview();
}

// Gestion des chips
function addChip(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (value) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `${escapeHtml(value)}<button type="button" onclick="removeChip(this)">&times;</button>`;
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
    addButton.disabled = container.children.length >= 10;
}

function getChipsValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return Array.from(container.children)
        .map(chip => chip.textContent.trim().replace('×', ''))
        .filter(text => text.length > 0);
}

// Gestion des états et mises à jour
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

    currentConfig = { ...currentConfig, ...formData };
    updateChatbotPreview();
}

// Utilitaires
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showError(message) {
    // Implémenter l'affichage des erreurs
    alert(message); // Temporaire, à améliorer avec une UI plus élégante
}

function showSuccess(message) {
    // Implémenter l'affichage des succès
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('visible');
    }
}

function confirmDelete(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
        deleteActivity(id);
    }
}

// Navigation et contrôles
function cancelConfig() {
    if (confirm('Voulez-vous vraiment annuler ? Les modifications non sauvegardées seront perdues.')) {
        ViewManager.showActivitiesList();
    }
}

function createNewActivity() {
    resetForm();
    ViewManager.showConfigForm();
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Charger la liste des activités
    loadActivities();

    // Gérer le formulaire
    const form = document.getElementById('configForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const success = await saveToFirestore(currentConfig);
            if (success) {
                showSuccess("Activité sauvegardée avec succès");
                ViewManager.showActivitiesList();
            }
        });
    }

    // Gérer les filtres
    const filterLevel = document.getElementById('filterLevel');
    if (filterLevel) {
        filterLevel.addEventListener('change', loadActivities);
    }

    // Gérer les inputs des chips
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

    // Écouter les changements de formulaire
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateFormState);
        input.addEventListener('input', updateFormState);
    });
});
