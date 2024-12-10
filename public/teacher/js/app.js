import { initializeFirebase } from './firebase-config.js';

let db = null;
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

// Initialisation
async function initializeApp() {
    try {
        // Initialiser Firebase
        db = await initializeFirebase();
        
        // Importer les fonctions Firestore nécessaires
        const { collection, addDoc, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firestore.js');
        
        // Stocker les fonctions Firestore dans state
        state.firestore = {
            collection,
            addDoc,
            getDocs,
            query,
            orderBy
        };

        // Initialiser l'interface
        await Promise.all([
            loadExercises(),
            loadContent()
        ]);

        setupEventListeners();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showError('Erreur lors de l\'initialisation de l\'application');
    }
}

// Chargement des exercices
async function loadExercises() {
    if (!db || !state.firestore) return;
    
    try {
        const { collection, getDocs, query, orderBy } = state.firestore;
        const exercisesRef = collection(db, 'exercises');
        const exercisesQuery = query(exercisesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(exercisesQuery);
        
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
    if (!db || !state.firestore) return;
    
    try {
        const { collection, getDocs, query, orderBy } = state.firestore;
        const contentRef = collection(db, 'content');
        const contentQuery = query(contentRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(contentQuery);
        
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
    if (!db || !state.firestore) return;

    const exerciseData = {
        title: elements.exerciseForm.exerciseTitle.value,
        description: elements.exerciseForm.exerciseDescription.value,
        level: elements.exerciseForm.exerciseLevel.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        const { collection, addDoc } = state.firestore;
        const exercisesRef = collection(db, 'exercises');
        await addDoc(exercisesRef, exerciseData);
        
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
            <h3>${exercise.title}</h3>
            <p>${exercise.description}</p>
            <div class="exercise-meta">
                <span class="level">Niveau: ${exercise.level}</span>
                <span class="date">Créé le: ${new Date(exercise.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Rendu du contenu
function renderContent() {
    if (!elements.contentList) return;

    elements.contentList.innerHTML = state.content.map(item => `
        <div class="content-item" data-id="${item.id}">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
}

// Gestion des erreurs et succès
function showError(message) {
    console.error(message);
    // Implémenter l'affichage visuel des erreurs ici
}

function showSuccess(message) {
    console.log(message);
    // Implémenter l'affichage visuel des succès ici
}

// Démarrage de l'application
document.addEventListener('DOMContentLoaded', initializeApp);