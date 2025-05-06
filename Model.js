// FUNÇÕES DO MODAL
function openModal(hackId) {
  scrollPosition = window.pageYOffset;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = "100%";

  const hack = hacks.find((h) => h.id === hackId);
  if (!hack) return;

  modalTitle.textContent = hack.title;
  modalBody.innerHTML = `
      <img src="${hack.image}" alt="${
    hack.title
  }" class="modal-room-img" loading="lazy">
      
      <div class="modal-info-grid">
        <div class="modal-info-item">
          <i class="fas fa-user"></i> <strong>Criador:</strong> <a href="${
            hack.creatorUrl
          }" target="_blank">${hack.creator}</a>
        </div>
        <div class="modal-info-item">
          <i class="fas fa-check-circle"></i> <strong>Status:</strong> ${
            hack.status
          }
        </div>
        <div class="modal-info-item">
          <i class="fas fa-code-branch"></i> <strong>Versão:</strong> ${
            hack.version
          }
        </div>
        <div class="modal-info-item">
          <i class="fas fa-tachometer-alt"></i> <strong>Dificuldade:</strong> ${
            hack.difficulty
          }
        </div>
        <div class="modal-info-item">
          <i class="fas fa-globe-americas"></i> <strong>Região:</strong> ${
            hack.region
          }
        </div>
      </div>
      
      <div class="modal-section">
        <h3>Recursos Principais</h3>
        <div class="modal-features">
          ${hack.features
            .map(
              (feat) => `
            <div class="modal-feature">
              <i class="fas fa-check"></i>
              <h4>${feat}</h4>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      
      <div class="modal-section">
        <h3>Descrição</h3>
        <p>${hack.description}</p>
      </div>
      
      <div class="modal-actions">
        <a href="${hack.officialSite}" class="btn btn-primary" target="_blank">
          <i class="fas fa-external-link-alt"></i> Visitar Site Oficial
        </a>
        <button class="btn btn-secondary" id="close-modal-btn">
          <i class="fas fa-times"></i> Fechar
        </button>
      </div>
    `;

  document
    .getElementById("close-modal-btn")
    .addEventListener("click", closeModal);
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeModal() {
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollPosition);
  }, 300);
}
