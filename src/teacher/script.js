// Gestionnaire de vues
const ViewManager = {
    views: {
        activities: 'activitiesView',
        config: 'configView'
    },

    hideAllViews() {
        Object.values(this.views).forEach(viewId => {
            const view = document.getElementById(viewId);
            if (view) view.style.display = 'none';
        });
    },

    showView(viewId) {
        this.hideAllViews();
        const view = document.getElementById(viewId);
        if (view) view.style.display = 'block';
    },

    showActivitiesList() {
        this.showView(this.views.activities);
        loadActivities();
    },

    showConfigForm() {
        this.showView(this.views.config);
    }
};

// État de l'application
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

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de l'application...");
    
    // Gestionnaire pour le bouton Nouvelle activité
    const newActivityBtn = document.getElementById('newActivityBtn');
    if (newActivityBtn) {
        newActivityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Création d'une nouvelle activité");
            createNewActivity();
        });
    }

    // Gestionnaire pour le formulaire de configuration
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("Soumission du formulaire");
            if (validateForm()) {
                await saveActivity();
            }
        });

        // Ajout des écouteurs d'événements pour la mise à jour en temps réel
        configForm.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('change', updateFormState);
            element.addEventListener('input', updateFormState);
        });
    }

    // Chargement initial des activités
    loadActivities();

    // Gestionnaire pour le filtre de niveau
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.addEventListener('change', function() {
            loadActivities(this.value);
        });
    }
});

// Fonctions de gestion des activités
async function loadActivities(filterLevel = 'all') {
    console.log("Chargement des activités...");
    try {
        const activitiesRef = window.db.collection('activities');
        let query = activitiesRef;
        
        if (filterLevel !== 'all') {
            query = query.where('niveau', '==', filterLevel);
        }
        
        const snapshot = await query.get();
        const activitiesList = document.getElementById('activitiesList');
        
        if (activitiesList) {
            activitiesList.innerHTML = '';
            snapshot.forEach(doc => {
                const activity = doc.data();
                const card = createActivityCard(activity, doc.id);
                activitiesList.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Erreur lors du chargement des activités:", error);
        showError("Erreur lors du chargement des activités");
    }
}

function createActivityCard(activity, id) {
    const card = document.createElement('article');
    card.className = 'activity-card';
    card.setAttribute('role', 'listitem');
    
    card.innerHTML = `
        <div class="activity-header">
            <h3>${activity.theme}</h3>
            <span class="badge-niveau">${activity.niveau}</span>
        </div>
        <div class="activity-content">
            <p>${activity.contexte}</p>
        </div>
        <div class="activity-footer">
            <div class="actions">
                <button class="btn-edit" onclick="editActivity('${id}')">Modifier</button>
                <button class="btn-delete" onclick="deleteActivity('${id}')">Supprimer</button>
            </div>
        </div>
    `;
    
    return card;
}

async function saveActivity() {
    try {
        const activityData = {
            ...currentConfig,
            dateCreation: new Date(),
            dateModification: new Date()
        };

        if (currentConfig.id) {
            await window.db.collection('activities').doc(currentConfig.id).update(activityData);
        } else {
            await window.db.collection('activities').add(activityData);
        }

        showSuccess("Activité sauvegardée avec succès");
        ViewManager.showActivitiesList();
    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        showError("Erreur lors de la sauvegarde de l'activité");
    }
}

async function deleteActivity(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
        try {
            await window.db.collection('activities').doc(id).delete();
            showSuccess("Activité supprimée avec succès");
            loadActivities();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            showError("Erreur lors de la suppression de l'activité");
        }
    }
}

async function editActivity(id) {
    try {
        const doc = await window.db.collection('activities').doc(id).get();
        if (doc.exists) {
            currentConfig = { ...doc.data(), id };
            fillForm(currentConfig);
            ViewManager.showConfigForm();
        }
    } catch (error) {
        console.error("Erreur lors de l'édition:", error);
        showError("Erreur lors du chargement de l'activité");
    }
}

// Fonctions utilitaires
function validateForm() {
    const requiredFields = ['theme', 'niveau', 'contexte', 'role', 'personnalite'];
    const missingFields = requiredFields.filter(field => {
        const element = document.getElementById(field);
        return !element || !element.value.trim();
    });

    if (missingFields.length > 0) {
        showError("Veuillez remplir tous les champs obligatoires");
        return false;
    }
    return true;
}

function updateFormState() {
    const formElements = document.querySelectorAll('#configForm input, #configForm select, #configForm textarea');
    formElements.forEach(element => {
        if (element.id) {
            currentConfig[element.id] = element.value;
        }
    });
}

function fillForm(data) {
    Object.entries(data).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
            element.value = value;
        }
    });
}

function resetForm() {
    currentConfig = {
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
    if (form) {
        form.reset();
    }
}

// Fonctions de notification
function showError(message) {
    // Implémentez votre système de notification d'erreur ici
    console.error(message);
    alert(message); // À remplacer par une meilleure UI
}

function showSuccess(message) {
    // Implémentez votre système de notification de succès ici
    console.log(message);
    alert(message); // À remplacer par une meilleure UI
}