const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'data', 'etudiants.csv');

// Middleware
app.use(express.json());

// Configuration des sessions
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // false en développement, true en production avec HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

function isAdministrator(req) {
  return req.session.student && req.session.student.role === 'admin';
}

function requireAdministrator(req, res, next) {
  if (!isAdministrator(req)) {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({ success: false, error: 'Accès réservé aux administrateurs.' });
    }
    if (req.session.student) return res.status(403).send('Accès réservé aux administrateurs.');
    return res.redirect('/login.html');
  }
  next();
}

// Bloquer l'accès direct aux pages admin et au fichier contenant les mots de passe.
app.use((req, res, next) => {
  let normalizedPath;
  try {
    normalizedPath = decodeURIComponent(req.path).replace(/\/+$/, '').toLowerCase();
  } catch {
    return res.sendStatus(400);
  }
  if (normalizedPath === '/admin' || normalizedPath === '/admin.html') {
    res.setHeader('Cache-Control', 'no-store');
    return requireAdministrator(req, res, next);
  }
  if (normalizedPath === '/data/etudiants.csv') {
    return res.sendStatus(404);
  }
  next();
});

app.use(express.static(__dirname, { extensions: ['html', 'htm'] }));

// Redirections conviviales (avec ou sans .html)
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/inscription', (req, res) => res.sendFile(path.join(__dirname, 'inscription.html')));
app.get('/demande-pret', (req, res) => res.sendFile(path.join(__dirname, 'demande-pret.html')));
app.get('/espace-etudiant', (req, res) => res.sendFile(path.join(__dirname, 'espace-etudiant.html')));

// Formater la date en YYYY-MM-DD HH:mm:ss
function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// Lire les données CSV et retourner les étudiants
function readStudentsFromCSV() {
  if (!fs.existsSync(CSV_FILE)) return [];
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = content.split(/\r?\n/);
  const students = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(';');
    if (parts.length >= 5) {
      students.push({
        nom: parts[0].trim(),
        prenom: parts[1].trim(),
        student_id: parts[2].trim(),
        password: parts[3].trim(),
        dateInscription: parts[4].trim(),
        role: (parts[5] || 'etudiant').trim().toLowerCase()
      });
    }
  }
  return students;
}

// Lire les identifiants existants depuis data/etudiants.csv
function getExistingStudentIds() {
  if (!fs.existsSync(CSV_FILE)) return [];
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = content.split(/\r?\n/);
  const existingIds = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(';');
    if (parts.length >= 3) {
      existingIds.push(parts[2].trim());
    }
  }
  return existingIds;
}

// ===== ROUTES API =====

// Route POST /api/login - Connexion étudiant
app.post('/api/login', (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({
      success: false,
      error: 'L\'identifiant et le mot de passe sont obligatoires.'
    });
  }

  const students = readStudentsFromCSV();
  const student = students.find(s => s.student_id === student_id);

  if (!student) {
    return res.status(401).json({
      success: false,
      error: 'Utilisateur inexistant. Vérifiez votre identifiant ou créez un compte.'
    });
  }

  if (student.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Mot de passe incorrect. Veuillez réessayer.'
    });
  }

  // Création de la session
  req.session.student = {
    student_id: student.student_id,
    nom: student.nom,
    prenom: student.prenom,
    role: student.role,
    dateConnexion: new Date()
  };

  console.log(`[LOGIN OK] Étudiant connecté : ${student_id} (${student.prenom} ${student.nom})`);

  return res.status(200).json({
    success: true,
    message: 'Connexion réussie !',
    data: {
      student_id: student.student_id,
      nom: student.nom,
      prenom: student.prenom,
      role: student.role
    }
  });
});

// Route POST /api/logout - Déconnexion
app.post('/api/logout', (req, res) => {
  if (req.session.student) {
    const student_id = req.session.student.student_id;
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la déconnexion.'
        });
      }
      console.log(`[LOGOUT OK] Étudiant déconnecté : ${student_id}`);
      return res.status(200).json({
        success: true,
        message: 'Déconnexion réussie !'
      });
    });
  } else {
    return res.status(400).json({
      success: false,
      error: 'Aucune session active.'
    });
  }
});

// Route GET /api/check-session - Vérifier la session active
app.get('/api/check-session', (req, res) => {
  if (req.session.student) {
    return res.status(200).json({
      success: true,
      authenticated: true,
      student: req.session.student
    });
  } else {
    return res.status(200).json({
      success: true,
      authenticated: false
    });
  }
});

