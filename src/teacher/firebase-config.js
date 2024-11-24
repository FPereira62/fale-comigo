// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBVAVVcpmicOnyXYBydEW4KfCu0B0ukNe4",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Exportation pour utilisation dans d'autres fichiers
window.db = db;
