// ===== GESTION DE LA RÉCUPÉRATION DE MOT DE PASSE =====

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgot-password-form');
  const studentIdInput = document.getElementById('student_id');
  const nomInput = document.getElementById('nom');
  const prenomInput = document.getElementById('prenom');
  const submitBtn = document.getElementById('submitBtn');
  const globalError = document.getElementById('globalError');
  const globalSuccess = document.getElementById('globalSuccess');

  // ===== VALIDATION EN TEMPS RÉEL =====
  const inputs = [studentIdInput, nomInput, prenomInput];
  
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateInput(input.id);
    });

    input.addEventListener('input', () => {
      clearFieldError(input.id);
    });
  });

  // ===== VALIDATION CHAMPS =====
  function validateInput(fieldName) {
    const input = document.getElementById(fieldName);
    const value = input.value.trim();

    if (!value) {
      showFieldError(fieldName, 'Ce champ est obligatoire.');
      return false;
    }

    if (fieldName === 'student_id') {
      if (!/^\d{7}$/.test(value) && !/^\d{4}\d{3}$/.test(value)) {
        showFieldError(fieldName, 'Format invalide (ex: 2026123).');
        return false;
      }
    } else if (fieldName === 'nom' || fieldName === 'prenom') {
      if (value.length < 2) {
        showFieldError(fieldName, 'Minimum 2 caractères requis.');
        return false;
      }
    }

    clearFieldError(fieldName);
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
    if (!validateInput('student_id') || !validateInput('nom') || !validateInput('prenom')) {
      return;
    }

    // Désactiver le bouton et afficher le loader
    submitBtn.disabled = true;
    document.querySelector('.btn-text').style.display = 'none';
    document.querySelector('.btn-loader').style.display = 'inline-flex';

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentIdInput.value.trim(),
          nom: nomInput.value.trim(),
          prenom: prenomInput.value.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Succès
        let successMessage = data.message;
        if (data.password) {
          successMessage += `\n\nVotre mot de passe: ${data.password}`;
        }
        
        globalSuccess.innerHTML = `
          <strong>Succès !</strong><br>
          ${data.message}<br><br>
          <code style="background: rgba(0,0,0,0.1); padding: 8px 12px; border-radius: 6px; display: inline-block;">
            ${data.password}
          </code>
        `;
        globalSuccess.style.display = 'block';

        // Remplir les champs
        form.reset();
        
        // Rediriger après 3 secondes
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 3000);
      } else {
        // Erreur
        showError(data.error || 'Erreur lors de la récupération du mot de passe.');
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

  function resetButton() {
    submitBtn.disabled = false;
    document.querySelector('.btn-text').style.display = 'inline';
    document.querySelector('.btn-loader').style.display = 'none';
  }
});
