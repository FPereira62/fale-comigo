// État global
let currentConfig = {
    id: null,  // Pour gérer modification vs création
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

let activities = [];

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
        return false;
    }
}

async function loadActivities() {
    try {
        const snapshot = await db.collection('activities')
            .orderBy('lastModified', 'desc')
            .get();
        
        activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        displayActivities();
        return true;
    } catch (error) {
        console.error("Erreur lors du chargement des activités:", error);
        return false;
    }
}

async function deleteActivity(id) {
    try {
        await db.collection('activities').doc(id).delete();
        await loadActivities();
        return true;
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
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
            return true;
        }
        return false;
    } catch (error) {
        console.error("Erreur lors du chargement de l'activité:", error);
        return false;
    }
}

// Affichage des activités
function displayActivities() {
    const container = document.getElementById('activitiesList');
    if (!container) return;

    container.innerHTML = activities.length ? '' : '<p class="no-activities">Aucune activité créée</p>';

    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        const date = activity.lastModified?.toDate() || new Date();
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        card.innerHTML = `
            <div class="activity-header">
                <h3>${activity.theme || 'Sans titre'}</h3>
                <span class="badge-niveau">${activity.niveau}</span>
            </div>
            <div class="activity-content">
                <p class="context">${activity.contexte || 'Aucun contexte défini'}</p>
                <div class="objectives">
                    ${activity.objectifs.map(obj => `<span class="badge">${obj}</span>`).join('')}
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

function confirmDelete(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
        deleteActivity(id);
    }
}

// Remplissage du formulaire
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
                chip.innerHTML = `${value}<button type="button" onclick="removeChip(this)">&times;</button>`;
                container.appendChild(chip);
            });
            updateAddButton(field);
        }
    });

    updateFormState();
}

// Réinitialisation du formulaire
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
    
    const form = document.getElementById('configForm');
    if (form) form.reset();
    
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
            updateAddButton(id);
        }
    });
    
    updateFormState();
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Code d'initialisation existant...
    
    loadActivities();

    // Ajout des écouteurs pour la nouvelle activité
    const newActivityBtn = document.getElementById('newActivityBtn');
    if (newActivityBtn) {
        newActivityBtn.addEventListener('click', () => {
            resetForm();
            showModal('configModal');
        });
    }
});
