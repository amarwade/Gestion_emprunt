# 📋 Guide de Configuration - EduLoan

## Sur une AUTRE machine

### Prérequis
- **Node.js** installé (version 14 ou supérieure)
  - Télécharger: https://nodejs.org/
  - Vérifier: `node --version` et `npm --version` dans le terminal

### Étape 1️⃣: Copier les fichiers
Copiez TOUS les fichiers du projet sur l'autre machine (le dossier `Gestion_emprunt` complet).

### Étape 2️⃣: Ouvrir le terminal
Naviguez vers le dossier du projet:
```bash
cd chemin/vers/Gestion_emprunt
```

### Étape 3️⃣: Installer les dépendances
Lancez la commande:
```bash
npm install
```
Cela va installer `express` et `express-session` automatiquement depuis le `package.json`.

### Étape 4️⃣: Démarrer le serveur
Lancez la commande:
```bash
npm start
```

Vous devriez voir:
```
Serveur EduLoan démarré sur http://localhost:3000
```

### Étape 5️⃣: Accéder à l'application
Ouvrez votre navigateur et allez à:
- **Page d'accueil**: http://localhost:3000
- **Inscription**: http://localhost:3000/inscription.html
- **Connexion**: http://localhost:3000/login.html
- **Mot de passe oublié**: http://localhost:3000/forgot-password.html

---

## 🧪 Tester la Connexion

### Compte de test existant
Utilisez ces identifiants pour tester:

| Identifiant | Mot de passe | Nom | Prénom |
|-------------|--------------|-----|--------|
| 2026120 | sdfscsd | BENDAOU | Assia |
| 2026125 | aosijdlksdcjslcj | BENDAOU | Assia |
| 2026130 | pass1234 | DIOP | Moussa |
| 2026345 | kldlkc | BENDAOU | Assia |
| 2026127 | nm,shjkkc | an | anne |
| 2026123 | 12345678 | diara | dia |

### Exemple:
1. Allez à http://localhost:3000/login.html
2. Entrez l'identifiant: `2026120`
3. Entrez le mot de passe: `sdfscsd`
4. Cliquez "Connexion"
5. Vous serez redirigé vers le dashboard si c'est correct

---

## 🔧 Mode Développement (Optionnel)

Pour un mode développement avec redémarrage automatique:

### Installer nodemon
```bash
npm install --save-dev nodemon
```

### Lancer en mode dev
```bash
npm run dev
```

Le serveur redémarrera automatiquement si vous modifiez des fichiers.

---

## 📁 Structure du Projet

```
Gestion_emprunt/
├── server.js                 # Serveur Express (routes API + sessions)
├── package.json              # Dépendances Node.js
├── index.html                # Dashboard principal
├── login.html                # Page de CONNEXION (NEW ✨)
├── inscription.html          # Page d'inscription
├── forgot-password.html       # Récupération mot de passe (NEW ✨)
├── css/
│   ├── login.css             # Styles connexion (NEW ✨)
│   ├── inscription.css       # Styles inscription
│   └── dashboard.css         # Styles dashboard
├── js/
│   ├── login.js              # Logique connexion (NEW ✨)
│   ├── forgot-password.js    # Logique récupération (NEW ✨)
│   ├── inscription.js        # Logique inscription
│   └── dashboard.js          # Logique dashboard
├── data/
│   └── etudiants.csv         # Base de données (CSV)
├── assets/
│   └── images/
│       └── logo.png          # Logo EduLoan
└── nginx/
    └── nginx.conf            # (Optionnel - pour Docker)
```

---

## ✨ Nouvelles Fonctionnalités Implémentées

### 🔐 Connexion (Login)
- **Page**: `/login.html`
- **Validation des identifiants** en temps réel
- **Affichage/Masquage du mot de passe**
- **Messages d'erreur clairs** si identifiants incorrects
- **Redirection automatique** vers le dashboard en cas de succès
- **Vérification de session** existante

### 🔑 Gestion des Sessions
- Les sessions restent **actives 24h** (configurable)
- L'utilisateur reste **connecté** même après fermeture du navigateur
- **Vérifiable** via l'API `/api/check-session`

### 🆘 Récupération de Mot de Passe
- **Page**: `/forgot-password.html`
- Vérifier: identifiant + nom + prénom
- **Retourner le mot de passe** (à adapter avec email en production)
- Lien accessible depuis la page de connexion

---

## 🛠️ Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que Node.js est installé
node --version

# Vérifier les dépendances
npm install

# Essayer de démarrer avec plus de détails
node server.js
```

### La page de connexion affiche "Cannot GET /login"
Vérifiez que:
1. Le serveur est bien démarré (`npm start`)
2. Vous accédez à `http://localhost:3000/login.html` (pas `/login`)
3. Les fichiers `login.html` et `js/login.js` existent

### Erreur: "Cannot find module 'express'"
```bash
npm install
```

### Les identifiants ne marchent pas
Vérifiez que:
1. Le fichier `data/etudiants.csv` existe et est accessible
2. Vous utilisez exactement le bon identifiant et mot de passe (sensible à la casse)
3. Les données du CSV ne sont pas corrompues

---

## 🚀 Déploiement en Production

### Changements recommandés:

1. **Changer la secret de session** dans `server.js`:
```javascript
secret: 'changez-cette-cle-secrete-long-et-aleatoire'
```

2. **Activer HTTPS** (SSL/TLS) et mettre `secure: true` dans les cookies

3. **Ajouter un système d'email** pour la récupération de mot de passe (au lieu de retourner le mot de passe)

4. **Hasher les mots de passe** (utiliser `bcrypt` au lieu de texte brut)

5. **Ajouter une limite de tentatives de connexion** (rate limiting)

---

## 📞 Support

Si vous avez des problèmes:
1. Vérifiez les logs dans le terminal
2. Consultez le fichier SETUP.md (ce fichier)
3. Testez avec les identifiants de test fournis

Bon développement! 🎉
