import { loadActivities, addActivity, updateActivity, deleteActivity } from './firebase-config.js';

// État global de l'application
let currentActivityId = null;

// Gestionnaire de vues
const ViewManager = {
    views: {
        activities: 'activitiesView',
        config: 'configView'
    },

    showView(viewId) {
        for (const view of Object.values(this.views)) {
            const element = document.getElementById(view);
            if (element) {
                element.style.display = view === viewId ? 'block' : 'none';
            }
        }
    },

    showActivitiesList() {
        this.showView(this.views.activities);
        loadAndDisplayActivities();
    },

    showConfigForm() {
        this.showView(this.views.config);
    }
};

// Fonctions d'affichage
async function loadAndDisplayActivities(filterLevel = 'all') {
    try {
        const activities = await loadActivities(filterLevel);
        displayActivities(activities);
    } catch (error) {
        showError('Erreur lors du chargement des activités');
    }
}

function displayActivities(activities) {
    const activitiesList = document.getElementById('activitiesList');
    if (!activitiesList) return;

    activitiesList.innerHTML = '';
    
    if (activities.length === 0) {
        activitiesList.innerHTML = '<p class="no-activities">Aucune activité trouvée</p>';
        return;
    }

    activities.forEach(activity => {
        const card = createActivityCard(activity);
        activitiesList.appendChild(card);
    });
}

function createActivityCard(activity) {
    const article = document.createElement('article');
    article.className = 'activity-card';
    article.setAttribute('role', 'listitem');

    article.innerHTML = `
        <div class="activity-header">
            <h3>${escapeHtml(activity.theme)}</h3>
            <span class="badge-niveau">${escapeHtml(activity.niveau)}</span>
        </div>
        <div class="activity-content">
            <p>${escapeHtml(activity.contexte)}</p>
        </div>
        <div class="activity-footer">
            <div class="actions">
                <button class="btn-edit" onclick="editActivity('${activity.id}')">Modifier</button>
                <button class="btn-delete" onclick="confirmDelete('${activity.id}')">Supprimer</button>
            </div>
        </div>
    `;

    return article;
}

// Gestionnaires d'événements
function initializeEventListeners() {
    // Gestionnaire pour le bouton Nouvelle activité
    const newActivityBtn = document.getElementById('newActivityBtn');
    if (newActivityBtn) {
        newActivityBtn.addEventListener('click', () => {
            currentActivityId = null;
            resetForm();
            ViewManager.showConfigForm();
        });
    }

    // Gestionnaire pour le filtre de niveau
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.addEventListener('change', (e) => {
            loadAndDisplayActivities(e.target.value);
        });
    }

    // Gestionnaire pour le formulaire
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', handleFormSubmit);
    }

    // Gestionnaire pour le bouton Annuler
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            ViewManager.showActivitiesList();
        });
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        theme: document.getElementById('theme').value,
        niveau: document.getElementById('niveau').value,
        contexte: document.getElementById('contexte').value,
        role: document.getElementById('role').value,
        personnalite: document.getElementById('personnalite').value
    };

    try {
        if (currentActivityId) {
            await updateActivity(currentActivityId, formData);
        } else {
            await addActivity(formData);
        }
        ViewManager.showActivitiesList();
    } catch (error) {
        showError('Erreur lors de la sauvegarde de l\'activité');
    }
}

// Fonctions utilitaires
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function resetForm() {
    const form = document.getElementById('configForm');
    if (form) {
        form.reset();
    }
}

function showError(message) {
    alert(message); // À améliorer avec un système de notification plus élégant
}

async function confirmDelete(activityId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
        try {
            await deleteActivity(activityId);
            loadAndDisplayActivities();
        } catch (error) {
            showError('Erreur lors de la suppression de l\'activité');
        }
    }
}

// Exposition des fonctions nécessaires au niveau global pour les gestionnaires d'événements inline
window.editActivity = async function(activityId) {
    currentActivityId = activityId;
    // Logique pour charger et afficher l'activité dans le formulaire
    ViewManager.showConfigForm();
};

window.confirmDelete = confirmDelete;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    ViewManager.showActivitiesList();
});