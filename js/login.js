// ===== GESTION DU FORMULAIRE DE CONNEXION (SIMULATION FRONTEND & BACKEND HYBRIDE) =====

document.addEventListener('DOMContentLoaded', () => {
  // Invalider toute ancienne authentification locale avant une nouvelle tentative.
  localStorage.removeItem('eduloan_auth');
  localStorage.removeItem('eduloan_user');

  const form = document.getElementById('login-form');
  const studentIdInput = document.getElementById('student_id');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitBtn = document.getElementById('submitBtn');
  const globalError = document.getElementById('globalError');
  const globalSuccess = document.getElementById('globalSuccess');

  // ===== AFFICHAGE/MASQUAGE DU MOT DE PASSE =====
  if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      eyeIcon.style.transform = isPassword ? 'scale(1.1)' : 'scale(0.9)';
      setTimeout(() => {
        eyeIcon.style.transform = 'scale(1)';
      }, 100);
    });
  }

  // ===== VALIDATION EN TEMPS RÉEL =====
  if (studentIdInput) {
    studentIdInput.addEventListener('blur', validateStudentId);
    studentIdInput.addEventListener('input', () => clearFieldError('student_id'));
  }

  if (passwordInput) {
    passwordInput.addEventListener('blur', validatePassword);
    passwordInput.addEventListener('input', () => clearFieldError('password'));
  }

  function validateStudentId() {
    const value = studentIdInput ? studentIdInput.value.trim() : '';
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
    const value = passwordInput ? passwordInput.value : '';
    if (!value) {
      showFieldError('password', 'Le mot de passe est obligatoire.');
      return false;
    }

    clearFieldError('password');
    return true;
  }

  function showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorDiv = document.getElementById(`error-${fieldName}`);
    if (input) input.classList.add('error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.add('show');
    }
  }

  function clearFieldError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorDiv = document.getElementById(`error-${fieldName}`);
    if (input) input.classList.remove('error');
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.classList.remove('show');
    }
  }

  function showError(message) {
    if (globalError) {
      globalError.textContent = message;
      globalError.style.display = 'block';
      globalError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function showSuccess(message) {
    if (globalSuccess) {
      globalSuccess.textContent = message;
      globalSuccess.style.display = 'block';
      globalSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function resetButton() {
    if (submitBtn) {
      submitBtn.disabled = false;
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  }

  // ===== SOUMETTRE LE FORMULAIRE =====
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (globalError) globalError.style.display = 'none';
      if (globalSuccess) globalSuccess.style.display = 'none';

      if (!validateStudentId() || !validatePassword()) {
        return;
      }

      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline-flex';

      const studentId = studentIdInput.value.trim();
      const password = passwordInput.value;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: studentId, password })
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          showError(result.error || 'La connexion a échoué.');
          resetButton();
          return;
        }

        const userData = result.data;
        localStorage.setItem('eduloan_auth', 'true');
        localStorage.setItem('eduloan_user', JSON.stringify(userData));
        showSuccess(`Bienvenue ${userData.prenom} ${userData.nom} ! Redirection...`);
        setTimeout(() => {
          window.location.href = userData.role === 'admin' ? 'admin.html' : 'espace-etudiant.html';
          const requestedDestination = new URLSearchParams(window.location.search).get('redirect');
          const destination = ['demande-pret.html', 'espace-etudiant.html'].includes(requestedDestination)
            ? requestedDestination
            : 'espace-etudiant.html';
          window.location.href = destination;
        }, 1000);
      } catch (error) {
        showError('Impossible de joindre le serveur. Vérifiez qu’il est démarré puis réessayez.');
        resetButton();
      }
    });
  }
});
