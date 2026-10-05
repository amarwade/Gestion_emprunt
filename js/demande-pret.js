/**
 * Formulaire frontend de demande de prêt.
 * Les appareils ci-dessous reprennent les PC marqués « Disponible »
 * dans le catalogue de l'espace étudiant.
 */
const AVAILABLE_PCS = [
  {
    id: "EL-1042",
    name: "Dell Latitude 5440",
    image: "assets/images/Dell Latitude 5440.png",
    specs: ["16 Go RAM", "512 Go SSD", "Windows 11"]
  },
  {
    id: "EL-1215",
    name: "Lenovo ThinkPad E14",
    image: "assets/images/Lenovo_ThinkPad_E14.png",
    specs: ["16 Go RAM", "512 Go SSD", "Ubuntu 24.04"]
  },
  {
    id: "EL-1302",
    name: "Acer Aspire 5",
    image: "assets/images/Acer_Aspire_5.png",
    specs: ["8 Go RAM", "256 Go SSD", "Windows 11"]
  },
  {
    id: "EL-1504",
    name: "HP ProBook 450",
    image: "assets/images/HP_ProBook_450.png",
    specs: ["16 Go RAM", "1 To SSD", "Windows 11"]
  }
];

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

  function renderPcOptions() {
    if (!pcOptions || !pcPickerTrigger) return;
    const requestedPc = new URLSearchParams(window.location.search).get("pc");

    AVAILABLE_PCS.forEach((pc) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "pc-option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.dataset.pcId = pc.id;

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
      specs.textContent = pc.specs.join(" · ");
      const indicator = document.createElement("span");
      indicator.className = "pc-option-indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.textContent = "✓";

      details.append(name, id, specs);
      option.append(image, details, indicator);
      option.addEventListener("click", () => selectPc(pc));
      pcOptions.append(option);
    });

    const preselectedPc = AVAILABLE_PCS.find((pc) => pc.id === requestedPc);
    if (preselectedPc) selectPc(preselectedPc);
  }

  renderPcOptions();

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

  form?.addEventListener("submit", (event) => {
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

    if (globalInfo) {
      globalInfo.textContent = "Votre formulaire est complet. La vérification de l’emprunt en cours et l’envoi seront activés avec le backend.";
      globalInfo.hidden = false;
      globalInfo.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
});
