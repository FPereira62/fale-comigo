// Ajoutez ces variables au début du fichier, avec les autres variables globales
let synth = window.speechSynthesis;
let voices = [];

// Ajoutez cette nouvelle fonction
function initializeSpeechSynthesis() {
    synth = window.speechSynthesis;
    
    // Fonction pour charger les voix
    function loadVoices() {
        voices = synth.getVoices();
        const portugueseVoice = voices.find(voice => 
            voice.lang.includes('pt-BR') || voice.lang.includes('pt-PT')
        );
        if (portugueseVoice) {
            console.log('Voix portugaise trouvée:', portugueseVoice.name);
        } else {
            console.log('Aucune voix portugaise trouvée');
        }
    }

    // Chargement initial des voix
    loadVoices();

    // Événement de chargement des voix (nécessaire pour Chrome)
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}

// Remplacez la fonction speak existante par celle-ci
function speak(text) {
    return new Promise((resolve, reject) => {
        if (!synth) {
            console.error('La synthèse vocale n\'est pas supportée');
            addMessage('system', 'Erreur: synthèse vocale non supportée');
            reject(new Error('Synthèse vocale non supportée'));
            return;
        }

        // Annuler toute synthèse vocale en cours
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Trouver une voix portugaise
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
            console.log('Audio terminé');
            resolve();
        };

        utterance.onerror = (event) => {
            console.error('Erreur de synthèse vocale:', event);
            addMessage('system', 'Erreur de synthèse vocale');
            reject(event);
        };

        addMessage('assistant', text);
        synth.speak(utterance);
    });
}

// Modifiez la fonction d'initialisation pour inclure la synthèse vocale
document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    initializeSpeechSynthesis();
    loadActivity();
});

// Modifiez la fonction startExercise pour utiliser async/await
async function startExercise() {
    if (!activity || !activity.phrases || activity.phrases.length === 0) {
        addMessage('system', "Impossible de démarrer : aucune phrase n'est disponible");
        return;
    }
    
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('micButton').style.display = 'block';
    currentExerciseIndex = 0;
    updateProgress();
    
    addMessage('assistant', "Commençons l'exercice. Écoutez et répétez.");
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await speak(activity.phrases[0]);
    } catch (error) {
        console.error('Erreur lors de la lecture:', error);
        addMessage('system', 'Erreur lors de la lecture audio');
    }
}
