// Configuration de la reconnaissance vocale
let recognition;
let currentExerciseIndex = 0;
let activity = null;
let isRecording = false;

// Initialisation de la synthèse vocale
const synth = window.speechSynthesis;

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
    const activityIndex = urlParams.get('activity');
    
    try {
        const activities = JSON.parse(localStorage.getItem('portugues-pratico-activities') || '[]');
        activity = activities[activityIndex];
        
        if (!activity) throw new Error('Activité non trouvée');
        
        document.getElementById('activity-title').textContent = activity.title;
        document.getElementById('level-badge').textContent = activity.level;
        document.getElementById('activity-description').textContent = activity.description;
        
        updateProgress();
    } catch (error) {
        console.error('Erreur de chargement:', error);
        addMessage('system', "Erreur de chargement de l'activité");
    }
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

// Parler un texte
function speak(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    
    if (callback) {
        utterance.onend = callback;
    }
    
    synth.speak(utterance);
}

// Vérification de la réponse
function checkResponse(userText) {
    if (!activity || currentExerciseIndex >= activity.phrases.length) return;
    
    const expectedResponse = activity.responses[currentExerciseIndex].toLowerCase();
    const userResponse = userText.toLowerCase();
    
    // Logique de vérification simple - peut être améliorée pour plus de flexibilité
    const isCorrect = userResponse.includes(expectedResponse) || 
                     expectedResponse.includes(userResponse);
    
    setTimeout(() => {
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
            }
        } else {
            addMessage('system', '✗ Essayez encore');
            setTimeout(() => {
                speak(activity.phrases[currentExerciseIndex]);
            }, 1000);
        }
    }, 500);
}

// Mise à jour de la barre de progression
function updateProgress() {
    const progress = document.getElementById('progress');
    const percentage = (currentExerciseIndex / activity.phrases.length) * 100;
    progress.style.width = `${percentage}%`;
}

// Démarrage de l'exercice
function startExercise() {
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('micButton').style.display = 'block';
    currentExerciseIndex = 0;
    updateProgress();
    
    addMessage('assistant', "Commençons l'exercice. Écoutez et répétez.");
    setTimeout(() => {
        speak(activity.phrases[0]);
    }, 1000);
}

// Gestionnaire du bouton microphone
document.getElementById('micButton').addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

// Gestionnaire du bouton de démarrage
document.getElementById('startButton').addEventListener('click', startExercise);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    loadActivity();
});
