// Activités préchargées
const preloadedActivities = [
    {
        title: "Au restaurant",
        description: "Pratiquez une conversation au restaurant",
        level: "A1",
        phrases: [
            "Bom dia, eu queria fazer um pedido",
            "Eu quero um café, por favor",
            "Quanto custa?",
            "A conta, por favor"
        ],
        responses: [
            "Bom dia, o que você deseja?",
            "Pois não, um café",
            "São cinco reais",
            "Aqui está a conta"
        ]
    },
    {
        title: "Présentation personnelle",
        description: "Apprenez à vous présenter",
        level: "A1",
        phrases: [
            "Oi, tudo bem?",
            "Como você se chama?",
            "Onde você mora?",
            "Qual é a sua profissão?"
        ],
        responses: [
            "Tudo bem, e você?",
            "Me chamo Maria",
            "Moro em São Paulo",
            "Sou professora"
        ]
    }
];

// Configuration de la reconnaissance vocale
let recognition;
let currentExerciseIndex = 0;
let activity = null;
let isRecording = false;

// Initialisation de la synthèse vocale
const synth = window.speechSynthesis;

// Chargement de l'activité
function loadActivity() {
    const urlParams = new URLSearchParams(window.location.search);
    const activityIndex = urlParams.get('activity') || 0;
    
    try {
        // Utiliser les activités préchargées
        activity = preloadedActivities[activityIndex];
        
        if (!activity) {
            throw new Error('Activité non trouvée');
        }
        
        document.getElementById('activity-title').textContent = activity.title;
        document.getElementById('level-badge').textContent = activity.level;
        document.getElementById('activity-description').textContent = activity.description;
        
        addMessage('system', 'Activité chargée avec succès');
        updateProgress();
        
        // Activer le bouton de démarrage
        document.getElementById('startButton').style.display = 'block';
        
    } catch (error) {
        console.error('Erreur de chargement:', error);
        addMessage('system', "Erreur: " + error.message);
    }
}

// Le reste du code reste identique...
