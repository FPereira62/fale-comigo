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

let recognition;
let currentExerciseIndex = 0;
let activity = null;
let isRecording = false;

// Initialisation de la reconnaissance vocale
function initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("La reconnaissance vocale n'est pas supportée par votre navigateur");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
        isRecording = true;
        document.getElementById('micButton').classList.add('recording');
        document.getElementById('status').textContent = 'Écoutant...';
    };

    recognition.onend = () => {
        isRecording = false;
        document.getElementById('micButton').classList.remove('recording');
        document.getElementById('status').textContent = '';
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        addMessage('user', text);
        checkResponse(text);
    };

    recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance:', event.error);
        document.getElementById('status').textContent = "Erreur de reconnaissance vocale";
        document.getElementById('micButton').classList.remove('recording');
    };
}

// Chargement de l'activité
function loadActivity() {
    const urlParams = new URLSearchParams(window.location.search);
    const activityIndex = parseInt(urlParams.get('activity')) || 0;
    
    try {
        activity = preloadedActivities[activityIndex];
        
        if (!activity) {
            throw new Error('Activité non trouvée');
        }
        
        document.getElementById('activity-title').textContent = activity.title;
        document.getElementById('level-badge').textContent = activity.level;
        document.getElementById('activity-description').textContent = activity.description;
        
        // Afficher le bouton de démarrage
        const startButton = document.getElementById('startButton');
        startButton.style.display = 'block';
        startButton.onclick = startExercise;
        
    } catch (error) {
        console.error('Erreur de chargement:', error);
        addMessage('system', "Erreur: " + error.message);
    }
}

// Démarrage de l'exercice
function startExercise() {
    if (!activity || !activity.phrases || activity.phrases.length === 0) {
        addMessage('system', "Impossible de démarrer : aucune phrase n'est disponible");
        return;
    }
    
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('micButton').style.display = 'block';
    currentExerciseIndex = 0;
    updateProgress();
    
    addMessage('assistant', "Commençons l'exercice. Écoutez et répétez.");
    setTimeout(() => {
        speak(activity.phrases[0]);
    }, 1000);
}

// Parler un texte
function speak(text) {
    if (!window.speechSynthesis) {
        console.error('La synthèse vocale nest pas supportée');
        addMessage('system', 'Erreur: synthèse vocale non supportée');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

// Ajout d'un message dans le chat
function addMessage(type, text) {
    const chat = document.getElementById('chat');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

// Mise à jour de la progression
function updateProgress() {
    const progress = (currentExerciseIndex / activity.phrases.length) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

// Vérification de la réponse
function checkResponse(userText) {
    if (!activity || currentExerciseIndex >= activity.phrases.length) return;
    
    const expectedResponse = activity.responses[currentExerciseIndex].toLowerCase();
    const userResponse = userText.toLowerCase();
    
    setTimeout(() => {
        const isCorrect = userResponse.includes(expectedResponse) || 
                         expectedResponse.includes(userResponse);
        
        if (isCorrect) {
            addMessage('system', '✓ Très bien !');
            currentExerciseIndex++;
            updateProgress();
            
            if (currentExerciseIndex < activity.phrases.length) {
                setTimeout(() => {
                    speak(activity.phrases[currentExerciseIndex]);
                }, 1000);
            } else {
                addMessage('system', 'Félicitations ! Vous avez terminé cet exercice.');
                document.getElementById('micButton').style.display = 'none';
                document.getElementById('startButton').style.display = 'block';
                document.getElementById('startButton').textContent = 'Recommencer';
            }
        } else {
            addMessage('system', '✗ Essayez encore');
            setTimeout(() => {
                speak(activity.phrases[currentExerciseIndex]);
            }, 1000);
        }
    }, 500);
}

// Gestionnaire du bouton microphone
document.getElementById('micButton').addEventListener('click', () => {
    if (recognition) {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    loadActivity();
});
