import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// État de l'application
const state = {
    exercises: [],
    content: [],
    db: db
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

// Initialisation des données
async function initializeApp() {
    try {
        await loadExercises();
        await loadContent();
        setupEventListeners();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showError('Erreur lors du chargement des données');
    }
}

// Chargement des exercices
async function loadExercises() {
    try {
        const exercisesQuery = query(collection(db, 'exercises'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(exercisesQuery);
        
        state.exercises = querySnapshot.docs.map(doc => ({
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
        const contentQuery = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(contentQuery);
        
        state.content = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderContent();
    } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
        showError('Erreur lors du chargement du contenu');
    }
}

// Gestionnaires d'événements
function setupEventListeners() {
    elements.newExerciseBtn?.addEventListener('click', () => openModal('newExerciseModal'));
    elements.uploadContentBtn?.addEventListener('click', handleContentUpload);
    elements.exerciseForm?.addEventListener('submit', handleExerciseSubmit);

    // Fermeture des modals
    document.querySelectorAll('.cancel-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) closeModal(modal.id);
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
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        await addDoc(collection(db, 'exercises'), exerciseData);
        await loadExercises(); // Recharge la liste
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
    // À implémenter : logique d'upload de contenu
    console.log('Upload de contenu à implémenter');
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

// Gestion des erreurs
function showError(message) {
    // À implémenter : affichage des erreurs
    console.error(message);
}

function showSuccess(message) {
    // À implémenter : affichage des succès
    console.log(message);
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', initializeApp);