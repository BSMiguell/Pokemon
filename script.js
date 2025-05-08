// Elementos do DOM
const roomsContainer = document.getElementById("rooms-container");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("room-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageIndicator = document.getElementById("page-indicator");
const hackSearchInput = document.getElementById("hack-search");
const searchSuggestions = document.getElementById("search-suggestions");
const searchIcon = document.querySelector(".search-icon");
const clearIcon = document.querySelector(".clear-icon");
const hacksSection = document.getElementById("hacks");

// Variáveis de estado
let scrollPosition = 0;
let currentPage = 1;
const cardsPerPage = 9;
let currentSuggestions = [];
let pesquisaConfirmada = false;
let isLoading = false;

// FUNÇÕES UTILITÁRIAS
function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function scrollToHacksSection() {
  if (hacksSection) {
    // Calcula a posição considerando o header fixo
    const headerHeight = document.querySelector("header").offsetHeight;
    const targetPosition = hacksSection.offsetTop - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}

// FUNÇÕES DE LOADING
function showLoadingSkeleton() {
  if (isLoading) return;
  isLoading = true;

  roomsContainer.innerHTML = "";
  roomsContainer.classList.add("hidden");

  const loadingHTML = `
    <div class="skeleton-loading">
      ${Array(9)
        .fill()
        .map(
          () => `
        <div class="skeleton-card">
          <div class="skeleton-img"></div>
          <div class="skeleton-badge"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line long"></div>
            <div class="skeleton-line extra-long"></div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  roomsContainer.insertAdjacentHTML("beforebegin", loadingHTML);
}

function hideLoadingSkeleton() {
  isLoading = false;
  const loadingElement = document.querySelector(".skeleton-loading");
  if (loadingElement) loadingElement.remove();
  roomsContainer.classList.remove("hidden");
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
      shouldScrollToSection = false; // Não faz scroll após pesquisa
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
  shouldScrollToSection = false; // Não faz scroll ao limpar pesquisa
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

  // Scroll para o topo da seção apenas quando shouldScrollToSection for true
  if (shouldScrollToSection) {
    scrollToHacksSection();
    shouldScrollToSection = false; // Reseta após o scroll
  }
}

function scrollToHacksSection() {
  if (hacksSection) {
    // Usamos setTimeout para garantir que o DOM foi atualizado
    setTimeout(() => {
      window.scrollTo({
        top: hacksSection.offsetTop - 20,
        behavior: "smooth",
      });
    }, 50);
  }
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

  // Renderiza hacks iniciais sem scroll
  shouldScrollToSection = false;
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
      shouldScrollToSection = false; // Não faz scroll após pesquisa
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
      shouldScrollToSection = false; // Não faz scroll ao aplicar filtro

      renderHacks(btn.dataset.filter, 1, "");
    });
  });

  // Paginação com loading
  prevPageBtn.addEventListener("click", () => {
    if (isLoading) return;

    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    showLoadingSkeleton();

    // 1. Scroll para a seção ANTES de tudo
    scrollToHacksSection();

    // 2. Mostra o loading
    showLoadingSkeleton();

    // 3. Desabilita os botões
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;

    // 4. Simula o carregamento
    setTimeout(() => {
      renderHacks(activeFilter, currentPage - 1, hackSearchInput.value.trim());
      hideLoadingSkeleton();
      updatePaginationControls(
        getFilteredHacksCount(activeFilter, hackSearchInput.value.trim())
      );
    }, 3000);
  });

  nextPageBtn.addEventListener("click", () => {
    if (isLoading) return;

    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    showLoadingSkeleton();

    // 1. Scroll para a seção ANTES de tudo
    scrollToHacksSection();

    // 2. Mostra o loading
    showLoadingSkeleton();

    // 3. Desabilita os botões
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;

    // 4. Simula o carregamento
    setTimeout(() => {
      renderHacks(activeFilter, currentPage + 1, hackSearchInput.value.trim());
      hideLoadingSkeleton();
      updatePaginationControls(
        getFilteredHacksCount(activeFilter, hackSearchInput.value.trim())
      );
    }, 3000);
  });

  // Função auxiliar para contar hacks filtrados
  function getFilteredHacksCount(filter, searchTerm) {
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

    if (searchTerm) {
      const lowerTerm = removerAcentos(searchTerm.toLowerCase());
      filteredHacks = filteredHacks.filter(
        (hack) =>
          removerAcentos(hack.title.toLowerCase()).includes(lowerTerm) ||
          removerAcentos(hack.creator.toLowerCase()).includes(lowerTerm) ||
          hack.features.some((feat) =>
            removerAcentos(feat.toLowerCase()).includes(lowerTerm)
          )
      );
    }

    return filteredHacks.length;
  }

  // Modal
  modalClose.addEventListener("click", closeModal);

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
    shouldScrollToSection = false;
    renderHacks(filter, page, searchTerm);
  });
});
