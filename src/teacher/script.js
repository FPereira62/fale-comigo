// État de l'application
var currentActivityId = null;

// Fonctions de gestion des activités
function loadActivities(filterLevel) {
    var query = db.collection('activities');
    
    if (filterLevel && filterLevel !== 'all') {
        query = query.where('niveau', '==', filterLevel);
    }
    
    query.get().then(function(snapshot) {
        var activities = [];
        snapshot.forEach(function(doc) {
            activities.push({
                id: doc.id,
                ...doc.data()
            });
        });
        displayActivities(activities);
    }).catch(function(error) {
        console.error("Erreur lors du chargement des activités:", error);
        showError("Erreur lors du chargement des activités");
    });
}

function displayActivities(activities) {
    var container = document.getElementById('activitiesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="no-activities">Aucune activité trouvée</p>';
        return;
    }
    
    activities.forEach(function(activity) {
        var card = createActivityCard(activity);
        container.appendChild(card);
    });
}

function createActivityCard(activity) {
    var article = document.createElement('article');
    article.className = 'activity-card';
    
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

// Gestion du formulaire
function showForm() {
    document.getElementById('activitiesView').style.display = 'none';
    document.getElementById('configView').style.display = 'block';
}

function showActivities() {
    document.getElementById('configView').style.display = 'none';
    document.getElementById('activitiesView').style.display = 'block';
    loadActivities();
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    var activityData = {
        theme: document.getElementById('theme').value,
        niveau: document.getElementById('niveau').value,
        contexte: document.getElementById('contexte').value,
        role: document.getElementById('role').value,
        personnalite: document.getElementById('personnalite').value,
    };
    
    if (currentActivityId) {
        updateActivity(currentActivityId, activityData);
    } else {
        createActivity(activityData);
    }
}

function createActivity(data) {
    db.collection('activities').add({
        ...data,
        createdAt: new Date().toISOString()
    }).then(function() {
        showActivities();
    }).catch(function(error) {
        showError("Erreur lors de la création de l'activité");
        console.error("Erreur:", error);
    });
}

function updateActivity(id, data) {
    db.collection('activities').doc(id).update({
        ...data,
        updatedAt: new Date().toISOString()
    }).then(function() {
        showActivities();
    }).catch(function(error) {
        showError("Erreur lors de la mise à jour de l'activité");
        console.error("Erreur:", error);
    });
}

function confirmDelete(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
        deleteActivity(id);
    }
}

function deleteActivity(id) {
    db.collection('activities').doc(id).delete()
        .then(function() {
            loadActivities();
        }).catch(function(error) {
            showError("Erreur lors de la suppression de l'activité");
            console.error("Erreur:", error);
        });
}

function editActivity(id) {
    currentActivityId = id;
    
    db.collection('activities').doc(id).get()
        .then(function(doc) {
            if (doc.exists) {
                var data = doc.data();
                document.getElementById('theme').value = data.theme || '';
                document.getElementById('niveau').value = data.niveau || '';
                document.getElementById('contexte').value = data.contexte || '';
                document.getElementById('role').value = data.role || '';
                document.getElementById('personnalite').value = data.personnalite || '';
                showForm();
            }
        }).catch(function(error) {
            showError("Erreur lors du chargement de l'activité");
            console.error("Erreur:", error);
        });
}

// Utilitaires
function showError(message) {
    alert(message);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Écouteurs d'événements
    document.getElementById('newActivityBtn').addEventListener('click', function() {
        currentActivityId = null;
        document.getElementById('configForm').reset();
        showForm();
    });
    
    document.getElementById('configForm').addEventListener('submit', handleFormSubmit);
    
    document.getElementById('cancelBtn').addEventListener('click', showActivities);
    
    document.getElementById('levelFilter').addEventListener('change', function(e) {
        loadActivities(e.target.value);
    });
    
    // Chargement initial
    showActivities();
});