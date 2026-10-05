# 🎓 EduLoan - Gestion d'Emprunts de PC

> Application web pour les étudiants d'emprunter des PC portables à l'école.

![Status](https://img.shields.io/badge/Status-En%20Développement-yellow)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Fonctionnalités Implémentées

### 🔐 Système de Connexion *(NEW - v1.0.0)*
- ✅ Page de connexion moderne et responsive
- ✅ Validation des identifiants en temps réel
- ✅ Messages d'erreur clairs en cas d'identifiant incorrect
- ✅ Affichage/Masquage du mot de passe
- ✅ Gestion complète des sessions (24h par défaut)
- ✅ L'utilisateur reste connecté sauf s'il se déconnecte manuellement
- ✅ Redirection automatique vers le dashboard após succès

### 🔑 Récupération de Mot de Passe *(NEW - v1.0.0)*
- ✅ Page dédiée avec validation
- ✅ Vérification par: identifiant + nom + prénom
- ✅ Lien accessible depuis la page de connexion
- ✅ Retour du mot de passe (à adapter avec email en production)

### 📝 Inscription
- ✅ Création de compte étudiant
- ✅ Vérification de l'unicité de l'identifiant
- ✅ Stockage dans CSV

### 📱 Dashboard
- ✅ Accès après connexion
- ✅ Navigation principale
- ✅ Affichage des informations étudiant

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 14+ ([Télécharger](https://nodejs.org/))
- **npm** (inclus avec Node.js)

### Installation

```bash
# 1️⃣ Cloner/Copier le projet
cd Gestion_emprunt

# 2️⃣ Installer les dépendances
npm install

# 3️⃣ Démarrer le serveur
npm start
```

✅ Le serveur démarre sur: **http://localhost:3000**

---

## 🧪 Tester la Connexion

### Compte de test
```
Identifiant: 2026120
Mot de passe: sdfscsd
Nom: BENDAOU
Prénom: Assia
```

### Accès aux pages
| Page | URL |
|------|-----|
| Accueil | http://localhost:3000 |
| Inscription | http://localhost:3000/inscription.html |
| **Connexion** | http://localhost:3000/login.html |
| Mot de passe oublié | http://localhost:3000/forgot-password.html |
| Dashboard | http://localhost:3000/index.html |

---

## 📁 Structure du Projet

```
Gestion_emprunt/
├── 📄 server.js                 ← Serveur Express + Routes API
├── 📄 package.json              ← Dépendances Node.js
│
├── 🌐 Pages HTML
│   ├── login.html               ← Connexion (NEW ✨)
│   ├── forgot-password.html     ← Mot de passe oublié (NEW ✨)
│   ├── inscription.html         ← Inscription
│   └── index.html               ← Dashboard
│
├── 🎨 Styles CSS
│   ├── css/login.css            ← Styles connexion (NEW ✨)
│   ├── css/inscription.css      ← Styles inscription
│   └── css/dashboard.css        ← Styles dashboard
│
├── 📜 Scripts JavaScript
│   ├── js/login.js              ← Logique connexion (NEW ✨)
│   ├── js/forgot-password.js    ← Logique mot de passe (NEW ✨)
│   ├── js/inscription.js        ← Logique inscription
│   └── js/dashboard.js          ← Logique dashboard
│
├── 💾 Base de données
│   └── data/etudiants.csv       ← Fichier CSV avec étudiants
│
├── 🖼️  Ressources
│   └── assets/images/           ← Images et logo
│
├── 📚 Documentation
│   ├── SETUP.md                 ← Guide complet d'installation
│   ├── QUICK-START.md           ← Démarrage rapide
│   ├── README.md                ← Ce fichier
│   └── .gitignore               ← Fichiers à ignorer
│
└── 🐳 Optionnel (Docker)
    ├── Dockerfile
    ├── docker-compose.yml
    └── nginx/nginx.conf
```

---

## 🔌 API Routes

### Connexion
```http
POST /api/login
Content-Type: application/json

{
  "student_id": "2026120",
  "password": "sdfscsd"
}

Response:
{
  "success": true,
  "message": "Connexion réussie !",
  "data": {
    "student_id": "2026120",
    "nom": "BENDAOU",
    "prenom": "Assia"
  }
}
```

### Vérifier la session
```http
GET /api/check-session

Response:
{
  "success": true,
  "authenticated": true,
  "student": {
    "student_id": "2026120",
    "nom": "BENDAOU",
    "prenom": "Assia",
    "dateConnexion": "2026-09-25T17:30:00.000Z"
  }
}
```

### Déconnexion
```http
POST /api/logout

Response:
{
  "success": true,
  "message": "Déconnexion réussie !"
}
```

### Récupération de mot de passe
```http
POST /api/forgot-password
Content-Type: application/json

{
  "student_id": "2026120",
  "nom": "BENDAOU",
  "prenom": "Assia"
}

Response:
{
  "success": true,
  "message": "Un lien de récupération a été envoyé...",
  "password": "sdfscsd"
}
```

### Inscription
```http
POST /api/inscription
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "student_id": "2026999",
  "password": "monMotDePasse"
}

Response:
{
  "success": true,
  "message": "Inscription réussie !",
  "data": {
    "nom": "Dupont",
    "prenom": "Jean",
    "student_id": "2026999"
  }
}
```

---

## 🛠️ Technologies Utilisées

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 14+ | Runtime serveur |
| **Express** | ^4.18.2 | Framework web |
| **express-session** | ^1.17.3 | Gestion des sessions |
| **HTML5** | Latest | Markup |
| **CSS3** | Latest | Styling |
| **JavaScript** | ES6+ | Frontend logic |
| **CSV** | Plain text | Base de données |

---

## 📋 Gestion des Sessions

### Configuration
- **Durée**: 24 heures par défaut
- **Cookie**: httpOnly (sécurisé)
- **Stockage**: Mémoire (en développement)

### Comportement
✅ L'utilisateur reste connecté
✅ Même après fermeture du navigateur (cookies persistants)
✅ Sauf s'il clique sur "Déconnexion"

### En Production
- Changer le `secret` de session
- Utiliser une base de données (Redis/MongoDB) au lieu de la mémoire
- Activer `secure: true` avec HTTPS

---

## ⚙️ Mode Développement

### Installation de nodemon
```bash
npm install --save-dev nodemon
```

### Lancer le serveur en mode auto-reload
```bash
npm run dev
```

Le serveur redémarrera automatiquement si vous modifiez des fichiers.

---

## 🔒 Sécurité (À Améliorer)

### ⚠️ Points à adresser en production:

1. **Hachage des mots de passe** → Utiliser `bcrypt`
   ```bash
   npm install bcrypt
   ```

2. **Limite de tentatives** → Implémenter un rate limiter
   ```bash
   npm install express-rate-limit
   ```

3. **Validation des entrées** → Utiliser `joi` ou `celebrate`
   ```bash
   npm install joi
   ```

4. **HTTPS obligatoire** → Générer certificats SSL/TLS

5. **Email pour mot de passe oublié** → Utiliser `nodemailer`
   ```bash
   npm install nodemailer
   ```

6. **Variables d'environnement** → Utiliser `dotenv`
   ```bash
   npm install dotenv
   ```

---

## 🐛 Dépannage

### ❌ "Cannot find module 'express'"
```bash
npm install
```

### ❌ "Port 3000 is already in use"
```bash
# Changer le port dans server.js
const PORT = 3001; // au lieu de 3000
```

### ❌ "EACCES: permission denied"
```bash
sudo npm start  # Sur Linux/Mac
```

### ❌ Identifiants ne marchent pas
- Vérifiez `data/etudiants.csv`
- Vérifiez les espaces/majuscules
- Les données sont sensibles à la casse

---

## 📚 Guides Supplémentaires

- **[SETUP.md](./SETUP.md)** - Guide d'installation complet
- **[QUICK-START.md](./QUICK-START.md)** - Démarrage rapide
- **[verify.sh](./verify.sh)** - Script de vérification

---

## 🚀 Déploiement

### Avec Docker
```bash
docker-compose up
```

### Sur Node.js en production
```bash
# Installer PM2 pour la gestion des processus
npm install -g pm2

# Démarrer le serveur
pm2 start server.js --name "eduLoan"

# Logs
pm2 logs eduLoan
```

---

## 📦 Dépendances

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 📝 Fichier CSV

Format: `Nom;Prénom;Identifiant;MotDePasse;DateInscription`

```csv
Nom;Prénom;Identifiant;MotDePasse;DateInscription
BENDAOU;Assia;2026120;sdfscsd;2026-09-25 14:56:18
DIOP;Moussa;2026130;pass1234;2026-09-25 16:08:44
```

---

## 📄 License

MIT License - Libre d'utilisation et de modification

---

## 👨‍💻 Auteur

Développé pour le projet EduLoan de gestion d'emprunts de PC.

---

## 🎯 Prochaines Étapes

- [ ] Intégrer une vraie base de données (MongoDB/PostgreSQL)
- [ ] Hacher les mots de passe (bcrypt)
- [ ] Ajouter 2FA (authentification deux facteurs)
- [ ] Implémenter les emprunts de PC
- [ ] Dashboard complet avec historique
- [ ] Admin panel pour gérer les étudiants
- [ ] Email notifications

---

**Besoin d'aide ? Consultez les guides dans le dossier du projet! 🚀**
