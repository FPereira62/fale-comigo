// Dans la section initialisation du script.js, modifiez comme suit :
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM chargé");
    
    // Correction pour le bouton Nouvelle activité
    const newActivityBtn = document.getElementById('newActivityBtn');
    if (newActivityBtn) {
        newActivityBtn.onclick = function() {
            console.log("Clic sur Nouvelle activité");
            createNewActivity();
            return false; // Empêche le comportement par défaut
        };
    }

    // Initialisation du formulaire
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.onsubmit = async function(event) {
            event.preventDefault();
            console.log("Soumission du formulaire");
            if (!validateForm()) {
                showError("Veuillez remplir tous les champs requis");
                return false;
            }
            const success = await saveToFirestore(currentConfig);
            if (success) {
                showSuccess("Activité sauvegardée avec succès");
                ViewManager.showActivitiesList();
            }
        };
    }

    // Reste de l'initialisation...
});

// Fonction de validation améliorée
function validateForm() {
    const requiredFields = ['theme', 'niveau', 'contexte', 'role', 'personnalite'];
    const missingFields = requiredFields.filter(field => {
        const element = document.getElementById(field);
        return !element || !element.value.trim();
    });

    if (missingFields.length > 0) {
        console.log("Champs manquants:", missingFields);
        return false;
    }
    return true;
}

// Amélioration de la fonction createNewActivity
function createNewActivity() {
    console.log("Création d'une nouvelle activité");
    resetForm();
    if (document.getElementById('configView')) {
        ViewManager.showConfigForm();
    } else {
        console.error("Element 'configView' non trouvé");
    }
}

// Amélioration de la fonction updateFormState
function updateFormState() {
    const form = document.getElementById('configForm');
    if (!form) {
        console.error("Formulaire non trouvé");
        return;
    }

    const formData = {
        theme: document.getElementById('theme')?.value || '',
        niveau: document.getElementById('niveau')?.value || '',
        contexte: document.getElementById('contexte')?.value || '',
        role: document.getElementById('role')?.value || '',
        personnalite: document.getElementById('personnalite')?.value || '',
        objectifs: getChipsValues('objectifs'),
        structures: getChipsValues('structures'),
        vocabulaire: getChipsValues('vocabulaire'),
        correction_style: document.getElementById('correction_style')?.value || 'immediate',
        aide_niveau: document.getElementById('aide_niveau')?.value || 'minimal'
    };

    currentConfig = { ...currentConfig, ...formData };
    console.log("État du formulaire mis à jour:", currentConfig);

    // Mise à jour du chatbot uniquement si tous les champs requis sont remplis
    if (validateForm()) {
        if (window.chatbotPreview) {
            updateChatbotPreview();
        }
    }
}
