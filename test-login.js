#!/usr/bin/env node

/**
 * Script de test des routes API de connexion
 * Utilisation: node test-login.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(body)
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Tests des routes de connexion\n');
  console.log('================================\n');

  try {
    // Test 1: Tentative de connexion avec identifiants incorrects
    console.log('Test 1: Connexion avec identifiants incorrects');
    let response = await makeRequest('POST', '/api/login', {
      student_id: '9999999',
      password: 'wrongpassword'
    });
    console.log(`Status: ${response.status}`);
    console.log(`Message: ${response.body.error}\n`);

    // Test 2: Tentative de connexion sans mot de passe
    console.log('Test 2: Connexion sans mot de passe');
    response = await makeRequest('POST', '/api/login', {
      student_id: '2026120'
    });
    console.log(`Status: ${response.status}`);
    console.log(`Message: ${response.body.error}\n`);

    // Test 3: Connexion réussie
    console.log('Test 3: Connexion réussie (identifiants corrects)');
    response = await makeRequest('POST', '/api/login', {
      student_id: '2026120',
      password: 'sdfscsd'
    });
    console.log(`Status: ${response.status}`);
    console.log(`Message: ${response.body.message}`);
    console.log(`Student: ${response.body.data.prenom} ${response.body.data.nom}\n`);

    // Test 4: Vérification de session
    console.log('Test 4: Vérification de session');
    response = await makeRequest('GET', '/api/check-session');
    console.log(`Status: ${response.status}`);
    console.log(`Authenticated: ${response.body.authenticated}\n`);

    // Test 5: Récupération de mot de passe
    console.log('Test 5: Récupération de mot de passe (données valides)');
    response = await makeRequest('POST', '/api/forgot-password', {
      student_id: '2026120',
      nom: 'BENDAOU',
      prenom: 'Assia'
    });
    console.log(`Status: ${response.status}`);
    console.log(`Message: ${response.body.message}`);
    console.log(`Password: ${response.body.password}\n`);

    // Test 6: Récupération de mot de passe avec données invalides
    console.log('Test 6: Récupération de mot de passe (données invalides)');
    response = await makeRequest('POST', '/api/forgot-password', {
      student_id: '9999999',
      nom: 'FAKE',
      prenom: 'User'
    });
    console.log(`Status: ${response.status}`);
    console.log(`Message: ${response.body.error}\n`);

    console.log('✅ Tous les tests sont terminés!\n');
  } catch (err) {
    console.error('❌ Erreur lors des tests:', err);
  }
}

runTests();
