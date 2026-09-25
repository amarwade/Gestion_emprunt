const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'data', 'etudiants.csv');

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

// Lire les identifiants existants depuis data/etudiants.csv
function getExistingStudentIds() {
  if (!fs.existsSync(CSV_FILE)) return [];
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = content.split(/\r?\n/);
  const existingIds = [];
  
  // Ignorer l'en-tête (ligne 0)
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

// Serveur HTTP Node.js
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API POST /api/inscription : Inscription et ajout dans CSV
  if (req.method === 'POST' && req.url === '/api/inscription') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { nom, prenom, student_id, password } = data;

        if (!nom || !prenom || !student_id || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Tous les champs sont obligatoires.' }));
          return;
        }

        const existingIds = getExistingStudentIds();

        // Vérification de l'unicité de l'identifiant
        if (existingIds.includes(student_id)) {
          res.writeHead(409, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Un compte existe déjà avec cet identifiant.' }));
          return;
        }

        // Formater la nouvelle ligne CSV : Nom;Prénom;Identifiant;MotDePasse;DateInscription
        const dateStr = formatDate(new Date());
        const newRow = `${nom};${prenom};${student_id};${password};${dateStr}\n`;

        // Écrire la nouvelle ligne dans data/etudiants.csv
        fs.appendFileSync(CSV_FILE, newRow, 'utf8');

        console.log(`[CSV OK] Nouvel étudiant inscrit : ${student_id} (${prenom} ${nom})`);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          message: 'Inscription réussie !',
          data: { nom, prenom, student_id }
        }));
      } catch (err) {
        console.error('Erreur serveur:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de l\'enregistrement dans le fichier CSV.' }));
      }
    });
    return;
  }

  // Résolution du chemin de fichier statique
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = path.join(__dirname, decodeURIComponent(urlPath));

  // Si le fichier n'a pas d'extension et n'existe pas, essayer avec .html
  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  // Si l'utilisateur demande /login.html qui n'existe pas encore (géré par un autre dév)
  if (urlPath === '/login.html' || urlPath === '/login') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>EduLoan — Connexion (En développement)</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>
          body { font-family: 'Inter', sans-serif; background: #f4f6fc; display: grid; place-items: center; min-height: 100vh; margin: 0; color: #475569; }
          .card { background: white; padding: 32px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center; max-width: 400px; }
          h1 { font-size: 20px; margin-bottom: 10px; color: #6366f1; }
          p { font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 20px; }
          a { display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Page de Connexion</h1>
          <p>La page de connexion (login.html) est en cours de développement par un autre membre de l'équipe.</p>
          <a href="/inscription.html">Retour à l'inscription</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.csv': 'text/csv; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <title>404 Non Trouvé — EduLoan</title>
            <style>
              body { font-family: sans-serif; background: #f4f6fc; display: grid; place-items: center; min-height: 100vh; margin: 0; color: #475569; }
              .card { background: white; padding: 32px; border-radius: 20px; text-align: center; }
              a { color: #6366f1; font-weight: bold; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>404 — Page non trouvée</h2>
              <p>Fichier demandé : <code>${req.url}</code></p>
              <p><a href="/inscription.html">Aller sur la page d'inscription (/inscription.html)</a></p>
            </div>
          </body>
          </html>
        `);
      } else {
        res.writeHead(500);
        res.end(`Erreur serveur: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Serveur EduLoan démarré sur http://localhost:${PORT}`);
});
