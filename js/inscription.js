/**
 * EduLoan — Module d'inscription Étudiant (Frontend Only)
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

  // ==========================================
  // MOCK DATA & BACKEND API INTERFACE
  // ==========================================
  /**
   * Mock des identifiants d'étudiants déjà inscrits dans le système.
   */
  const MOCK_EXISTING_STUDENT_IDS = ["2026001", "2026123", "2026999"];

  /**
   * Service asynchrone d'inscription (Mock).
   * NOTE POUR LE DÉVELOPPEUR BACKEND :
   * Remplacer le corps de cette fonction par un véritable appel API (ex: fetch('/api/inscription', ...))
   *
   * @param {Object} studentData - { nom, prenom, student_id, password }
   * @returns {Promise<Object>} Résolution si succès, rejet si échec ou identifiant déjà existant.
   */
  async function registerStudentApi(studentData) {
    // Simulation du délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulation de la contrainte d'unicité de l'identifiant (gérée par le backend)
    if (MOCK_EXISTING_STUDENT_IDS.includes(studentData.student_id)) {
      const error = new Error("Un compte existe déjà avec cet identifiant.");
      error.code = "DUPLICATE_STUDENT_ID";
      throw error;
    }

    return {
      success: true,
      message: "Compte créé avec succès !",
      data: {
        nom: studentData.nom,
        prenom: studentData.prenom,
        student_id: studentData.student_id
      }
    };
  }

  // ==========================================
  // TOGLE MOT DE PASSE (AFFICHER / MASQUER)
  // ==========================================
  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    // Mise à jour de l'icône
    if (isPassword) {
      // Icône Oeil barré
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      `;
    } else {
      // Icône Oeil standard
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

  // Nettoyage à la saisie
  [nomInput, prenomInput, studentIdInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => {
      const errorId = `error-${input.id}`;
      clearFieldError(input, errorId);
      globalErrorAlert.style.display = "none";
    });
  });

  // ==========================================
  // GESTION DE LA SOUMISSION DU FORMULAIRE
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

    // 2. Soumission simulée à l'API (Mock Backend)
    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = "Inscription en cours...";

    try {
      const response = await registerStudentApi({
        nom,
        prenom,
        student_id: studentId,
        password
      });

      // Succès d'inscription
      globalSuccessAlert.textContent = `${response.message} Redirection vers la page de connexion...`;
      globalSuccessAlert.style.display = "block";

      // Redirection après 2 secondes vers la page de connexion existante/prévue
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "Créer mon compte";

      if (error.code === "DUPLICATE_STUDENT_ID") {
        // Exigence exacte : « Un compte existe déjà avec cet identifiant. »
        showFieldError(studentIdInput, "error-student_id", error.message);
        globalErrorAlert.textContent = error.message;
        globalErrorAlert.style.display = "block";
      } else {
        globalErrorAlert.textContent = error.message || "Une erreur est survenue lors de l'inscription.";
        globalErrorAlert.style.display = "block";
      }
    }
  });
});
