// Elementos do DOM
const roomsContainer = document.getElementById("rooms-container");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("room-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mainNav = document.getElementById("main-nav");
const header = document.getElementById("header");
const navLinks = document.querySelectorAll("nav a");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageIndicator = document.getElementById("page-indicator");
const hackSearchInput = document.getElementById("hack-search");
const searchSuggestions = document.getElementById("search-suggestions");
const searchIcon = document.querySelector(".search-icon");
const clearIcon = document.querySelector(".clear-icon");

// Variáveis de estado
let scrollPosition = 0;
let currentPage = 1;
const cardsPerPage = 9;
let currentSuggestions = [];
let pesquisaConfirmada = false;

// FUNÇÕES UTILITÁRIAS
function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// FUNÇÕES DE PESQUISA
function filterHacksBySearchTerm(term) {
  const lowerTerm = removerAcentos(term.toLowerCase());
  return hacks
    .filter(
      (hack) =>
        removerAcentos(hack.title.toLowerCase()).includes(lowerTerm) ||
        removerAcentos(hack.creator.toLowerCase()).includes(lowerTerm) ||
        hack.features.some((feat) =>
          removerAcentos(feat.toLowerCase()).includes(lowerTerm)
        )
    )
    .slice(0, 5);
}

function renderSuggestions(suggestions) {
  searchSuggestions.innerHTML = "";

  if (suggestions.length === 0) {
    searchSuggestions.classList.remove("show");
    return;
  }

  suggestions.forEach((hack) => {
    const suggestion = document.createElement("div");
    suggestion.className = "suggestion-item";
    suggestion.innerHTML = `
      <img src="${hack.image}" alt="${hack.title}" loading="lazy">
      <div>
        <div class="suggestion-title">${hack.title}</div>
        <div class="suggestion-creator">por ${hack.creator}</div>
      </div>
    `;

    suggestion.addEventListener("click", () => {
      pesquisaConfirmada = true;
      hackSearchInput.value = hack.title;
      searchSuggestions.classList.remove("show");
      renderHacks("all", 1, hack.title);
    });

    searchSuggestions.appendChild(suggestion);
  });

  searchSuggestions.classList.add("show");
}

// FUNÇÃO PARA LIMPAR PESQUISA
function clearSearch() {
  hackSearchInput.value = "";
  clearIcon.style.display = "none";
  searchIcon.style.display = "block";
  pesquisaConfirmada = true;
  renderHacks("all", 1, "");
  searchSuggestions.classList.remove("show");

  // Ativa apenas o botão "Todos"
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === "all") btn.classList.add("active");
  });
}

// FUNÇÕES DE RENDERIZAÇÃO PRINCIPAL
function createCardElement(hack) {
  const card = document.createElement("div");
  card.className = "room-card";
  card.dataset.id = hack.id;

  card.innerHTML = `
    <div class="room-img">
      <img src="${hack.image}" alt="${hack.title}" loading="lazy">
      <span class="room-badge">${hack.status}</span>
    </div>
    <div class="room-content">
      <h3 class="room-title"><i class="fas fa-pokeball"></i> ${hack.title}</h3>
      <p class="room-creator">Por <a href="${hack.creatorUrl}">${
    hack.creator
  }</a> | Gen ${hack.generation.replace("gen", "")}</p>
      <div class="room-features">
        ${hack.features
          .slice(0, 3)
          .map((feat) => `<span class="feature-tag">${feat}</span>`)
          .join("")}
        ${
          hack.features.length > 3
            ? `<span class="feature-tag">+${hack.features.length - 3}</span>`
            : ""
        }
      </div>
      <p class="room-desc">${hack.description}</p>
      <div class="room-actions">
        <button class="btn btn-sm btn-view" data-id="${hack.id}">
          <i class="fas fa-info-circle"></i> Detalhes
        </button>
        <a href="${
          hack.officialSite
        }" class="btn btn-sm btn-primary" target="_blank">
          <i class="fas fa-external-link-alt"></i> Site Oficial
        </a>
      </div>
    </div>
  `;
  return card;
}

function renderHacks(filter = "all", page = 1, searchTerm = "") {
  // Se houver termo de pesquisa, força o filtro "all"
  const termoParaPesquisar = searchTerm.trim();
  if (termoParaPesquisar) {
    filter = "all";
    // Garante que apenas o botão "Todos" fique ativo
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.filter === "all") btn.classList.add("active");
    });
  }

  roomsContainer.innerHTML = "";
  currentPage = page;

  // Filtra os hacks
  let filteredHacks =
    filter === "all"
      ? [...hacks]
      : hacks.filter((hack) => {
          if (filter === "complete") return hack.status === "Completo";
          if (filter === "new-region")
            return hack.features.some((f) => f.includes("Região"));
          if (filter === "difficulty") return hack.difficulty === "Difícil";
          if (filter === "gen2") return hack.generation === "gen2";
          if (filter === "gen3") return hack.generation === "gen3";
          if (filter === "gen4") return hack.generation === "gen4";
          return false;
        });

  // Aplica pesquisa (ignorando acentos)
  if (termoParaPesquisar) {
    const lowerTerm = removerAcentos(termoParaPesquisar.toLowerCase());
    filteredHacks = filteredHacks.filter(
      (hack) =>
        removerAcentos(hack.title.toLowerCase()).includes(lowerTerm) ||
        removerAcentos(hack.creator.toLowerCase()).includes(lowerTerm) ||
        hack.features.some((feat) =>
          removerAcentos(feat.toLowerCase()).includes(lowerTerm)
        )
    );
  }

  // Paginação
  const paginatedHacks = filteredHacks.slice(
    (page - 1) * cardsPerPage,
    page * cardsPerPage
  );

  // Renderiza os cards
  paginatedHacks.forEach((hack) => {
    roomsContainer.appendChild(createCardElement(hack));
  });

  // Configura os event listeners
  setupCardEventListeners();

  // Atualiza controles de paginação
  updatePaginationControls(filteredHacks.length);

  // Atualiza a URL
  history.pushState(
    null,
    null,
    `?filter=${filter}&page=${page}&search=${encodeURIComponent(
      termoParaPesquisar
    )}`
  );
}

