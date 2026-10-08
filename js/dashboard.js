document.addEventListener("DOMContentLoaded", async () => {
  const requestsContainer = document.getElementById("recent-requests-container");
  const activeLoansContainer = document.getElementById("active-loans-container");
  const pcGrid = document.querySelector(".pc-grid");
  let sessionResult;

  try {
    const response = await fetch("/api/check-session");
    sessionResult = await response.json();
    if (!response.ok || !sessionResult.authenticated) {
      window.location.href = "login.html?redirect=espace-etudiant.html";
      return;
    }
  } catch (error) {
    [requestsContainer, activeLoansContainer].forEach((container) => {
      if (container) container.textContent = "Impossible de vérifier la session.";
    });
    return;
  }

  const student = sessionResult.student;
  if (!student) {
    window.location.href = "login.html?redirect=espace-etudiant.html";
    return;
  }
  const displayName = [student.prenom, student.nom].filter(Boolean).join(" ") || student.student_id;
  const welcomeUser = document.getElementById("welcome-user");
  const userAvatar = document.getElementById("user-avatar");
  if (welcomeUser) welcomeUser.textContent = "Bonjour, " + displayName;
  if (userAvatar) {
    userAvatar.textContent = displayName.split(/\s+/).map((part) => part[0]).join("").toUpperCase();
    userAvatar.setAttribute("aria-label", "Profil de " + displayName);
  }

  // Gestion de la déconnexion
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
      } catch (e) {}
      localStorage.removeItem("eduloan_auth");
      localStorage.removeItem("eduloan_user");
      window.location.href = "login.html";
    });
  }

  // 2. Gestion des filtres et recherche des PC
  const cards = document.querySelectorAll(".pc-card");
  const filterBtns = document.querySelectorAll(".filter");
  const sectionNavItems = document.querySelectorAll('.nav-item[href^="#"]');
  const searchInput = document.querySelector(".search input");
  let currentFilter = "disponible";
  let searchQuery = "";

  function syncSectionNavigation() {
    const activeHash = window.location.hash || "#pcs";
    sectionNavItems.forEach((item) => {
      item.classList.toggle("active-parent", item.getAttribute("href") === activeHash);
    });
  }

  function selectFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === filter);
    });
    updateCardsVisibility();
  }

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

  syncSectionNavigation();
  updateCardsVisibility();

  filterBtns.forEach((button) => {
    button.addEventListener("click", () => {
      selectFilter(button.dataset.filter);
      if (window.location.hash !== "#pcs") window.location.hash = "#pcs";
      syncSectionNavigation();
    });
  });

  sectionNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.dataset.nav === "pcs") selectFilter("disponible");
    });
  });
  window.addEventListener("hashchange", syncSectionNavigation);

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

  // 4. Charger la disponibilité réelle et les demandes du compte connecté.
  function renderLoans(container, loans, emptyText, includeStatus) {
    if (!container) return;
    container.replaceChildren();
    if (!loans.length) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "catalog-message";
      emptyMessage.textContent = emptyText;
      container.append(emptyMessage);
      return;
    }

    loans.forEach((loan) => {
      const card = document.querySelector(`.pc-card[data-pc="${loan.pc_id}"]`);
      const group = document.createElement("div");
      group.className = "group";
      const icon = document.createElement("div");
      icon.className = "group-icon";
      const image = card?.querySelector(".pc-img");
      if (image) {
        const thumbnail = document.createElement("img");
        thumbnail.src = image.getAttribute("src");
        thumbnail.alt = "";
        thumbnail.className = "group-img";
        icon.append(thumbnail);
      }

      const details = document.createElement("div");
      const title = document.createElement("b");
      title.textContent = `${loan.pc_id} · ${card?.querySelector("h3")?.textContent || "PC portable"}`;
      const statusLabels = {
        en_attente: "En attente",
        en_cours: "En cours",
        refusee: "Refusée",
        terminee: "Terminée"
      };
      const status = statusLabels[loan.statut] || loan.statut;
      const date = new Date(loan.date_demande);
      const formattedDate = Number.isNaN(date.getTime())
        ? loan.date_demande
        : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
      const summary = document.createElement("span");
      summary.textContent = `${includeStatus ? `${status} · ` : ""}${loan.duree_jours} jour(s) · ${formattedDate}`;
      details.append(title, summary);
      if (loan.motif) {
        const reason = document.createElement("span");
        reason.textContent = `Motif : ${loan.motif}`;
        details.append(reason);
      }
      group.append(icon, details);
      container.append(group);
    });
  }

  async function loadDashboardData() {
    const [pcsResponse, loansResponse] = await Promise.all([
      fetch("/api/pcs"),
      fetch("/api/mes-emprunts")
    ]);
    const [pcsResult, loansResult] = await Promise.all([
      pcsResponse.json(),
      loansResponse.json()
    ]);
    if (!pcsResponse.ok || !pcsResult.success) {
      throw new Error(pcsResult.error || "Impossible de charger le catalogue.");
    }
    if (!loansResponse.ok || !loansResult.success) {
      throw new Error(loansResult.error || "Impossible de charger vos demandes.");
    }

    pcsResult.data.forEach((pc) => {
      const card = document.querySelector(`.pc-card[data-pc="${pc.id}"]`);
      if (!card) return;
      card.dataset.status = pc.status;
      card.dataset.pcId = pc.id;
      const availability = card.querySelector(".availability");
      const dot = availability?.querySelector(".dot");
      const isAvailable = pc.status === "disponible";
      const filterStatus = pc.status === "en_cours" ? "emprunte" : pc.status;
      const label = filterStatus === "en_attente" ? "Demande en attente"
        : filterStatus === "emprunte" ? "Emprunté" : "Disponible";
      if (availability) {
        availability.className = `availability ${isAvailable ? "ok" : "busy"}`;
        availability.replaceChildren();
        if (dot) {
          dot.className = `dot ${isAvailable ? "green" : "indigo"}`;
          availability.append(dot);
        }
        availability.append(document.createTextNode(label));
      }
      card.dataset.status = filterStatus;
    });
    updateCardsVisibility();

    const loans = loansResult.data;
    renderLoans(
      requestsContainer,
      loans.filter((loan) => loan.statut !== "en_cours"),
      "Aucune demande ni aucun historique.",
      true
    );
    renderLoans(
      activeLoansContainer,
      loans.filter((loan) => loan.statut === "en_cours"),
      "Aucun emprunt en cours.",
      false
    );
  }

  loadDashboardData().catch((error) => {
    [requestsContainer, activeLoansContainer].forEach((container) => {
      if (container) container.textContent = error.message;
    });
    if (pcGrid) {
      const message = document.createElement("p");
      message.className = "catalog-message";
      message.textContent = error.message;
      pcGrid.prepend(message);
      pcGrid.querySelectorAll(".pc-card").forEach((card) => {
        card.dataset.status = "indisponible";
        const availability = card.querySelector(".availability");
        if (availability) availability.textContent = "Disponibilité inconnue";
        const button = card.querySelector(".voir-btn");
        if (button) button.disabled = true;
      });
      updateCardsVisibility();
    }
  });

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
