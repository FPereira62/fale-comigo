// Attendre que Firebase soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Éléments DOM
    const elements = {
        exercisesList: document.getElementById('exercisesList'),
        contentList: document.getElementById('contentList'),
        newExerciseBtn: document.getElementById('newExerciseBtn'),
        uploadContentBtn: document.getElementById('uploadContentBtn'),
        newExerciseModal: document.getElementById('newExerciseModal'),
        exerciseForm: document.getElementById('exerciseForm')
    };

    // État local
    let exercises = [];
    let content = [];

    // Gestion des modales
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.hidden = false;
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.hidden = true;
    }

    // Gestionnaires d'événements
    function setupEventListeners() {
        // Bouton nouvel exercice
        if (elements.newExerciseBtn) {
            elements.newExerciseBtn.addEventListener('click', () => {
                openModal('newExerciseModal');
            });
        }

        // Formulaire d'exercice
        if (elements.exerciseForm) {
            elements.exerciseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const exerciseData = {
                    title: elements.exerciseForm.exerciseTitle.value,
                    description: elements.exerciseForm.exerciseDescription.value,
                    level: elements.exerciseForm.exerciseLevel.value,
                    createdAt: new Date()
                };

                try {
                    await firebase.firestore().collection('exercises').add(exerciseData);
                    console.log('Exercice créé avec succès');
                    elements.exerciseForm.reset();
                    closeModal('newExerciseModal');
                    loadExercises();
                } catch (error) {
                    console.error('Erreur lors de la création:', error);
                }
            });
        }

        // Bouton upload contenu
        if (elements.uploadContentBtn) {
            elements.uploadContentBtn.addEventListener('click', () => {
                console.log('Fonctionnalité à implémenter');
            });
        }

        // Fermeture des modales
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

    // Charger les exercices
    async function loadExercises() {
        try {
            const snapshot = await firebase.firestore().collection('exercises')
                .orderBy('createdAt', 'desc')
                .get();

            exercises = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            renderExercises();
        } catch (error) {
            console.error('Erreur chargement exercices:', error);
        }
    }

    // Afficher les exercices
    function renderExercises() {
        if (!elements.exercisesList) return;

        elements.exercisesList.innerHTML = exercises.map(exercise => `
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

    // Initialisation
    try {
        setupEventListeners();
        loadExercises();
        console.log('Application initialisée');
    } catch (error) {
        console.error('Erreur initialisation:', error);
    }
});