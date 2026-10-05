// ===== GESTION DU FORMULAIRE DE CONNEXION (SIMULATION FRONTEND & BACKEND HYBRIDE) =====

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const studentIdInput = document.getElementById('student_id');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitBtn = document.getElementById('submitBtn');
  const globalError = document.getElementById('globalError');
  const globalSuccess = document.getElementById('globalSuccess');

  // Données mock initiales pour les tests frontend
  const MOCK_STUDENTS = [
    { student_id: '2026120', nom: 'BENDAOU', prenom: 'Assia', password: 'password' },
    { student_id: '2026125', nom: 'BENDAOU', prenom: 'Assia', password: 'password' },
    { student_id: '2026130', nom: 'DIOP', prenom: 'Moussa', password: 'password' }
  ];

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

      // Simulation Frontend / Mock
      let authSuccessful = false;
      let userData = {
        student_id: studentId,
        nom: 'Étudiant',
        prenom: 'Inscrit'
      };

      // 1. Vérifier dans le localStorage
      try {
        const localRegistered = JSON.parse(localStorage.getItem('eduloan_etudiants_inscrits') || '[]');
        const foundLocal = localRegistered.find(s => String(s.student_id).trim() === studentId);
        if (foundLocal) {
          authSuccessful = true;
          userData = {
            student_id: foundLocal.student_id,
            nom: foundLocal.nom,
            prenom: foundLocal.prenom
          };
        }
      } catch (err) {}

      // 2. Vérifier dans les mocks initiaux si non trouvé
      if (!authSuccessful) {
        const foundMock = MOCK_STUDENTS.find(s => s.student_id === studentId);
        if (foundMock) {
          authSuccessful = true;
          userData = {
            student_id: foundMock.student_id,
            nom: foundMock.nom,
            prenom: foundMock.prenom
          };
        }
      }

      // 3. Si l'identifiant est au format valide (simulation souple pour les tests d'équipe)
      if (!authSuccessful && /^\d{7}$/.test(studentId)) {
        authSuccessful = true;
        userData = {
          student_id: studentId,
          nom: 'Étudiant',
          prenom: 'EduLoan'
        };
      }

      // Traitement du résultat
      setTimeout(() => {
        if (authSuccessful) {
          // Enregistrer la session en local
          localStorage.setItem('eduloan_auth', 'true');
          localStorage.setItem('eduloan_user', JSON.stringify(userData));

          showSuccess(`Bienvenue ${userData.prenom} ${userData.nom} ! Redirection vers votre Espace Étudiant...`);
          
          setTimeout(() => {
            window.location.href = 'espace-etudiant.html';
          }, 1000);
        } else {
          showError('Identifiant ou mot de passe incorrect.');
          resetButton();
        }
      }, 500);
    });
  }
});
