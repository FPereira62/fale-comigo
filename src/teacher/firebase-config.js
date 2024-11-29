import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Gestion des erreurs Firebase
const handleFirebaseError = (error) => {
    console.error('Erreur Firebase:', error);
    switch (error.code) {
        case 'permission-denied':
            return 'Accès non autorisé. Veuillez vous reconnecter.';
        case 'unavailable':
            return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
        case 'not-found':
            return 'Document non trouvé.';
        case 'already-exists':
            return 'Cette activité existe déjà.';
        case 'auth/invalid-email':
            return 'Email invalide.';
        case 'auth/user-disabled':
            return 'Compte désactivé.';
        case 'auth/user-not-found':
            return 'Utilisateur non trouvé.';
        case 'auth/wrong-password':
            return 'Mot de passe incorrect.';
        default:
            return 'Une erreur est survenue. Veuillez réessayer.';
    }
};

// Authentification
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Gestion des activités
export const loadActivities = async (filterLevel = null) => {
    try {
        const activitiesRef = collection(db, 'activities');
        let q = query(activitiesRef, orderBy('createdAt', 'desc'));
        
        if (filterLevel) {
            q = query(activitiesRef, 
                where('niveau', '==', filterLevel),
                orderBy('createdAt', 'desc')
            );
        }
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

export const getActivityById = async (activityId) => {
    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await activityRef.get();
        
        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }
        
        return {
            id: activityDoc.id,
            ...activityDoc.data()
        };
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

export const addActivity = async (activityData) => {
    try {
        const activitiesRef = collection(db, 'activities');
        const docRef = await addDoc(activitiesRef, {
            ...activityData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: auth.currentUser ? auth.currentUser.uid : null,
            status: 'active'
        });
        return docRef.id;
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

export const updateActivity = async (activityId, activityData) => {
    try {
        const activityRef = doc(db, 'activities', activityId);
        await updateDoc(activityRef, {
            ...activityData,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser ? auth.currentUser.uid : null
        });
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

export const deleteActivity = async (activityId) => {
    try {
        // Vérification des permissions
        if (!auth.currentUser) {
            throw new Error('Vous devez être connecté pour supprimer une activité');
        }
        
        const activityRef = doc(db, 'activities', activityId);
        await deleteDoc(activityRef);
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

// Validation des données
export const validateActivityData = (data) => {
    const requiredFields = ['theme', 'niveau', 'contexte', 'role', 'personnalite'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`);
    }
    
    if (!['A1', 'A2', 'B1', 'B2'].includes(data.niveau)) {
        throw new Error('Niveau invalide');
    }
    
    return true;
};

// Export des fonctions et instances
export { db, auth };
export default {
    db,
    auth,
    loginUser,
    logoutUser,
    onAuthChange,
    loadActivities,
    getActivityById,
    addActivity,
    updateActivity,
    deleteActivity,
    validateActivityData
};