// État de l'application
const state = {
    exercises: [],
    content: []
};

// Éléments DOM
const elements = {
    exercisesList: document.getElementById('exercisesList'),
    contentList: document.getElementById('contentList'),
    newExerciseBtn: document.getElementById('newExerciseBtn'),
    uploadContentBtn: document.getElementById('uploadContentBtn'),
    newExerciseModal: document.getElementById('newExerciseModal'),
    exerciseForm: document.getElementById('exerciseForm')
};

// Chargement des exercices
async function loadExercises() {
    try {
        const snapshot = await db.collection('exercises').orderBy('createdAt', 'desc').get();
        state.exercises = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderExercises();
    } catch (error) {
        console.error('Erreur lors du chargement des exercices:', error);
        showError('Erreur lors du chargement des exercices');
    }
}

// Chargement du contenu
async function loadContent() {
    try {
        const snapshot = await db.collection('content').orderBy('createdAt', 'desc').get();
        state.content = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderContent();
    } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
        showError('Erreur lors du chargement du contenu');
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    if (elements.newExerciseBtn) {
        elements.newExerciseBtn.addEventListener('click', () => openModal('newExerciseModal'));
    }
    
    if (elements.uploadContentBtn) {
        elements.uploadContentBtn.addEventListener('click', handleContentUpload);
    }
    
    if (elements.exerciseForm) {
        elements.exerciseForm.addEventListener('submit', handleExerciseSubmit);
    }

    // Gestionnaires pour les modales
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    document.querySelectorAll('.cancel-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Gestion des modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.hidden = false;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.hidden = true;
}

// Gestion des exercices
async function handleExerciseSubmit(e) {
    e.preventDefault();

    const exerciseData = {
        title: elements.exerciseForm.exerciseTitle.value,
        description: elements.exerciseForm.exerciseDescription.value,
        level: elements.exerciseForm.exerciseLevel.value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('exercises').add(exerciseData);
        await loadExercises();
        elements.exerciseForm.reset();
        closeModal('newExerciseModal');
        showSuccess('Exercice créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de l\'exercice:', error);
        showError('Erreur lors de la création de l\'exercice');
    }
}

// Gestion du contenu
function handleContentUpload() {
    console.log('Fonctionnalité d\'upload à implémenter');
}

// Rendu des exercices
function renderExercises() {
    if (!elements.exercisesList) return;
    
    elements.exercisesList.innerHTML = state.exercises.map(exercise => `
        <div class="exercise-item" data-id="${exercise.id}">
            <h3>${exercise.title || 'Sans titre'}</h3>
            <p>${exercise.description || 'Aucune description'}</p>
            <div class="exercise-meta">
                <span class="level">Niveau: ${exercise.level}</span>
                <span class="date">Créé le: ${exercise.createdAt ? new Date(exercise.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}</span>
            </div>
        </div>
    `).join('');
}

// Rendu du contenu
function renderContent() {
    if (!elements.contentList) return;
    
    elements.contentList.innerHTML = state.content.map(item => `
        <div class="content-item" data-id="${item.id}">
            <h3>${item.title || 'Sans titre'}</h3>
            <p>${item.description || 'Aucune description'}</p>
        </div>
    `).join('');
}

// Gestion des erreurs et succès
function showError(message) {
    console.error(message);
}

function showSuccess(message) {
    console.log(message);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    Promise.all([loadExercises(), loadContent()])
        .catch(error => {
            console.error('Erreur lors de l\'initialisation:', error);
            showError('Erreur lors de l\'initialisation de l\'application');
        });
});