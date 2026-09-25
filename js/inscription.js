/**
 * EduLoan — Module d'inscription Étudiant
 * Supporte :
 * 1. L'enregistrement direct dans data/etudiants.csv (si le serveur Node.js server.js est lancé)
 * 2. Le mode de secours Frontend / LocalStorage (si aucun serveur API n'est actif)
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
  const STORAGE_KEY = "eduloan_etudiants_inscrits";

  /**
   * Données mock initiales basées sur data/etudiants.csv
   */
  const INITIAL_STUDENT_IDS = ["2026120", "2026125"];
  let existingStudentIdsFromCsv = [];

  /**
   * Charge et lit data/etudiants.csv en lecture pour vérifier les doublons
   */
  async function loadExistingStudentIdsFromCsv() {
    try {
      const response = await fetch("data/etudiants.csv?t=" + Date.now());
      if (!response.ok) return;
      const text = await response.text();
      
      // Si la réponse commence par "<", c'est une page HTML de fallback, on l'ignore
      if (text.trim().startsWith("<")) return;

      const lines = text.split(/\r?\n/);
      existingStudentIdsFromCsv = [];
      // Ignorer l'en-tête (ligne 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(";");
        if (parts.length >= 3) {
          const id = parts[2].trim();
          if (id && !existingStudentIdsFromCsv.includes(id)) {
            existingStudentIdsFromCsv.push(id);
          }
        }
      }
    } catch (err) {
      // Ignorer silencieusement si inaccessible en environnement direct
    }
  }

  // Chargement préventif au démarrage
  loadExistingStudentIdsFromCsv();

  /**
   * Récupère les étudiants enregistrés dans le localStorage
   */
  function getStoredStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Sauvegarde un nouvel étudiant dans le localStorage
   */
  function saveStudentToStorage(student) {
    try {
      const current = getStoredStudents();
      current.push(student);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn("Impossible de sauvegarder dans le localStorage :", e);
    }
  }

  /**
   * Retourne l'ensemble de tous les identifiants connus
   */
  function getAllRegisteredStudentIds() {
    const storedIds = getStoredStudents().map((s) => String(s.student_id).trim());
    return Array.from(new Set([...INITIAL_STUDENT_IDS, ...existingStudentIdsFromCsv, ...storedIds]));
  }

  // ==========================================
  // TOGGLE MOT DE PASSE (AFFICHER / MASQUER)
  // ==========================================
  if (togglePasswordBtn && passwordInput && eyeIcon) {
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
  }

  // ==========================================
  // FONCTIONS UTILITAIRES DE VALIDATION
  // ==========================================
  function showFieldError(inputElement, errorElementId, message) {
    if (inputElement) {
      inputElement.classList.add("has-error");
    }
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("active");
    }
  }

  function clearFieldError(inputElement, errorElementId) {
    if (inputElement) {
      inputElement.classList.remove("has-error");
    }
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("active");
    }
  }

  function clearAllErrors() {
    [nomInput, prenomInput, studentIdInput, passwordInput].forEach((input) => {
      if (input) input.classList.remove("has-error");
    });
    document.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
      el.classList.remove("active");
    });
    if (globalErrorAlert) {
      globalErrorAlert.style.display = "none";
      globalErrorAlert.textContent = "";
    }
    if (globalSuccessAlert) {
      globalSuccessAlert.style.display = "none";
      globalSuccessAlert.textContent = "";
    }
  }

  /**
   * Valide le format de l'identifiant étudiant.
   * Format attendu : Année en cours (ex: 2026) + 3 chiffres (ex: 2026123)
   */
  function isValidStudentIdFormat(id) {
    const pattern = new RegExp(`^${CURRENT_YEAR}\\d{3}$`);
    return pattern.test(id.trim());
  }

  // Nettoyage dynamique des erreurs lors de la saisie
  [nomInput, prenomInput, studentIdInput, passwordInput].forEach((input) => {
    if (input) {
      input.addEventListener("input", () => {
        clearFieldError(input, `error-${input.id}`);
        if (globalErrorAlert) {
          globalErrorAlert.style.display = "none";
        }
      });
    }
  });

  // ==========================================
  // SOUMISSION DU FORMULAIRE
  // ==========================================
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAllErrors();

      const nom = nomInput ? nomInput.value.trim() : "";
      const prenom = prenomInput ? prenomInput.value.trim() : "";
      const studentId = studentIdInput ? studentIdInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

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

      // 2. Vérification de l'unicité locale avant envoi
      const allIds = getAllRegisteredStudentIds();
      if (allIds.includes(studentId)) {
        showFieldError(studentIdInput, "error-student_id", "Un compte existe déjà avec cet identifiant.");
        if (globalErrorAlert) {
          globalErrorAlert.textContent = "Un compte existe déjà avec cet identifiant.";
          globalErrorAlert.style.display = "block";
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.querySelector("span").textContent = "Inscription en cours...";

      const newStudent = {
        nom,
        prenom,
        student_id: studentId,
        password,
        dateInscription: new Date().toISOString().replace("T", " ").substring(0, 19)
      };

      let savedInCsv = false;

      // 3. Tentative d'enregistrement dans le fichier CSV via server.js
      try {
        const apiUrl = window.location.origin.includes(":3000")
          ? "/api/inscription"
          : "http://localhost:3000/api/inscription";

        const response = await fetch(apiUrl, {
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

        const contentType = response.headers.get("content-type") || "";
        
        // Si le serveur Node.js a répondu en JSON
        if (contentType.includes("application/json")) {
          const resData = await response.json();
          if (!response.ok || !resData.success) {
            throw new Error(resData.error || "Erreur lors de l'enregistrement.");
          }
          savedInCsv = true;
          existingStudentIdsFromCsv.push(studentId);
        } else {
          // Serveur statique sans API : enregistrement localStorage
          saveStudentToStorage(newStudent);
        }
      } catch (err) {
        // En cas d'erreur de connexion au serveur : enregistrement localStorage sans plantage JSON
        if (err.message && !err.message.includes("Unexpected token")) {
          if (err.message.includes("déjà")) {
            submitBtn.disabled = false;
            submitBtn.querySelector("span").textContent = "Créer mon compte";
            showFieldError(studentIdInput, "error-student_id", err.message);
            if (globalErrorAlert) {
              globalErrorAlert.textContent = err.message;
              globalErrorAlert.style.display = "block";
            }
            return;
          }
        }
        saveStudentToStorage(newStudent);
      }

      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "Créer mon compte";

      // 4. Message de confirmation
      if (globalSuccessAlert) {
        if (savedInCsv) {
          globalSuccessAlert.textContent = "Compte créé et enregistré avec succès dans data/etudiants.csv !";
        } else {
          globalSuccessAlert.textContent = "Compte créé avec succès (enregistré en local) !";
        }
        globalSuccessAlert.style.display = "block";
      }

      // Réinitialisation du formulaire
      registerForm.reset();
    });
  }
});
