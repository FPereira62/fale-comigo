// Gestion du stockage local des activités
const STORAGE_KEY = 'portugues-pratico-activities';

// Charger les activités existantes
function loadActivities() {
    const activities = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const list = document.getElementById('activities-list');
    list.innerHTML = '';
    
    activities.forEach((activity, index) => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h3>${activity.title}
                        <span class="level-badge">${activity.level}</span>
                    </h3>
                    <p>${activity.description}</p>
                </div>
                <button onclick="generateQRCode(${index})" class="secondary">QR Code</button>
            </div>
        `;
        list.appendChild(card);
    });
}

// Sauvegarder une nouvelle activité
function saveActivity(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const phrases = [];
    const responses = [];
    form.querySelectorAll('input[name="phrases[]"]').forEach(input => phrases.push(input.value));
    form.querySelectorAll('input[name="responses[]"]').forEach(input => responses.push(input.value));
    
    const activity = {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        phrases,
        responses,
        created: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    activities.push(activity);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    
    showSection('activities');
    loadActivities();
    form.reset();
}

// Ajouter une nouvelle paire phrase/réponse
function addPhrasePair() {
    const template = `
        <div class="phrase-pair">
            <div>
                <label>Phrase</label>
                <input type="text" name="phrases[]" required>
            </div>
            <div>
                <label>Réponse attendue</label>
                <input type="text" name="responses[]" required>
            </div>
            <button type="button" class="delete" onclick="removePair(this)">×</button>
        </div>
    `;
    document.getElementById('phrases-list').insertAdjacentHTML('beforeend', template);
}

// Supprimer une paire phrase/réponse
function removePair(button) {
    button.closest('.phrase-pair').remove();
}

// Gérer la navigation entre les sections
function showSection(sectionId) {
    document.querySelectorAll('.content > div').forEach(div => {
        div.style.display = 'none';
    });
    document.getElementById(`${sectionId}-section`).style.display = 'block';
    
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.classList.remove('active');
    });
    document.querySelector(`.sidebar a[onclick="showSection('${sectionId}')"]`).classList.add('active');
    
    if (sectionId === 'activities') {
        loadActivities();
    }
}

// Générer un QR Code pour une activité
function generateQRCode(index) {
    const activities = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const activity = activities[index];
    const url = `${window.location.origin}/student/index.html?activity=${index}`;
    
    // Pour cette version de test, on affiche simplement l'URL
    alert(`URL de l'activité : ${url}\n\nVous pourrez scanner ce QR code avec l'application mobile.`);
}

// Charger les activités au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadActivities();
});
