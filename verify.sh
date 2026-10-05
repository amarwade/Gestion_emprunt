#!/bin/bash
# Script de vérification du projet EduLoan
# Utilisation: ./verify.sh (sur Linux/Mac) ou verify.bat (sur Windows)

echo "🔍 Vérification du projet EduLoan..."
echo ""

# Vérifier Node.js
echo "✓ Vérification de Node.js..."
if command -v node &> /dev/null; then
    echo "  ✅ Node.js installé: $(node --version)"
else
    echo "  ❌ Node.js n'est pas installé!"
    exit 1
fi

# Vérifier npm
echo ""
echo "✓ Vérification de npm..."
if command -v npm &> /dev/null; then
    echo "  ✅ npm installé: $(npm --version)"
else
    echo "  ❌ npm n'est pas installé!"
    exit 1
fi

# Vérifier les fichiers critiques
echo ""
echo "✓ Vérification des fichiers..."

files=(
    "server.js"
    "package.json"
    "login.html"
    "forgot-password.html"
    "inscription.html"
    "index.html"
    "js/login.js"
    "js/forgot-password.js"
    "js/inscription.js"
    "css/login.css"
    "css/inscription.css"
    "data/etudiants.csv"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file MANQUANT!"
    fi
done

# Vérifier node_modules
echo ""
echo "✓ Vérification des dépendances..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules existe"
else
    echo "  ⚠️  node_modules n'existe pas - Exécutez 'npm install'"
fi

echo ""
echo "================================"
echo "✅ Vérification terminée!"
echo "================================"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. npm install (si dépendances manquantes)"
echo "  2. npm start"
echo "  3. Ouvrir http://localhost:3000/login.html"
