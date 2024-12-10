// Import Firebase modules directement depuis les CDN
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-domain.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-bucket.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Les imports seront faits dans une fonction asynchrone pour s'assurer qu'ils sont chargés
async function initializeFirebase() {
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        return db;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

export { initializeFirebase };