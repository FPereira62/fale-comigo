// Les fonctions existantes pour les chips restent identiques (addChip, removeChip, updateAddButton, getChipsValues)

// Nouvelle fonction pour sauvegarder une configuration dans Firestore
async function saveConfig(config) {
    try {
        const docRef = await db.collection('activites').add({
            ...config,
            dateCreation: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Configuration sauvegardée avec ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde: ", error);
        return false;
    }
}

// Nouvelle fonction pour récupérer toutes les activités
async function getActivities() {
    try {
        const snapshot = await db.collection('activites').orderBy('dateCreation', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Erreur lors de la récupération des activités: ", error);
        return [];
    }
}

// Modifier la fonction verifierConfig pour utiliser ces nouvelles fonctions
function verifierConfig() {
    const form = document.getElementById('configForm');
    const formData = new FormData(form);
    const config = {
        ...Object.fromEntries(formData.entries()),
        objectifs: getChipsValues('objectifs'),
        structures: getChipsValues('structures'),
        vocabulaire: getChipsValues('vocabulaire')
    };

    document.getElementById('review-info').innerHTML = `
        <p><strong>Thème:</strong> ${config.theme}</p>
        <p><strong>Niveau:</strong> ${config.niveau}</p>
        <p><strong>Contexte:</strong> ${config.contexte}</p>
    `;

    document.getElementById('review-chatbot').innerHTML = `
        <p><strong>Rôle:</strong> ${config.role}</p>
        <p><strong>Personnalité:</strong> ${config.personnalite}</p>
        <p><strong>Objectifs:</strong></p>
        <div>${config.objectifs.map(obj => `<span class="badge">${obj}</span>`).join(' ')}</div>
    `;

    document.getElementById('review-params').innerHTML = `
        <p><strong>Structures grammaticales:</strong></p>
        <div>${config.structures.map(str => `<span class="badge">${str}</span>`).join(' ')}</div>
        <p><strong>Vocabulaire:</strong></p>
        <div>${config.vocabulaire.map(voc => `<span class="badge">${voc}</span>`).join(' ')}</div>
        <p><strong>Style de correction:</strong> ${config.correction_style}</p>
        <p><strong>Niveau d'aide:</strong> ${config.aide_niveau}</p>
    `;

    showModal('verificationModal');
}

// Modifier le gestionnaire du formulaire
document.getElementById('configForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const config = {
        ...Object.fromEntries(formData.entries()),
        objectifs: getChipsValues('objectifs'),
        structures: getChipsValues('structures'),
        vocabulaire: getChipsValues('vocabulaire')
    };

    closeModal('verificationModal');
    
    const saveSuccess = await saveConfig(config);
    if (saveSuccess) {
        showModal('successModal');
    } else {
        alert('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
    }
});

// Nouvelle fonction pour réinitialiser le formulaire
function resetForm() {
    document.getElementById('configForm').reset();
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        document.getElementById(id).innerHTML = '';
        updateAddButton(id);
    });
    closeModal('successModal');
}

// Les autres fonctions (showModal, closeModal, etc.) restent identiques

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les boutons d'ajout
    ['objectifs', 'structures', 'vocabulaire'].forEach(id => {
        updateAddButton(id);
    });

    // Permettre l'ajout de chips avec la touche Entrée
    ['newObjectif', 'newStructure', 'newVocab'].forEach(inputId => {
        document.getElementById(inputId).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChip(this.id.replace('new', '').toLowerCase(), this.id);
            }
        });
    });
});
