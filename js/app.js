document.addEventListener("DOMContentLoaded", () => {
  const pcContainer = document.getElementById("pc-grid");

  function afficherPCs() {
    pcContainer.innerHTML = "";

    pcData.forEach(pc => {
      const isDisponible = pc.status === "Disponible";

      const card = document.createElement("div");
      card.classList.add("pc-card");

      card.innerHTML = `
        <h3>${pc.nom}</h3>
        <p><strong>RAM:</strong> ${pc.ram}</p>
        <p><strong>Processeur:</strong> ${pc.cpu}</p>
        <p style="margin-top:0.5rem;">
          <span class="badge ${isDisponible ? 'disponible' : 'emprunte'}">
            ${pc.status}
          </span>
        </p>
        <button 
          class="btn-emprunter" 
          ${!isDisponible ? 'disabled' : ''}
          onclick="emprunterPC(${pc.id})">
          ${isDisponible ? 'Emprunter' : 'Non disponible'}
        </button>
      `;

      pcContainer.appendChild(card);
    });
  }

  // Initialisation
  afficherPCs();
});

// Fonction d'exemple pour l'US3
function emprunterPC(id) {
  const pc = pcData.find(p => p.id === id);
  if (pc && pc.status === "Disponible") {
    pc.status = "Emprunté";
    alert(`Vous avez emprunté le ${pc.nom}`);
    // Déclenche le rafraîchissement de l'affichage
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }
}