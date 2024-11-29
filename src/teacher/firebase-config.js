// Configuration Firebase
var firebaseConfig = {
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
var db = firebase.firestore();

// On rend la base de données accessible globalement
window.db = db;