// Route POST /api/inscription : Inscription et ajout dans CSV
app.post('/api/inscription', (req, res) => {
  const { nom, prenom, student_id, password } = req.body;

  if (!nom || !prenom || !student_id || !password) {
    return res.status(400).json({
      success: false,
      error: 'Tous les champs sont obligatoires.'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Le mot de passe doit contenir au moins 8 caractères.'
    });
  }

  const existingIds = getExistingStudentIds();

  // Vérification de l'unicité de l'identifiant
  if (existingIds.includes(student_id)) {
    return res.status(409).json({
      success: false,
      error: 'Un compte existe déjà avec cet identifiant.'
    });
  }

  // Formater la nouvelle ligne CSV : Nom;Prénom;Identifiant;MotDePasse;DateInscription
  const dateStr = formatDate(new Date());
  const newRow = `${nom};${prenom};${student_id};${password};${dateStr};etudiant\n`;

  // Écrire la nouvelle ligne dans data/etudiants.csv
  fs.appendFileSync(CSV_FILE, newRow, 'utf8');

  console.log(`[CSV OK] Nouvel étudiant inscrit : ${student_id} (${prenom} ${nom})`);

  return res.status(200).json({
    success: true,
    message: 'Inscription réussie !',
    data: { nom, prenom, student_id }
  });
});

// Gestion des comptes réservée aux administrateurs.
app.get('/api/admin/accounts', requireAdministrator, (req, res) => {
  const accounts = readStudentsFromCSV().map(({ nom, prenom, student_id, role, dateInscription }) => ({
    nom,
    prenom,
    student_id,
    role,
    dateInscription
  }));
  return res.json({ success: true, data: accounts });
});

app.post('/api/admin/accounts', requireAdministrator, (req, res) => {
  const nom = String(req.body.nom || '').trim();
  const prenom = String(req.body.prenom || '').trim();
  const studentId = String(req.body.student_id || '').trim();
  const password = String(req.body.password || '');
  const role = String(req.body.role || 'etudiant').trim().toLowerCase();

  if (!nom || !prenom || !studentId || !password) {
    return res.status(400).json({ success: false, error: 'Tous les champs sont obligatoires.' });
  }
  if (!/^\d{7}$/.test(studentId)) {
    return res.status(400).json({ success: false, error: 'L’identifiant doit contenir 7 chiffres.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }
  if (!['etudiant', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Le rôle doit être étudiant ou administrateur.' });
  }
  if ([nom, prenom, studentId, password].some(value => /[;\r\n]/.test(value))) {
    return res.status(400).json({ success: false, error: 'Les champs ne peuvent pas contenir de point-virgule ou de retour à la ligne.' });
  }
  if (getExistingStudentIds().includes(studentId)) {
    return res.status(409).json({ success: false, error: 'Un compte existe déjà avec cet identifiant.' });
  }

  const newRow = `${nom};${prenom};${studentId};${password};${formatDate(new Date())};${role}\n`;
  fs.appendFileSync(CSV_FILE, newRow, 'utf8');
  return res.status(201).json({
    success: true,
    message: 'Compte créé avec succès.',
    data: { nom, prenom, student_id: studentId, role }
  });
});

// Route GET /api/forgot-password - Demande de récupération de mot de passe
app.post('/api/forgot-password', (req, res) => {
  const { student_id, nom, prenom } = req.body;

  if (!student_id || !nom || !prenom) {
    return res.status(400).json({
      success: false,
      error: 'Les informations sont obligatoires.'
    });
  }

  const students = readStudentsFromCSV();
  const student = students.find(s => 
    s.student_id === student_id && 
    s.nom.toUpperCase() === nom.toUpperCase() && 
    s.prenom.toUpperCase() === prenom.toUpperCase()
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Étudiant non trouvé. Vérifiez vos informations.'
    });
  }

  // En production, vous enverriez un email avec un lien de réinitialisation
  // Pour cette démo, on retourne le mot de passe (À NE PAS FAIRE EN PRODUCTION)
  console.log(`[FORGOT PASSWORD] Demande pour : ${student_id} (${student.prenom} ${student.nom})`);

  return res.status(200).json({
    success: true,
    message: 'Un lien de récupération a été envoyé à votre email (simulation). Pour cette démo, voici votre mot de passe:',
    password: student.password // À remplacer par un processus d'email en production
  });
});

// ===== SERVEUR =====

app.listen(PORT, () => {
  console.log(`Serveur EduLoan démarré sur http://localhost:${PORT}`);
});
