# Português Prático

Application d'apprentissage du portugais avec interface professeur et étudiant.

## Déploiement rapide

### Sur Netlify

1. Créez un compte sur [Netlify](https://www.netlify.com/)
2. Cliquez sur "New site from Git"
3. Choisissez votre dépôt GitHub
4. Configuration du build :
   - Build command: laisser vide
   - Publish directory: src

### Sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre dépôt GitHub
4. Configuration automatique - aucune configuration supplémentaire nécessaire

## Structure de l'application

- `/src/teacher/` : Interface professeur (accessible via /teacher)
- `/src/student/` : Interface étudiant (accessible via /student)

## Test local

1. Installez Node.js
2. Exécutez `npm install`
3. Exécutez `npm start`
4. Ouvrez `http://localhost:3000`

## Remarques importantes

- L'accès au microphone nécessite HTTPS en production
- Testez d'abord sur Chrome pour la meilleure compatibilité
- Les données sont stockées localement pour cette version de test
