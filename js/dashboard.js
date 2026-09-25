document.addEventListener("DOMContentLoaded", () => {
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

  // Initial filter run on page load
  updateCardsVisibility();

  // Filter buttons click listener
  filterBtns.forEach((button) => {
    button.addEventListener("click", () => {
      filterBtns.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      currentFilter = button.dataset.filter;
      updateCardsVisibility();
    });
  });

  // Search input listener
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      updateCardsVisibility();
    });
  }

  const defaultLaptopSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20M7 16v4M17 16v4"/></svg>`;

  // Modal logic for "Voir" buttons
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

  function closeModal() {
    modalOverlay.classList.remove("is-open");
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  confirmBtn.addEventListener("click", () => {
    alert("Votre demande d'emprunt a été enregistrée avec succès !");
    closeModal();
  });

  document.querySelectorAll(".voir-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".pc-card");
      if (!card) return;

      const pcId = card.querySelector(".pc-id")?.textContent || button.dataset.pc;
      const pcTitle = card.querySelector("h3")?.textContent || "PC portable";
      const specs = Array.from(card.querySelectorAll(".pc-specs span")).map(s => s.textContent).join(" · ");
      const statusText = card.querySelector(".availability")?.textContent.trim() || "";
      const isAvailable = card.dataset.status === "disponible";
      const pcImg = card.querySelector(".pc-img")?.getAttribute("src");

      const modalIcon = modalOverlay.querySelector(".modal-icon");
      if (pcImg) {
        modalIcon.innerHTML = `<img src="${pcImg}" alt="${pcTitle}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;" />`;
      } else {
        modalIcon.innerHTML = defaultLaptopSvg;
      }

      modalOverlay.querySelector(".modal-id").textContent = pcId;
      modalOverlay.querySelector(".modal-title").textContent = pcTitle;
      modalOverlay.querySelector(".modal-specs").textContent = "Spécifications : " + specs;
      modalOverlay.querySelector(".modal-status-badge").textContent = "Statut : " + statusText;

      confirmBtn.style.display = isAvailable ? "inline-block" : "none";
      modalOverlay.classList.add("is-open");
    });
  });

  // Sidebar navigation handling
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((i) => i.classList.remove("active-parent"));
      item.classList.add("active-parent");
    });
  });
});

