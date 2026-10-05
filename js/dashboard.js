document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("pc-grid");
  const requestsContainer = document.getElementById("requests-container");
  const activeLoansContainer = document.getElementById("active-loans-container");
  const filterBtns = document.querySelectorAll(".filter");
  const searchInput = document.querySelector(".search input");
  const modalOverlay = document.createElement("div");
  const activeStatuses = new Set(["en_attente", "en_cours"]);
  const statusLabels = {
    en_attente: "En attente",
    en_cours: "En cours",
    refusee: "Refusée",
    terminee: "Terminée"
  };
  let pcs = [];
  let studentRequests = [];
  let currentFilter = "disponible";
  let searchQuery = "";
  let studentHasActiveRequest = false;

  function showMessage(container, message) {
    if (!container) return;
    const paragraph = document.createElement("p");
    paragraph.className = "catalog-message";
    paragraph.textContent = message;
    container.replaceChildren(paragraph);
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
  function applyFilters() {
    grid?.querySelectorAll(".pc-card").forEach((card) => {
      const matchesFilter = currentFilter === "all" || card.dataset.status === currentFilter;
      const matchesSearch = !searchQuery || card.textContent.toLowerCase().includes(searchQuery);
      card.classList.toggle("is-hidden", !matchesFilter || !matchesSearch);
    });
  }

  function statusText(status) {
    return statusLabels[status] || status.replace(/_/g, " ");
  }

  function renderPcCards() {
    if (!grid) return;
    grid.replaceChildren();

    pcs.forEach((pc) => {
      const card = document.createElement("article");
      card.className = "pc-card";
      card.dataset.status = pc.status;

      const top = document.createElement("div");
      top.className = "pc-card-top";
      const icon = document.createElement("div");
      icon.className = `pc-icon ${pc.style || ""}`.trim();
      const image = document.createElement("img");
      image.src = pc.image;
      image.alt = pc.name;
      image.className = "pc-img";
      icon.append(image);

      const title = document.createElement("div");
      const id = document.createElement("div");
      id.className = "pc-id";
      id.textContent = pc.id;
      const name = document.createElement("h3");
      name.textContent = pc.name;
      title.append(id, name);
      top.append(icon, title);

      const specs = document.createElement("div");
      specs.className = "pc-specs";
      pc.specs.forEach((spec, index) => {
        const badge = document.createElement("span");
        badge.textContent = spec;
        if (index === pc.specs.length - 1) badge.className = "acc-badge";
        specs.append(badge);
      });

      const footer = document.createElement("div");
      footer.className = "pc-card-foot";
      const availability = document.createElement("span");
      const isAvailable = pc.status === "disponible";
      availability.className = `availability ${isAvailable ? "ok" : "busy"}`;
      const dot = document.createElement("span");
      dot.className = `dot ${isAvailable ? "green" : "indigo"}`;
      availability.append(dot, document.createTextNode(pc.statusLabel));
      const viewButton = document.createElement("button");
      viewButton.className = "voir-btn";
      viewButton.type = "button";
      viewButton.dataset.pc = pc.id;
      viewButton.textContent = "Voir";
      footer.append(availability, viewButton);
      card.append(top, specs, footer);
      grid.append(card);
    });

    applyFilters();
  }

  function renderRequestGroups(container, requests, emptyMessage, isLoanList) {
    if (!container) return;
    container.replaceChildren();
    if (requests.length === 0) {
      showMessage(container, emptyMessage);
      return;
    }

    requests.forEach((request) => {
      const pc = pcs.find((item) => item.id === request.pc_id);
      const group = document.createElement("div");
      group.className = "group";
      const icon = document.createElement("div");
      icon.className = "group-icon";
      if (pc) {
        const image = document.createElement("img");
        image.src = pc.image;
        image.alt = "";
        image.className = "group-img";
        icon.append(image);
      } else {
        icon.textContent = "PC";
      }

      const details = document.createElement("div");
      const title = document.createElement("b");
      title.textContent = `${request.pc_id} · ${pc?.name || "PC portable"}`;
      const status = document.createElement("span");
      status.textContent = isLoanList
        ? `${request.duree_jours} jour(s) · demande du ${request.date_demande}`
        : `${statusText(request.statut)} · ${request.duree_jours} jour(s) · ${request.date_demande}`;
      details.append(title, status);
      group.append(icon, details);
      container.append(group);
    });
  }

  function createModal() {
    modalOverlay.className = "modal-overlay";
    modalOverlay.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" type="button" aria-label="Fermer">&times;</button>
        <div class="modal-header">
          <div class="modal-icon"></div>
          <div><span class="modal-id"></span><h3 class="modal-title"></h3></div>
        </div>
        <div class="modal-body">
          <p class="modal-specs"></p>
          <div class="modal-status-badge"></div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn secondary modal-cancel" type="button">Fermer</button>
          <button class="modal-btn primary modal-confirm" type="button">Faire une demande</button>
        </div>
      </div>`;
    document.body.append(modalOverlay);

    const close = () => modalOverlay.classList.remove("is-open");
    modalOverlay.querySelector(".modal-close").addEventListener("click", close);
    modalOverlay.querySelector(".modal-cancel").addEventListener("click", close);
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) close();
    });
    modalOverlay.querySelector(".modal-confirm").addEventListener("click", () => {
      const pcId = modalOverlay.dataset.pcId;
      const pc = pcs.find((item) => item.id === pcId);
      if (pc?.status === "disponible" && !studentHasActiveRequest) {
        window.location.href = `demande-pret.html?pc=${encodeURIComponent(pc.id)}`;
      }
    });
  }

  function showPcDetails(pc) {
    modalOverlay.dataset.pcId = pc.id;
    const icon = modalOverlay.querySelector(".modal-icon");
    const image = document.createElement("img");
    image.src = pc.image;
    image.alt = pc.name;
    icon.replaceChildren(image);
    modalOverlay.querySelector(".modal-id").textContent = pc.id;
    modalOverlay.querySelector(".modal-title").textContent = pc.name;
    modalOverlay.querySelector(".modal-specs").textContent = `Spécifications : ${pc.specs.join(" · ")}`;
    const ownRequest = studentRequests.find((request) => request.pc_id === pc.id && activeStatuses.has(request.statut));
    let label = pc.statusLabel;
    if (ownRequest) label += " · Votre demande";
    if (studentHasActiveRequest && !ownRequest) label += " · Vous avez déjà une demande active";
    modalOverlay.querySelector(".modal-status-badge").textContent = `Statut : ${label}`;
    modalOverlay.querySelector(".modal-confirm").hidden = pc.status !== "disponible" || studentHasActiveRequest;
    modalOverlay.classList.add("is-open");
  }

  filterBtns.forEach((button) => {
    button.addEventListener("click", () => {
      filterBtns.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      currentFilter = button.dataset.filter;
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  grid?.addEventListener("click", (event) => {
    const button = event.target.closest(".voir-btn");
    if (!button) return;
    const pc = pcs.find((item) => item.id === button.dataset.pc);
    if (pc) showPcDetails(pc);
  });

  document.querySelectorAll(".nav-item[href^='#']").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((navItem) => navItem.classList.remove("active-parent"));
      item.classList.add("active-parent");
    });
  });

  try {
    const sessionResponse = await fetch("/api/check-session");
    const sessionResult = await sessionResponse.json();
    if (!sessionResponse.ok || !sessionResult.authenticated) {
      window.location.href = "login.html?redirect=espace-etudiant.html";
      return;
    }

    const student = sessionResult.student;
    const displayName = [student.prenom, student.nom].filter(Boolean).join(" ") || student.student_id;
    document.getElementById("welcome-user").textContent = `Bonjour, ${displayName}`;
    const avatar = document.getElementById("user-avatar");
    avatar.textContent = displayName.split(/\s+/).map((part) => part[0]).join("").toUpperCase();
    avatar.setAttribute("aria-label", `Profil de ${displayName}`);

    const [pcsResponse, requestsResponse] = await Promise.all([
      fetch("/api/pcs"),
      fetch("/api/mes-emprunts")
    ]);
    const pcsResult = await pcsResponse.json();
    const requestsResult = await requestsResponse.json();
    if (!pcsResponse.ok || !pcsResult.success) {
      throw new Error(pcsResult.error || "Impossible de charger le catalogue.");
    }
    if (!requestsResponse.ok || !requestsResult.success) {
      throw new Error(requestsResult.error || "Impossible de charger vos demandes.");
    }

    pcs = pcsResult.data;
    studentRequests = requestsResult.data.sort((a, b) => b.date_demande.localeCompare(a.date_demande));
    studentHasActiveRequest = studentRequests.some((request) => activeStatuses.has(request.statut));
    renderPcCards();
    createModal();
    renderRequestGroups(
      requestsContainer,
      studentRequests.filter((request) => request.statut !== "en_cours"),
      "Aucune demande ni aucun historique.",
      false
    );
    renderRequestGroups(
      activeLoansContainer,
      studentRequests.filter((request) => request.statut === "en_cours"),
      "Aucun emprunt en cours.",
      true
    );
  } catch (error) {
    showMessage(grid, error.message);
    showMessage(requestsContainer, error.message);
    showMessage(activeLoansContainer, error.message);
  }

  document.getElementById("logout-btn")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "La déconnexion a échoué.");
      }
      localStorage.removeItem("eduloan_auth");
      localStorage.removeItem("eduloan_user");
      window.location.href = "index.html";
    } catch (error) {
      window.alert(error.message);
      button.disabled = false;
    }
  });
});
