// Wait for DOM and Firebase
window.addEventListener('load', function() {
    // Elements
    const exercisesList = document.getElementById('exercisesList');
    const contentList = document.getElementById('contentList');
    const newExerciseBtn = document.getElementById('newExerciseBtn');
    const uploadContentBtn = document.getElementById('uploadContentBtn');
    const newExerciseModal = document.getElementById('newExerciseModal');
    const exerciseForm = document.getElementById('exerciseForm');

    // Modal functions
    function openModal(modalId) {
        document.getElementById(modalId).hidden = false;
    }

    function closeModal(modalId) {
        document.getElementById(modalId).hidden = true;
    }

    // Load and display exercises
    async function loadExercises() {
        try {
            const snapshot = await db.collection('exercises')
                .orderBy('createdAt', 'desc')
                .get();

            exercisesList.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="exercise-item" data-id="${doc.id}">
                        <h3>${data.title || 'Sans titre'}</h3>
                        <p>${data.description || 'Aucune description'}</p>
                        <div class="exercise-meta">
                            <span class="level">Niveau: ${data.level}</span>
                            <span class="date">
                                Créé le: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur chargement exercices:', error);
        }
    }

    // Event Listeners
    if (newExerciseBtn) {
        newExerciseBtn.addEventListener('click', () => openModal('newExerciseModal'));
    }

    if (exerciseForm) {
        exerciseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const exerciseData = {
                title: exerciseForm.exerciseTitle.value,
                description: exerciseForm.exerciseDescription.value,
                level: exerciseForm.exerciseLevel.value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await db.collection('exercises').add(exerciseData);
                exerciseForm.reset();
                closeModal('newExerciseModal');
                await loadExercises();
            } catch (error) {
                console.error('Erreur création exercice:', error);
            }
        });
    }

    if (uploadContentBtn) {
        uploadContentBtn.addEventListener('click', () => {
            console.log('Fonctionnalité à implémenter');
        });
    }

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modals on cancel button
    document.querySelectorAll('.cancel-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Initial load
    loadExercises();
});