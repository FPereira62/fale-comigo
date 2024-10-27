// Activités préchargées (garder la même partie)...

// Variables globales
let recognition = null;
let synth = null;
let voices = [];
let currentExerciseIndex = 0;
let activity = null;
let isRecording = false;
let audioInitialized = false;

// Initialisation de la synthèse vocale
async function initAudio() {
    if (audioInitialized) return true;
    
    try {
        synth = window.speechSynthesis;
        // Force le chargement des voix
        await new Promise((resolve) => {
            if (synth.getVoices().length > 0) {
                resolve();
            } else {
                synth.onvoiceschanged = resolve;
            }
        });
        
        voices = synth.getVoices();
        const portugueseVoice = voices.find(voice => 
            voice.lang.includes('pt-BR') || voice.lang.includes('pt-PT')
        );
        
        if (portugueseVoice) {
            addMessage('system', 'Système audio initialisé');
            audioInitialized = true;
            return true;
        } else {
            addMessage('system', 'Pas de voix portugaise trouvée');
            return false;
        }
    } catch (error) {
        console.error('Erreur initialisation audio:', error);
        addMessage('system', 'Erreur initialisation audio');
        return false;
    }
}

// Fonction de synthèse vocale
async function speak(text) {
    if (!audioInitialized) {
        const initialized = await initAudio();
        if (!initialized) return;
    }

    return new Promise((resolve, reject) => {
        synth.cancel(); // Arrête toute synthèse en cours

        const utterance = new SpeechSynthesisUtterance(text);
        const portugueseVoice = voices.find(voice => 
            voice.lang.includes('pt-BR') || voice.lang.includes('pt-PT')
        );

        if (portugueseVoice) {
            utterance.voice = portugueseVoice;
        }

        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
            addMessage('system', '(Audio terminé)');
            resolve();
        };

        utterance.onerror = (event) => {
            console.error('Erreur audio:', event);
            addMessage('system', 'Erreur de lecture audio');
            reject(event);
        };

        addMessage('assistant', text);
        synth.speak(utterance);
    });
}

// Modification de la fonction startExercise
async function startExercise() {
    addMessage('system', 'Démarrage de l\'exercice...');
    
    if (!activity || !activity.phrases || activity.phrases.length === 0) {
        addMessage('system', "Erreur: aucune phrase disponible");
        return;
    }

    try {
        // Initialisation de l'audio au clic
        const audioReady = await initAudio();
        if (!audioReady) {
            addMessage('system', 'Impossible d\'initialiser l\'audio');
            return;
        }

        document.getElementById('startButton').style.display = 'none';
        document.getElementById('micButton').style.display = 'block';
        currentExerciseIndex = 0;
        updateProgress();

        addMessage('assistant', "Commençons l'exercice. Écoutez et répétez.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        await speak(activity.phrases[0]);
        
        // Activation du microphone après la lecture
        document.getElementById('micButton').disabled = false;

    } catch (error) {
        console.error('Erreur de démarrage:', error);
        addMessage('system', 'Erreur lors du démarrage de l\'exercice');
        document.getElementById('startButton').style.display = 'block';
    }
}

// Mise à jour de la fonction checkResponse
async function checkResponse(userText) {
    if (!activity || currentExerciseIndex >= activity.phrases.length) return;
    
    const expectedResponse = activity.responses[currentExerciseIndex].toLowerCase();
    const userResponse = userText.toLowerCase();
    
    const isCorrect = userResponse.includes(expectedResponse) || 
                     expectedResponse.includes(userResponse);
    
    if (isCorrect) {
        addMessage('system', '✓ Très bien !');
        currentExerciseIndex++;
        updateProgress();
        
        if (currentExerciseIndex < activity.phrases.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await speak(activity.phrases[currentExerciseIndex]);
        } else {
            addMessage('system', 'Félicitations ! Exercice terminé.');
            document.getElementById('micButton').style.display = 'none';
            const startButton = document.getElementById('startButton');
            startButton.textContent = 'Recommencer';
            startButton.style.display = 'block';
            currentExerciseIndex = 0;
        }
    } else {
        addMessage('system', '✗ Essayez encore');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await speak(activity.phrases[currentExerciseIndex]);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    loadActivity();
    
    // Ajout d'un gestionnaire d'événements pour le bouton de démarrage
    document.getElementById('startButton').addEventListener('click', async () => {
        try {
            await startExercise();
        } catch (error) {
            console.error('Erreur lors du démarrage:', error);
            addMessage('system', 'Erreur lors du démarrage');
        }
    });
});
