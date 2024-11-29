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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Fonction pour charger les activités
function loadActivities(filterLevel = null) {
    let query = db.collection('activities');
    
    if (filterLevel && filterLevel !== 'all') {
        query = query.where('niveau', '==', filterLevel);
    }
    
    return query.get().then(snapshot => {
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }).catch(error => {
        console.error('Erreur lors du chargement des activités:', error);
        throw error;
    });
}

// Fonction pour ajouter une activité
function addActivity(activityData) {
    return db.collection('activities').add({
        ...activityData,
        createdAt: new Date().toISOString()
    });
}

// Fonction pour mettre à jour une activité
function updateActivity(activityId, activityData) {
    return db.collection('activities').doc(activityId).update({
        ...activityData,
        updatedAt: new Date().toISOString()
    });
}

// Fonction pour supprimer une activité
function deleteActivity(activityId) {
    return db.collection('activities').doc(activityId).delete();
}

// Export des fonctions pour les rendre disponibles globalement
window.db = db;
window.loadActivities = loadActivities;
window.addActivity = addActivity;
window.updateActivity = updateActivity;
window.deleteActivity = deleteActivity;