/**
 * EduLoan — Module d'inscription Étudiant (Persistance dans data/etudiants.csv)
 */

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const nomInput = document.getElementById("nom");
  const prenomInput = document.getElementById("prenom");
  const studentIdInput = document.getElementById("student_id");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const eyeIcon = document.getElementById("eye-icon");

  const globalErrorAlert = document.getElementById("global-error");
  const globalSuccessAlert = document.getElementById("global-success");
  const submitBtn = document.getElementById("submit-btn");

  const CURRENT_YEAR = new Date().getFullYear(); // 2026

  /**
   * Identifiants extraits dynamiquement depuis data/etudiants.csv
   */
  let existingStudentIdsFromCsv = [];

  /**
   * Charge et lit data/etudiants.csv pour obtenir la liste à jour des identifiants inscrits.
   */
  async function loadExistingStudentIdsFromCsv() {
    try {
      const response = await fetch("data/etudiants.csv?t=" + Date.now());
      if (!response.ok) return;
      const text = await response.text();
      const lines = text.split(/\r?\n/);
      
      existingStudentIdsFromCsv = [];
      // Ignorer l'en-tête (ligne 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(";");
        if (parts.length >= 3) {
          existingStudentIdsFromCsv.push(parts[2].trim());
        }
      }
      console.log("Identifiants CSV chargés:", existingStudentIdsFromCsv);
    } catch (err) {
      console.warn("Impossible de charger data/etudiants.csv en lecture directe:", err);
    }
  }

  // Charger la liste des identifiants depuis le CSV au démarrage
  loadExistingStudentIdsFromCsv();

  // ==========================================
  // TOGGLE MOT DE PASSE (AFFICHER / MASQUER)
  // ==========================================
  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    if (isPassword) {
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      `;
    } else {
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      `;
    }
  });

  // ==========================================
  // FONCTIONS UTILITAIRES DE VALIDATION
  // ==========================================
  function showFieldError(inputElement, errorElementId, message) {
    inputElement.classList.add("has-error");
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("active");
    }
  }

  function clearFieldError(inputElement, errorElementId) {
    inputElement.classList.remove("has-error");
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("active");
    }
  }

  function clearAllErrors() {
    [nomInput, prenomInput, studentIdInput, passwordInput].forEach((input) => {
      input.classList.remove("has-error");
    });
    document.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
      el.classList.remove("active");
    });
    globalErrorAlert.style.display = "none";
    globalErrorAlert.textContent = "";
    globalSuccessAlert.style.display = "none";
    globalSuccessAlert.textContent = "";
  }

  /**
   * Valide le format de l'identifiant étudiant.
   * Format attendu : Année en cours (ex: 2026) + 3 chiffres (ex: 2026123)
   */
  function isValidStudentIdFormat(id) {
    const pattern = new RegExp(`^${CURRENT_YEAR}\\d{3}$`);
    return pattern.test(id.trim());
  }

  // Nettoyage des erreurs lors de la saisie
  [nomInput, prenomInput, studentIdInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => {
      const errorId = `error-${input.id}`;
      clearFieldError(input, errorId);
      globalErrorAlert.style.display = "none";
    });
  });

  // ==========================================
  // SOUMISSION DU FORMULAIRE ET AJOUT DANS CSV
  // ==========================================
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const nom = nomInput.value.trim();
    const prenom = prenomInput.value.trim();
    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value;

    let hasErrors = false;

    // 1. Validation des champs obligatoires
    if (!nom) {
      showFieldError(nomInput, "error-nom", "Le nom est obligatoire.");
      hasErrors = true;
    }

    if (!prenom) {
      showFieldError(prenomInput, "error-prenom", "Le prénom est obligatoire.");
      hasErrors = true;
    }

    if (!studentId) {
      showFieldError(studentIdInput, "error-student_id", "L'identifiant étudiant est obligatoire.");
      hasErrors = true;
    } else if (!isValidStudentIdFormat(studentId)) {
      showFieldError(
        studentIdInput,
        "error-student_id",
        `L'identifiant doit comporter l'année courante (${CURRENT_YEAR}) suivie de 3 chiffres (ex: ${CURRENT_YEAR}123).`
      );
      hasErrors = true;
    }

    if (!password) {
      showFieldError(passwordInput, "error-password", "Le mot de passe est obligatoire.");
      hasErrors = true;
    }

    if (hasErrors) return;

    // 2. Vérification préventive côté client dans la liste CSV chargée
    if (existingStudentIdsFromCsv.includes(studentId)) {
      showFieldError(studentIdInput, "error-student_id", "Un compte existe déjà avec cet identifiant.");
      globalErrorAlert.textContent = "Un compte existe déjà avec cet identifiant.";
      globalErrorAlert.style.display = "block";
      return;
    }

    // 3. Soumission vers l'API /api/inscription (Persistance CSV)
    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = "Inscription en cours...";

    try {
      const response = await fetch("/api/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nom,
          prenom,
          student_id: studentId,
          password
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Une erreur est survenue lors de l'inscription.");
      }

      // Inscription réussie
      globalSuccessAlert.textContent = "Compte créé avec succès ! Redirection vers la page de connexion...";
      globalSuccessAlert.style.display = "block";

      // Mettre à jour la liste locale
      existingStudentIdsFromCsv.push(studentId);

      // Redirection après 2 secondes vers la page de connexion existante/prévue
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "Créer mon compte";

      showFieldError(studentIdInput, "error-student_id", error.message);
      globalErrorAlert.textContent = error.message;
      globalErrorAlert.style.display = "block";
    }
  });
});