function setupCardEventListeners() {
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", handleDetailsClick);
  });
}

function handleDetailsClick(e) {
  e.preventDefault();
  openModal(parseInt(this.getAttribute("data-id")));
}

function updatePaginationControls(totalHacks) {
  const totalPages = Math.ceil(totalHacks / cardsPerPage);
  pageIndicator.textContent = `Página ${currentPage} de ${
    totalPages > 0 ? totalPages : 1
  }`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

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

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  // Carrega parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get("page")) || 1;
  const searchTerm = urlParams.get("search") || "";

  // Determina o filtro ativo
  let filter = "all";

  // Verifica se há um filtro válido na URL
  const urlFilter = urlParams.get("filter");
  if (
    urlFilter &&
    document.querySelector(`.filter-btn[data-filter="${urlFilter}"]`)
  ) {
    filter = urlFilter;
  }

  // Configura estado inicial dos botões
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    }
  });

  hackSearchInput.value = searchTerm;
  if (searchTerm) {
    pesquisaConfirmada = true;
    searchIcon.style.display = "none";
    clearIcon.style.display = "block";
  }

  // Renderiza hacks iniciais
  renderHacks(filter, page, searchTerm);

  // Evento de pesquisa
  hackSearchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim();

    // Mostra/oculta ícones
    if (term.length > 0) {
      searchIcon.style.display = "none";
      clearIcon.style.display = "block";
    } else {
      searchIcon.style.display = "block";
      clearIcon.style.display = "none";
    }

    currentSuggestions = term.length > 1 ? filterHacksBySearchTerm(term) : [];
    renderSuggestions(currentSuggestions);
    pesquisaConfirmada = false;
  });

  // Tecla Enter na pesquisa
  hackSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      pesquisaConfirmada = true;
      searchSuggestions.classList.remove("show");
      renderHacks("all", 1, hackSearchInput.value.trim());
    }
  });

  // Fechar sugestões ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      searchSuggestions.classList.remove("show");
    }
  });

  // Evento para o ícone X
  clearIcon.addEventListener("click", clearSearch);

  // Filtros
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove a classe active de todos os botões
      filterButtons.forEach((b) => b.classList.remove("active"));
      // Adiciona apenas ao botão clicado
      btn.classList.add("active");

      // Limpa a pesquisa
      hackSearchInput.value = "";
      clearIcon.style.display = "none";
      searchIcon.style.display = "block";
      searchSuggestions.classList.remove("show");

      renderHacks(btn.dataset.filter, 1, "");
    });
  });

  // Paginação (com scroll apenas ao navegar entre páginas)
  prevPageBtn.addEventListener("click", () => {
    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    renderHacks(activeFilter, currentPage - 1, hackSearchInput.value.trim());

    // Scroll suave apenas ao navegar entre páginas
    const hacksSection = document.getElementById("hacks");
    if (hacksSection) {
      setTimeout(() => {
        window.scrollTo({
          top: hacksSection.offsetTop - 20,
          behavior: "smooth",
        });
      }, 100);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    renderHacks(activeFilter, currentPage + 1, hackSearchInput.value.trim());

    // Scroll suave apenas ao navegar entre páginas
    const hacksSection = document.getElementById("hacks");
    if (hacksSection) {
      setTimeout(() => {
        window.scrollTo({
          top: hacksSection.offsetTop - 20,
          behavior: "smooth",
        });
      }, 100);
    }
  });

  // Modal
  modalClose.addEventListener("click", closeModal);

  // Menu mobile
  mobileMenuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("active");
    mobileMenuBtn.innerHTML = mainNav.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  // Links de navegação
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href");

      if (mainNav.classList.contains("active")) {
        mainNav.classList.remove("active");
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      }

      history.pushState(null, null, target);
      document.querySelector(target).scrollIntoView({ behavior: "smooth" });
    });
  });

  // Header scroll effect
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 100);
  });

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Navegação pelo histórico
  window.addEventListener("popstate", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get("page")) || 1;
    const searchTerm = urlParams.get("search") || "";

    // Determina o filtro ativo
    let filter = "all";
    const urlFilter = urlParams.get("filter");
    if (
      urlFilter &&
      document.querySelector(`.filter-btn[data-filter="${urlFilter}"]`)
    ) {
      filter = urlFilter;
    }

    // Atualiza os botões de filtro
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.filter === filter) {
        btn.classList.add("active");
      }
    });

    hackSearchInput.value = searchTerm;
    pesquisaConfirmada = !!searchTerm;
    if (searchTerm) {
      searchIcon.style.display = "none";
      clearIcon.style.display = "block";
    } else {
      searchIcon.style.display = "block";
      clearIcon.style.display = "none";
    }
    renderHacks(filter, page, searchTerm);
  });
});
