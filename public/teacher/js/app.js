// État de l'application
const state = {
    exercises: [],
    content: [],
    db: window.db
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

// Gestionnaires d'événements
function setupEventListeners() {
    elements.newExerciseBtn.addEventListener('click', () => openModal('newExerciseModal'));
    elements.uploadContentBtn.addEventListener('click', handleContentUpload);
    elements.exerciseForm.addEventListener('submit', handleExerciseSubmit);

    // Fermeture des modals sur clic extérieur
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Fonctions modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.hidden = false;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.hidden = true;
    }
}

// Gestion des exercices
async function handleExerciseSubmit(e) {
    e.preventDefault();

    const exerciseData = {
        title: elements.exerciseForm.exerciseTitle.value,
        description: elements.exerciseForm.exerciseDescription.value,
        level: elements.exerciseForm.exerciseLevel.value,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        // Sauvegarde dans Firebase
        const exerciseRef = await addDoc(collection(state.db, 'exercises'), exerciseData);
        
        // Mise à jour de l'interface
        addExerciseToList({
            id: exerciseRef.id,
            ...exerciseData
        });

        // Fermeture du modal et réinitialisation du formulaire
        elements.exerciseForm.reset();
        closeModal('newExerciseModal');

        showNotification('Exercice créé avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la création de l\'exercice:', error);
        showNotification('Erreur lors de la création de l\'exercice', 'error