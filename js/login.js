// ===== GESTION DU FORMULAIRE DE CONNEXION =====

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const studentIdInput = document.getElementById('student_id');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitBtn = document.getElementById('submitBtn');
  const globalError = document.getElementById('globalError');
  const globalSuccess = document.getElementById('globalSuccess');

  // ===== AFFICHAGE/MASQUAGE DU MOT DE PASSE =====
  togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    // Animer l'icône
    eyeIcon.style.transform = isPassword ? 'scale(1.1)' : 'scale(0.9)';
    setTimeout(() => {
      eyeIcon.style.transform = 'scale(1)';
    }, 100);
  });

  // ===== VALIDATION EN TEMPS RÉEL =====
  studentIdInput.addEventListener('blur', () => {
    validateStudentId();
  });

  passwordInput.addEventListener('blur', () => {
    validatePassword();
  });

  studentIdInput.addEventListener('input', () => {
    clearFieldError('student_id');
  });

  passwordInput.addEventListener('input', () => {
    clearFieldError('password');
  });

  // ===== VALIDATION CHAMPS =====
  function validateStudentId() {
    const value = studentIdInput.value.trim();
    const errorDiv = document.getElementById('error-student_id');

    if (!value) {
      showFieldError('student_id', 'L\'identifiant est obligatoire.');
      return false;
    }

    if (!/^\d{7}$/.test(value) && !/^\d{4}\d{3}$/.test(value)) {
      showFieldError('student_id', 'Format invalide (ex: 2026123).');
      return false;
    }

    clearFieldError('student_id');
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    const errorDiv = document.getElementById('error-password');

    if (!value) {
      showFieldError('password', 'Le mot de passe est obligatoire.');
      return false;
    }

    if (value.length < 2) {
      showFieldError('password', 'Le mot de passe doit contenir au moins 2 caractères.');
      return false;
    }

    clearFieldError('password');
    return true;
  }

  function showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorDiv = document.getElementById(`error-${fieldName}`);
    
    input.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
  }

  function clearFieldError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorDiv = document.getElementById(`error-${fieldName}`);
    
    input.classList.remove('error');
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
  }

  // ===== SOUMETTRE LE FORMULAIRE =====
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Masquer les messages précédents
    globalError.style.display = 'none';
    globalSuccess.style.display = 'none';

    // Validation
    if (!validateStudentId() || !validatePassword()) {
      return;
    }

    // Désactiver le bouton et afficher le loader
    submitBtn.disabled = true;
    document.querySelector('.btn-text').style.display = 'none';
    document.querySelector('.btn-loader').style.display = 'inline-flex';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentIdInput.value.trim(),
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Connexion réussie
        showSuccess(`Bienvenue ${data.data.prenom} ${data.data.nom} ! Redirection en cours...`);
        
        // Attendre 1.5 secondes avant de rediriger
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1500);
      } else {
        // Erreur de connexion
        showError(data.error || 'Erreur lors de la connexion.');
        
        // Réinitialiser le bouton
        resetButton();
      }
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur serveur. Veuillez réessayer.');
      resetButton();
    }
  });

  function showError(message) {
    globalError.textContent = message;
    globalError.style.display = 'block';
    globalError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showSuccess(message) {
    globalSuccess.textContent = message;
    globalSuccess.style.display = 'block';
    globalSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function resetButton() {
    submitBtn.disabled = false;
    document.querySelector('.btn-text').style.display = 'inline';
    document.querySelector('.btn-loader').style.display = 'none';
  }

  // ===== VÉRIFIER SI DÉJÀ CONNECTÉ =====
  checkExistingSession();

  async function checkExistingSession() {
    try {
      const response = await fetch('/api/check-session');
      const data = await response.json();

      if (data.authenticated) {
        // L'utilisateur est déjà connecté, rediriger au dashboard
        window.location.href = '/index.html';
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de session:', err);
    }
  }
});
