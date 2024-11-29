import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBVAVVcpmicOnyXYBydEW4KfCuBBukNe4",
    authDomain: "fale-comigo-d4522.firebaseapp.com",
    projectId: "fale-comigo-d4522",
    storageBucket: "fale-comigo-d4522.firebasestorage.app",
    messagingSenderId: "464958131394",
    appId: "1:464958131394:web:547ac8416d49f8d31d3f5b",
    measurementId: "G-7XPJSMHWYX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour charger les activités
export async function loadActivities(filterLevel = null) {
    try {
        const activitiesRef = collection(db, 'activities');
        let q = activitiesRef;

        if (filterLevel && filterLevel !== 'all') {
            q = query(activitiesRef, where('niveau', '==', filterLevel));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erreur lors du chargement des activités:', error);
        throw error;
    }
}

// Fonction pour ajouter une activité
export async function addActivity(activityData) {
    try {
        const activitiesRef = collection(db, 'activities');
        const docRef = await addDoc(activitiesRef, {
            ...activityData,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'activité:', error);
        throw error;
    }
}

// Fonction pour mettre à jour une activité
export async function updateActivity(activityId, activityData) {
    try {
        const activityRef = doc(db, 'activities', activityId);
        await updateDoc(activityRef, {
            ...activityData,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'activité:', error);
        throw error;
    }
}

// Fonction pour supprimer une activité
export async function deleteActivity(activityId) {
    try {
        const activityRef = doc(db, 'activities', activityId);
        await deleteDoc(activityRef);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'activité:', error);
        throw error;
    }
}

export { db };