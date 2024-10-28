// Remplacez tout le contenu de la balise <script> par ce qui suit :
<script>
    let currentStep = 1;
    const totalSteps = 3;

    function addChip(containerId, inputId) {
        const container = document.getElementById(containerId);
        const input = document.getElementById(inputId);
        const value = input.value.trim();
        
        if (value) {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `
                ${value}
                <button type="button" onclick="this.parentElement.remove()">×</button>
            `;
            container.appendChild(chip);
            input.value = '';
        }
    }

    function getChipsValues(containerId) {
        return Array.from(document.getElementById(containerId).children)
            .map(chip => chip.textContent.trim().replace('×', '').trim())
            .filter(text => text.length > 0); // Filtrer les chaînes vides
    }

    function getFormData() {
        const formData = new FormData(document.getElementById('configForm'));
        const config = {
            theme: formData.get('theme'),
            niveau: formData.get('niveau'),
            contexte: formData.get('contexte'),
            role: formData.get('role'),
            personnalite: formData.get('personnalite'),
            correction_style: formData.get('correction_style'),
            aide_niveau: formData.get('aide_niveau'),
            objectifs: getChipsValues('objectifs'),
            structures: getChipsValues('structures'),
            vocabulaire: getChipsValues('vocabulaire')
        };
        
        return config;
    }

    function previewConfig() {
        const preview = document.getElementById('configPreview');
        const config = getFormData();
        
        // Formater le JSON pour l'affichage
        const formattedConfig = JSON.stringify(config, null, 2);
        
        // Mettre à jour l'affichage
        preview.querySelector('code').textContent = formattedConfig;
        
        // Basculer l'affichage
        if (preview.style.display === 'none') {
            preview.style.display = 'block';
            preview.scrollIntoView({ behavior: 'smooth' });
        } else {
            preview.style.display = 'none';
        }
    }

    function saveConfig() {
        const config = getFormData();
        localStorage.setItem('currentConfig', JSON.stringify(config));
        alert('Configuration sauvegardée !');
        // Ici, vous pourriez rediriger vers la page suivante
        // window.location.href = '/next-page';
    }

    function goBack() {
        if (currentStep > 1) {
            currentStep--;
            updateSteps();
        }
    }

    function goForward() {
        if (currentStep < totalSteps) {
            currentStep++;
            updateSteps();
        } else {
            saveConfig();
        }
    }

    function updateSteps() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else if (index + 1 < currentStep) {
                step.classList.add('completed');
            }
        });
    }

    // Écouteurs d'événements pour les boutons
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelector('button.secondary').addEventListener('click', goBack);
        document.querySelector('button.primary').addEventListener('click', goForward);
    });
</script>
