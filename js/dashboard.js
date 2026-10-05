document.addEventListener("DOMContentLoaded", () => {
  // 1. Simulation de contrôle d'accès (Authentification frontend)
  const isAuth = localStorage.getItem("eduloan_auth") === "true";
  if (!isAuth) {
    // Rediriger vers la page de connexion si non connecté
    window.location.href = "login.html?redirect=espace-etudiant.html";
    return;
  }

  // Afficher les infos de l'étudiant connecté
  const userJson = localStorage.getItem("eduloan_user");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const welcomeUser = document.getElementById("welcome-user");
      const userAvatar = document.getElementById("user-avatar");
      const firstName = user.prenom || user.firstName || "";
      const lastName = user.nom || user.lastName || "";
      const storedName = user.fullName || user.full_name || user.name || [firstName, lastName].filter(Boolean).join(" ");
      const isGenericFallback = firstName === "EduLoan" && lastName === "Étudiant";
      const displayName = isGenericFallback
        ? (user.student_id ? "Étudiant " + user.student_id : "Étudiant")
        : (storedName || user.student_id || "Étudiant");

      if (welcomeUser) {
        welcomeUser.textContent = "Bonjour, " + displayName;
      }
      if (userAvatar) {
        const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
        userAvatar.textContent = initials.toUpperCase() || "ET";
        userAvatar.setAttribute("aria-label", "Profil de " + displayName);
      }
    } catch (e) {
      console.warn("Erreur lecture session", e);
    }
  }

  // Gestion de la déconnexion
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("eduloan_auth");
      localStorage.removeItem("eduloan_user");
      window.location.href = "index.html";
    });
  }

  // 2. Gestion des filtres et recherche des PC
  const cards = document.querySelectorAll(".pc-card");
  const filterBtns = document.querySelectorAll(".filter");
  const searchInput = document.querySelector(".search input");
  let currentFilter = "disponible";
  let searchQuery = "";

  function updateCardsVisibility() {
    cards.forEach((card) => {
      const status = card.dataset.status;
      const text = card.textContent.toLowerCase();
      const matchesFilter = currentFilter === "all" || status === currentFilter;
      const matchesSearch = !searchQuery || text.includes(searchQuery);

      if (matchesFilter && matchesSearch) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  }

  updateCardsVisibility();

  filterBtns.forEach((button) => {
    button.addEventListener("click", () => {
      filterBtns.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      currentFilter = button.dataset.filter;
      updateCardsVisibility();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      updateCardsVisibility();
    });
  }

  // 3. Modale "Voir" et redirection vers Demande de prêt
  const defaultLaptopSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20M7 16v4M17 16v4"/></svg>`;

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" aria-label="Fermer">&times;</button>
      <div class="modal-header">
        <div class="modal-icon">${defaultLaptopSvg}</div>
        <div>
          <span class="modal-id"></span>
          <h3 class="modal-title"></h3>
        </div>
      </div>
      <div class="modal-body">
        <p class="modal-specs"></p>
        <div class="modal-status-badge"></div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn secondary modal-cancel">Fermer</button>
        <button class="modal-btn primary modal-confirm">Faire une demande</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  const closeBtn = modalOverlay.querySelector(".modal-close");
  const cancelBtn = modalOverlay.querySelector(".modal-cancel");
  const confirmBtn = modalOverlay.querySelector(".modal-confirm");
  let selectedPcId = "";
  let selectedPcTitle = "";

  function closeModal() {
    modalOverlay.classList.remove("is-open");
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  confirmBtn.addEventListener("click", () => {
    // Redirection directe vers la page de demande de prêt avec le PC choisi en paramètre
    window.location.href = `demande-pret.html?pc=${encodeURIComponent(selectedPcId)}&model=${encodeURIComponent(selectedPcTitle)}`;
  });

  document.querySelectorAll(".voir-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".pc-card");
      if (!card) return;

      selectedPcId = card.querySelector(".pc-id")?.textContent || button.dataset.pc;
      selectedPcTitle = card.querySelector("h3")?.textContent || "PC portable";
      const specs = Array.from(card.querySelectorAll(".pc-specs span")).map((s) => s.textContent).join(" · ");
      const statusText = card.querySelector(".availability")?.textContent.trim() || "";
      const isAvailable = card.dataset.status === "disponible";
      const pcImg = card.querySelector(".pc-img")?.getAttribute("src");

      const modalIcon = modalOverlay.querySelector(".modal-icon");
      if (pcImg) {
        modalIcon.innerHTML = `<img src="${pcImg}" alt="${selectedPcTitle}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;" />`;
      } else {
        modalIcon.innerHTML = defaultLaptopSvg;
      }

      modalOverlay.querySelector(".modal-id").textContent = selectedPcId;
      modalOverlay.querySelector(".modal-title").textContent = selectedPcTitle;
      modalOverlay.querySelector(".modal-specs").textContent = "Spécifications : " + specs;
      modalOverlay.querySelector(".modal-status-badge").textContent = "Statut : " + statusText;

      confirmBtn.style.display = isAvailable ? "inline-block" : "none";
      modalOverlay.classList.add("is-open");
    });
  });

  // 4. Affichage dynamique des demandes enregistrées en localStorage
  try {
    const storedRequests = JSON.parse(localStorage.getItem("eduloan_demandes_pret") || "[]");
    const container = document.getElementById("recent-requests-container");
    if (container && storedRequests.length > 0) {
      const latest = storedRequests[storedRequests.length - 1];
      container.innerHTML = `
        <div class="group-icon mint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div>
          <b>${latest.pcModel || latest.pcId || "PC Portable"}</b>
          <span>Demande en attente · ${latest.dureeLabel || latest.duree}</span>
        </div>
      `;
    }
  } catch (e) {}

  // 5. Sidebar Navigation Links
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.getAttribute("href") && item.getAttribute("href").startsWith("#")) {
        navItems.forEach((i) => i.classList.remove("active-parent"));
        item.classList.add("active-parent");
      }
    });
  });
});
