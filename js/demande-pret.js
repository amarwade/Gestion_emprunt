document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loan-form");
  const pcOptions = document.getElementById("pc-options");
  const pcPicker = document.getElementById("pc-picker");
  const pcPickerTrigger = document.getElementById("pc-picker-trigger");
  const pcPickerValue = document.getElementById("pc-picker-value");
  const pcIdInput = document.getElementById("pc-id");
  const motifInput = document.getElementById("motif");
  const dureeInput = document.getElementById("duree");
  const justificatifInput = document.getElementById("justificatif");
  const fileUploadName = document.getElementById("file-upload-name");
  const globalError = document.getElementById("global-error");
  const globalInfo = document.getElementById("global-info");
  let pcs = [];
  let studentHasActiveRequest = false;

  function clearFieldError(id) {
    const error = document.getElementById(id);
    if (error) {
      error.textContent = "";
      error.classList.remove("active");
    }
    if (id === "error-motif" && motifInput) motifInput.classList.remove("has-error");
    if (id === "error-duree" && dureeInput) dureeInput.classList.remove("has-error");
    if (id === "error-pc" && pcPickerTrigger) pcPickerTrigger.removeAttribute("aria-invalid");
  }

  function showFieldError(id, message, input) {
    const error = document.getElementById(id);
    if (error) {
      error.textContent = message;
      error.classList.add("active");
    }
    if (input) input.classList.add("has-error");
  }

  function clearMessages() {
    [globalError, globalInfo].forEach((alert) => {
      if (alert) {
        alert.hidden = true;
        alert.textContent = "";
      }
    });
  }

  function closePcOptions(returnFocus = false) {
    if (!pcOptions || !pcPickerTrigger) return;
    pcOptions.hidden = true;
    pcPickerTrigger.setAttribute("aria-expanded", "false");
    if (returnFocus) pcPickerTrigger.focus();
  }

  function selectPc(pc) {
    if (!pcOptions || !pcPickerValue || !pcIdInput) return;
    if (pc.status !== "disponible" || studentHasActiveRequest) return;
    pcIdInput.value = pc.id;
    pcPickerValue.replaceChildren();

    const selectedDetails = document.createElement("span");
    selectedDetails.className = "pc-selected-details";
    const name = document.createElement("strong");
    name.textContent = pc.name;
    const meta = document.createElement("span");
    meta.textContent = `${pc.id} · ${pc.specs.join(" · ")}`;
    selectedDetails.append(name, meta);
    pcPickerValue.append(selectedDetails);
    pcPickerTrigger.classList.add("has-selection");

    pcOptions.querySelectorAll(".pc-option").forEach((option) => {
      const selected = option.dataset.pcId === pc.id;
      option.setAttribute("aria-selected", String(selected));
      option.classList.toggle("is-selected", selected);
    });
    closePcOptions();
    clearFieldError("error-pc");
  }

  function renderPcOptions(requestedPc = "") {
    if (!pcOptions || !pcPickerTrigger) return;
    pcOptions.replaceChildren();
    pcs.forEach((pc) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "pc-option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.dataset.pcId = pc.id;
      option.disabled = pc.status !== "disponible" || studentHasActiveRequest;

      const image = document.createElement("img");
      image.className = "pc-option-image";
      image.src = pc.image;
      image.alt = "";
      image.loading = "lazy";

      const details = document.createElement("span");
      details.className = "pc-option-details";
      const name = document.createElement("strong");
      name.className = "pc-option-name";
      name.textContent = pc.name;
      const id = document.createElement("span");
      id.className = "pc-option-id";
      id.textContent = pc.id;
      const specs = document.createElement("span");
      specs.className = "pc-option-specs";
      specs.textContent = `${pc.specs.join(" · ")} · ${pc.statusLabel}`;
      const indicator = document.createElement("span");
      indicator.className = "pc-option-indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.textContent = "✓";

      details.append(name, id, specs);
      option.append(image, details, indicator);
      option.addEventListener("click", () => selectPc(pc));
      pcOptions.append(option);
    });

    const preselectedPc = pcs.find((pc) => pc.id === requestedPc);
    if (preselectedPc?.status === "disponible" && !studentHasActiveRequest) {
      selectPc(preselectedPc);
    } else if (requestedPc && preselectedPc && globalInfo) {
      globalInfo.textContent = studentHasActiveRequest
        ? "Vous avez déjà une demande en attente ou un emprunt en cours."
        : "Le PC choisi n’est plus disponible. Sélectionnez un autre appareil.";
      globalInfo.hidden = false;
    }
    pcPickerTrigger.disabled = pcs.every((pc) => pc.status !== "disponible") || studentHasActiveRequest;
  }

  async function loadPcOptions(showActiveRequestNotice = true) {
    const requestedPc = new URLSearchParams(window.location.search).get("pc") || "";
    pcPickerTrigger.disabled = true;
    try {
      const [pcsResponse, requestsResponse] = await Promise.all([
        fetch("/api/pcs"),
        fetch("/api/mes-emprunts")
      ]);
      const pcsResult = await pcsResponse.json();
      const requestsResult = await requestsResponse.json();
      if (requestsResponse.status === 401) {
        window.location.href = "login.html?redirect=demande-pret.html";
        return;
      }
      if (!pcsResponse.ok || !pcsResult.success) {
        throw new Error(pcsResult.error || "Impossible de charger le catalogue.");
      }
      if (!requestsResponse.ok || !requestsResult.success) {
        throw new Error(requestsResult.error || "Impossible de vérifier vos demandes.");
      }
      pcs = pcsResult.data;
      studentHasActiveRequest = requestsResult.data.some((request) =>
        request.statut === "en_attente" || request.statut === "en_cours"
      );
      renderPcOptions(requestedPc);
      if (showActiveRequestNotice && studentHasActiveRequest && globalInfo) {
        globalInfo.textContent = "Vous avez déjà une demande en attente ou un emprunt en cours. Vous pourrez déposer une nouvelle demande après sa clôture.";
        globalInfo.hidden = false;
      }
    } catch (error) {
      if (globalError) {
        globalError.textContent = error.message;
        globalError.hidden = false;
      }
      pcPickerTrigger.disabled = true;
    }
  }

  loadPcOptions();

  pcPickerTrigger?.addEventListener("click", () => {
    const opening = pcOptions.hidden;
    pcOptions.hidden = !opening;
    pcPickerTrigger.setAttribute("aria-expanded", String(opening));
    if (opening) pcOptions.querySelector(".pc-option")?.focus();
  });

  pcOptions?.addEventListener("keydown", (event) => {
    const options = Array.from(pcOptions.querySelectorAll(".pc-option"));
    const currentIndex = options.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = Math.min(currentIndex + 1, options.length - 1);
    else if (event.key === "ArrowUp") nextIndex = Math.max(currentIndex - 1, 0);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      closePcOptions(true);
      return;
    } else return;
    event.preventDefault();
    options[nextIndex]?.focus();
  });

  document.addEventListener("pointerdown", (event) => {
    if (pcPicker && !pcPicker.contains(event.target) && pcOptions && !pcOptions.hidden) closePcOptions();
  });

  if (justificatifInput && fileUploadName) {
    justificatifInput.addEventListener("change", () => {
      const file = justificatifInput.files && justificatifInput.files[0];
      fileUploadName.textContent = file ? "Fichier sélectionné : " + file.name : "";
      fileUploadName.hidden = !file;
    });
  }

  motifInput?.addEventListener("input", () => {
    clearFieldError("error-motif");
    clearMessages();
  });
  dureeInput?.addEventListener("input", () => {
    clearFieldError("error-duree");
    clearMessages();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessages();
    clearFieldError("error-pc");
    clearFieldError("error-motif");
    clearFieldError("error-duree");

    const selectedPc = pcIdInput?.value;
    const motif = motifInput?.value.trim() || "";
    const duration = Number(dureeInput?.value);
    let isValid = true;

    if (!selectedPc) {
      showFieldError("error-pc", "Sélectionnez le PC que vous souhaitez emprunter.", pcPickerTrigger);
      isValid = false;
    }
    if (!motif) {
      showFieldError("error-motif", "Le motif de la demande est obligatoire.", motifInput);
      isValid = false;
    } else if (motif.length < 5) {
      showFieldError("error-motif", "Veuillez préciser votre motif (5 caractères minimum).", motifInput);
      isValid = false;
    }
    if (!dureeInput?.value) {
      showFieldError("error-duree", "La durée souhaitée est obligatoire.", dureeInput);
      isValid = false;
    } else if (!Number.isInteger(duration) || duration < 1 || duration > 60) {
      showFieldError("error-duree", "Saisissez une durée entière comprise entre 1 et 60 jours.", dureeInput);
      isValid = false;
    }

    if (!isValid) {
      form.querySelector(".field-error.active")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch("/api/emprunts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pc_id: selectedPc,
          motif,
          duree_jours: duration
        })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (globalError) {
          globalError.textContent = result.error || "La demande n’a pas pu être enregistrée.";
          globalError.hidden = false;
          globalError.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }

      if (globalInfo) {
        globalInfo.textContent = result.message;
        globalInfo.hidden = false;
        globalInfo.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      form.reset();
      pcIdInput.value = "";
      pcPickerValue.textContent = "Choisir un PC parmi les appareils disponibles";
      pcPickerTrigger.classList.remove("has-selection");
      pcOptions.querySelectorAll(".pc-option").forEach((option) => {
        option.setAttribute("aria-selected", "false");
        option.classList.remove("is-selected");
      });
      if (fileUploadName) {
        fileUploadName.textContent = "";
        fileUploadName.hidden = true;
      }
      await loadPcOptions(false);
      if (globalInfo) {
        globalInfo.textContent = result.message;
        globalInfo.hidden = false;
      }
    } catch (error) {
      if (globalError) {
        globalError.textContent = "Impossible de joindre le serveur. Vérifiez qu’il est démarré puis réessayez.";
        globalError.hidden = false;
        globalError.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
