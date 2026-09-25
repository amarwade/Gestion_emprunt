# 🚀 GUIDE RAPIDE - Sur une autre machine

## 3️⃣ Étapes Simples

### Étape 1: Copier le dossier
```
Copier le dossier "Gestion_emprunt" sur l'autre machine
```

### Étape 2: Installer les dépendances
Ouvrir un terminal dans le dossier et taper:
```bash
npm install
```
⏳ Attendre quelques secondes...

### Étape 3: Démarrer le serveur
```bash
npm start
```

✅ Vous verrez:
```
Serveur EduLoan démarré sur http://localhost:3000
```

---

## 📱 Accéder à l'application

Ouvrez votre navigateur et allez à:

| Page | URL |
|------|-----|
| 🏠 Accueil | http://localhost:3000 |
| 📝 Inscription | http://localhost:3000/inscription.html |
| 🔐 **Connexion** | http://localhost:3000/login.html |
| 🔑 Mot de passe oublié | http://localhost:3000/forgot-password.html |

---

## 🧪 Tester Immédiatement

### Compte de test:
- **Identifiant**: `2026120`
- **Mot de passe**: `sdfscsd`

👉 Allez à: http://localhost:3000/login.html

---

## ⚠️ Prérequis (à faire une seule fois)

Télécharger et installer **Node.js**:
👉 https://nodejs.org/

Vérifier dans le terminal:
```bash
node --version
npm --version
```

---

## ❌ Ça ne marche pas?

1. **Le serveur refuse de démarrer** → `npm install`
2. **Erreur "Cannot find module"** → `npm install`
3. **Page 404 en accédant à /login.html** → Vérifiez qui'il y a: `login.html` et `js/login.js`
4. **Les identifiants ne marchent pas** → Vérifiez le `data/etudiants.csv`

---

## 📂 Fichiers IMPORTANTS à copier

✅ À COPIER:
- `server.js`
- `package.json`
- `login.html` *(NEW)*
- `forgot-password.html` *(NEW)*
- `js/login.js` *(NEW)*
- `js/forgot-password.js` *(NEW)*
- `css/login.css` *(NEW)*
- `data/etudiants.csv`
- Tous les autres fichiers

❌ À NE PAS COPIER:
- `node_modules/` (sera créé automatiquement avec `npm install`)
- `.git/` (si c'est un repo)

---

## 💡 Astuce

Si vous faites un ZIP du projet pour l'envoyer:
1. ✅ Inclure tous les fichiers
2. ✅ Inclure `package.json`
3. ❌ Exclure le dossier `node_modules/`
4. ❌ Exclure `.git/`

Voir `.gitignore` pour les fichiers à ignorer.

---

**C'est tout ! Le projet devrait fonctionner! 🎉**
