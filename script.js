// Elementos do DOM
const hacksContainer = document.getElementById("hacks-container");
const gridView = document.getElementById("grid-view");
const listView = document.getElementById("list-view");
const cardsView = document.getElementById("cards-view");
const viewButtons = document.querySelectorAll(".view-btn");
const modal = document.getElementById("hack-details-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const currentPageSpan = document.getElementById("current-page");
const totalPagesSpan = document.getElementById("total-pages");
const hackSearchInput = document.getElementById("hack-search");
const searchSuggestions = document.getElementById("search-suggestions");
const searchButton = document.getElementById("search-button");
const clearButton = document.getElementById("clear-search");
const sortSelect = document.getElementById("sort-by");
const pageSizeSelect = document.getElementById("page-size");
const resetFiltersBtn = document.getElementById("reset-filters");
const noResults = document.getElementById("no-results");
const totalHacksSpan = document.getElementById("total-hacks");
const showingCountSpan = document.getElementById("showing-count");
const totalCountSpan = document.getElementById("total-count");
const modalPrevHack = document.getElementById("modal-prev-hack");
const modalNextHack = document.getElementById("modal-next-hack");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const applyFiltersBtn = document.getElementById("apply-filters");
const activeFiltersCount = document.getElementById("active-filters-count");
const toggleFiltersBtn = document.getElementById("toggle-filters");
const advancedFilters = document.getElementById("advanced-filters");
const quickFilters = document.querySelectorAll(".quick-filter");

// Variáveis de estado
let currentPage = 1;
let currentPageSize = 12;
let currentSearchTerm = "";
let currentView = "grid";
let scrollPosition = 0;
let currentHackIndex = 0;
let isLoading = false;
let filteredHacks = [];
let shouldSearch = false;
let isTyping = false;
let filtersVisible = false;

// Estado dos filtros avançados
let activeFilters = {
  generations: [],
  types: [],
  features: [],
  sort: "popularity",
};

// Constantes
const DEFAULT_PAGE_SIZE = 12;
const DEBOUNCE_DELAY = 300;

// FUNÇÕES UTILITÁRIAS
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function scrollToHacksSection() {
  const headerHeight = document.querySelector("header")?.offsetHeight || 0;
  const hacksSection = document.getElementById("hacks");
  if (hacksSection) {
    const targetPosition = hacksSection.offsetTop - headerHeight - 20;
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}

function updateCounters(total, showing) {
  totalHacksSpan.textContent = total;
  showingCountSpan.textContent = showing;
  totalCountSpan.textContent = total;
}

// Atualiza o contador de filtros ativos
function updateActiveFiltersCount() {
  const count =
    activeFilters.generations.length +
    activeFilters.types.length +
    activeFilters.features.length +
    (activeFilters.sort !== "popularity" ? 1 : 0);

  activeFiltersCount.textContent = `${count} filtro${
    count !== 1 ? "s" : ""
  } ativo${count !== 1 ? "s" : ""}`;

  if (count > 0) {
    activeFiltersCount.classList.add("highlight");
  } else {
    activeFiltersCount.classList.remove("highlight");
  }
}

// FUNÇÕES PARA FILTROS RÁPIDOS
function applyQuickFilter(filterType) {
  // Limpa outros filtros
  activeFilters = {
    generations: [],
    types: [],
    features: [],
    sort: "popularity",
  };

  // Aplica o filtro rápido
  switch (filterType) {
    case "trending":
      activeFilters.features.push("trending");
      break;
    case "recent":
      activeFilters.sort = "recent";
      break;
    case "featured":
      activeFilters.features.push("featured");
      break;
  }

  // Atualiza a UI
  updateActiveFiltersCount();
  currentPage = 1;
  renderHacks();
  scrollToHacksSection();
}

// FUNÇÃO PARA TOGGLE DOS FILTROS AVANÇADOS
function toggleAdvancedFilters() {
  filtersVisible = !filtersVisible;

  if (filtersVisible) {
    advancedFilters.style.display = "block";
    toggleFiltersBtn.innerHTML =
      '<i class="fas fa-chevron-up"></i> Ocultar Filtros';
    advancedFilters.classList.add("show-filters");
  } else {
    advancedFilters.style.display = "none";
    toggleFiltersBtn.innerHTML =
      '<i class="fas fa-chevron-down"></i> Filtros Avançados';
    advancedFilters.classList.remove("show-filters");
  }
}

// FUNÇÕES DE LOADING
function showLoadingSkeleton() {
  if (isLoading) return;
  isLoading = true;

  gridView.innerHTML = "";
  listView.innerHTML = "";
  cardsView.innerHTML = "";

  const skeletonCards = Array(currentPageSize)
    .fill()
    .map(
      (_, i) => `
    <div class="hack-card skeleton">
      <div class="hack-img"></div>
      <div class="hack-content">
        <div class="hack-title"></div>
        <div class="hack-creator"></div>
        <div class="hack-features">
          <span class="feature-tag"></span>
          <span class="feature-tag"></span>
          <span class="feature-tag"></span>
        </div>
        <div class="hack-desc"></div>
        <div class="hack-meta">
          <div class="hack-rating"></div>
          <div class="hack-version"></div>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  gridView.innerHTML = skeletonCards;
  listView.innerHTML = skeletonCards;
  cardsView.innerHTML = skeletonCards;
}

function hideLoadingSkeleton() {
  isLoading = false;
}

// FUNÇÕES DE PESQUISA E FILTRO
function filterHacks() {
  let results = [...hacks];

  // Filtros rápidos - CORREÇÃO AQUI
  if (activeFilters.features.includes("trending")) {
    results = results.filter((hack) => hack.trending === true);
  }

  if (activeFilters.features.includes("featured")) {
    results = results.filter((hack) => hack.featured === true);
  }

  // Aplica filtro de pesquisa
  if (shouldSearch && currentSearchTerm) {
    const searchTerm = removerAcentos(currentSearchTerm.toLowerCase());
    results = results.filter(
      (hack) =>
        removerAcentos(hack.title.toLowerCase()).includes(searchTerm) ||
        removerAcentos(hack.creator.toLowerCase()).includes(searchTerm) ||
        hack.features.some((feat) =>
          removerAcentos(feat.toLowerCase()).includes(searchTerm)
        )
    );
  }

  // Filtros avançados
  results = results.filter((hack) => {
    // Gerações
    if (
      activeFilters.generations.length > 0 &&
      !activeFilters.generations.includes(hack.generation)
    ) {
      return false;
    }

    // Tipos
    if (activeFilters.types.length > 0) {
      let typeMatch = false;

      if (
        activeFilters.types.includes("new-region") &&
        !["Kanto", "Johto", "Hoenn", "Sinnoh"].includes(hack.region)
      ) {
        typeMatch = true;
      }
      if (
        activeFilters.types.includes("enhanced") &&
        hack.features.some((f) => f.includes("Aprimorado"))
      ) {
        typeMatch = true;
      }
      if (
        activeFilters.types.includes("difficulty") &&
        hack.difficulty === "Difícil"
      ) {
        typeMatch = true;
      }
      if (
        activeFilters.types.includes("complete") &&
        hack.status === "Completo"
      ) {
        typeMatch = true;
      }

      if (!typeMatch) return false;
    }

    // Recursos
    if (activeFilters.features.length > 0) {
      let featureMatch = false;

      if (activeFilters.features.includes("megas") && hack.hasMegas) {
        featureMatch = true;
      }
      if (activeFilters.features.includes("z-moves") && hack.hasZMoves) {
        featureMatch = true;
      }
      if (activeFilters.features.includes("dynamax") && hack.hasDynamax) {
        featureMatch = true;
      }
      if (activeFilters.features.includes("all-gen") && hack.allGenerations) {
        featureMatch = true;
      }

      if (!featureMatch) return false;
    }

    return true;
  });

  // Ordenação
  results.sort((a, b) => {
    switch (activeFilters.sort) {
      case "popularity":
        return b.popularity - a.popularity;
      case "recent":
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      case "rating":
        return b.rating - a.rating;
      case "difficulty-asc":
        const difficultyOrder = ["Fácil", "Médio", "Difícil"];
        return (
          difficultyOrder.indexOf(a.difficulty) -
          difficultyOrder.indexOf(b.difficulty)
        );
      case "difficulty-desc":
        return (
          difficultyOrder.indexOf(b.difficulty) -
          difficultyOrder.indexOf(a.difficulty)
        );
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  filteredHacks = results;
  return results;
}

function getSearchSuggestions(term) {
  if (term.length < 2) return [];

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
      <div class="suggestion-info">
        <div class="suggestion-title">${hack.title}</div>
        <div class="suggestion-creator">por ${hack.creator}</div>
        <div class="suggestion-features">
          ${hack.features
            .slice(0, 2)
            .map((feat) => `<span class="suggestion-feature">${feat}</span>`)
            .join("")}
        </div>
      </div>
    `;

    suggestion.addEventListener("click", () => {
      currentSearchTerm = hack.title;
      hackSearchInput.value = hack.title;
      searchSuggestions.classList.remove("show");
      shouldSearch = true;
      currentPage = 1;
      renderHacks();
      scrollToHacksSection();
    });

    searchSuggestions.appendChild(suggestion);
  });

  searchSuggestions.classList.add("show");
}

// FUNÇÕES DE RENDERIZAÇÃO
function renderHacks() {
  showLoadingSkeleton();

  setTimeout(() => {
    const filtered = filterHacks();
    const totalHacks = filtered.length;
    const totalPages = Math.ceil(totalHacks / currentPageSize);
    const paginatedHacks = filtered.slice(
      (currentPage - 1) * currentPageSize,
      currentPage * currentPageSize
    );

    // Atualiza controles
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    updateCounters(totalHacks, paginatedHacks.length);

    // Limpa containers
    gridView.innerHTML = "";
    listView.innerHTML = "";
    cardsView.innerHTML = "";

    if (paginatedHacks.length === 0) {
      noResults.classList.add("active");
    } else {
      noResults.classList.remove("active");

      // Renderiza nas visualizações
      paginatedHacks.forEach((hack) => {
        gridView.appendChild(createCardElement(hack));
        listView.appendChild(createListItemElement(hack));
        cardsView.appendChild(createCardViewElement(hack));
      });
    }

    hideLoadingSkeleton();
    updateURL();
  }, 500);
}

function createCardElement(hack) {
  const card = document.createElement("div");
  card.className = "hack-card";
  card.innerHTML = `
    <div class="hack-img">
      <img src="${hack.image}" alt="${hack.title}" loading="lazy">
      ${
        hack.status === "Completo"
          ? `<span class="hack-badge">Completo</span>`
          : `<span class="hack-badge beta">${hack.status}</span>`
      }
    </div>
    <div class="hack-content">
      <h3 class="hack-title">${hack.title}</h3>
      <p class="hack-creator">Por <a href="${
        hack.creatorUrl
      }" target="_blank">${hack.creator}</a></p>
      <div class="hack-features">
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
      <p class="hack-desc">${hack.description}</p>
      <div class="hack-meta">
        <div class="hack-rating">
          ${"★".repeat(Math.floor(hack.rating))}${"☆".repeat(
    5 - Math.floor(hack.rating)
  )}
          <span>${hack.rating.toFixed(1)}</span>
        </div>
        <span class="hack-version">v${hack.version}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => openModal(hack.id));
  return card;
}

function createListItemElement(hack) {
  const item = document.createElement("div");
  item.className = "hack-list-item";
  item.innerHTML = `
    <div class="hack-list-img">
      <img src="${hack.image}" alt="${hack.title}" loading="lazy">
    </div>
    <div class="hack-list-content">
      <h3 class="hack-list-title">${hack.title}</h3>
      <p class="hack-list-creator">Por ${hack.creator}</p>
      <div class="hack-list-features">
        ${hack.features
          .slice(0, 2)
          .map((feat) => `<span class="hack-list-feature">${feat}</span>`)
          .join("")}
      </div>
    </div>
    <div class="hack-list-meta">
      <div class="hack-list-rating">
        ${"★".repeat(Math.floor(hack.rating))}${"☆".repeat(
    5 - Math.floor(hack.rating)
  )}
      </div>
      <span class="hack-list-version">v${hack.version}</span>
    </div>
  `;

  item.addEventListener("click", () => openModal(hack.id));
  return item;
}

function createCardViewElement(hack) {
  const card = document.createElement("div");
  card.className = "hack-card-horizontal";
  card.innerHTML = `
    <div class="hack-card-img">
      <img src="${hack.image}" alt="${hack.title}" loading="lazy">
    </div>
    <div class="hack-card-content">
      <div class="hack-card-header">
        <h3 class="hack-card-title">${hack.title}</h3>
        ${
          hack.status === "Completo"
            ? `<span class="hack-card-badge">Completo</span>`
            : `<span class="hack-card-badge beta">${hack.status}</span>`
        }
      </div>
      <p class="hack-card-creator">Por ${
        hack.creator
      } | Gen ${hack.generation.replace("gen", "")}</p>
      <p class="hack-card-desc">${hack.description}</p>
      <div class="hack-card-footer">
        <div class="hack-card-features">
          ${hack.features
            .slice(0, 2)
            .map((feat) => `<span class="hack-card-feature">${feat}</span>`)
            .join("")}
        </div>
        <div class="hack-card-meta">
          <div class="hack-card-rating">
            ${hack.rating.toFixed(1)}
            <i class="fas fa-star"></i>
          </div>
          <span class="hack-card-version">v${hack.version}</span>
        </div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => openModal(hack.id));
  return card;
}

function updateURL() {
  const params = new URLSearchParams();

  // Filtros ativos
  if (activeFilters.generations.length > 0) {
    params.set("generations", activeFilters.generations.join(","));
  }
  if (activeFilters.types.length > 0) {
    params.set("types", activeFilters.types.join(","));
  }
  if (activeFilters.features.length > 0) {
    params.set("features", activeFilters.features.join(","));
  }

  params.set("page", currentPage);
  params.set("size", currentPageSize);
  params.set("sort", activeFilters.sort);
  params.set("view", currentView);
  if (currentSearchTerm) params.set("search", currentSearchTerm);

  history.pushState(null, null, `?${params.toString()}`);
}

// FUNÇÕES DO MODAL
function openModal(hackId) {
  scrollPosition = window.scrollY;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = "100%";

  const hack = hacks.find((h) => h.id === hackId);
  if (!hack) return;

  currentHackIndex = filteredHacks.findIndex((h) => h.id === hackId);

  modalTitle.textContent = hack.title;

  // Preenche os dados do modal
  document.getElementById("modal-cover").src = hack.image;
  document.getElementById("hack-creator").textContent = hack.creator;
  document.getElementById("hack-release").textContent = new Date(
    hack.releaseDate
  ).toLocaleDateString();
  document.getElementById("hack-updated").textContent = new Date(
    hack.updateDate
  ).toLocaleDateString();
  document.getElementById("hack-version").textContent = hack.version;

  // Recursos principais
  const featuresList = document.getElementById("hack-features");
  featuresList.innerHTML = hack.features
    .slice(0, 8)
    .map((feat) => `<li>${feat}</li>`)
    .join("");

  // Tags
  const tagsContainer = document.getElementById("hack-tags");
  tagsContainer.innerHTML = [
    `Gen ${hack.generation.replace("gen", "")}`,
    hack.difficulty,
    hack.status,
    ...hack.features.slice(0, 3),
  ]
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  // Descrição
  document.getElementById("hack-description").innerHTML = `
    <p>${hack.description}</p>
    ${hack.longDescription ? `<p>${hack.longDescription}</p>` : ""}
  `;

  // Screenshots
  const screenshotsGallery = document.getElementById("screenshots-gallery");
  screenshotsGallery.innerHTML = hack.screenshots
    .map(
      (img, i) => `
      <div class="screenshot-item">
        <img src="${img}" alt="Screenshot ${i + 1} do ${
        hack.title
      }" loading="lazy">
      </div>
    `
    )
    .join("");

  // Atualizações
  const updatesTimeline = document.getElementById("updates-timeline");
  updatesTimeline.innerHTML = hack.updates
    .map(
      (update) => `
      <div class="update-item">
        <div class="update-version">${update.version}</div>
        <div class="update-date">${new Date(
          update.date
        ).toLocaleDateString()}</div>
        <div class="update-content">
          ${update.description}
          ${
            update.features.length > 0
              ? `
            <ul class="update-features">
              ${update.features.map((f) => `<li>${f}</li>`).join("")}
            </ul>
          `
              : ""
          }
        </div>
      </div>
    `
    )
    .join("");

  // Comunidade
  const communityLinks = document.querySelector(".community-links");
  communityLinks.innerHTML = `
    <h4>Links Oficiais</h4>
    ${
      hack.discordUrl
        ? `
      <a href="${hack.discordUrl}" class="community-link" target="_blank">
        <i class="fab fa-discord"></i> Discord do Criador
      </a>
    `
        : ""
    }
    ${
      hack.forumUrl
        ? `
      <a href="${hack.forumUrl}" class="community-link" target="_blank">
        <i class="fab fa-github"></i> PokeCommunity Thread
      </a>
    `
        : ""
    }
    ${
      hack.officialSite
        ? `
      <a href="${hack.officialSite}" class="community-link" target="_blank">
        <i class="fas fa-globe"></i> Site Oficial
      </a>
    `
        : ""
    }
  `;

  // Ativa a primeira aba
  activateTab(document.querySelector(".tab-btn[data-tab='overview']"));

  // Mostra o modal
  modal.classList.add("active");

  // Atualiza navegação entre hacks
  updateModalNavigation();
}

function closeModal() {
  modal.classList.remove("active");

  setTimeout(() => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollPosition);
  }, 300);
}

function updateModalNavigation() {
  modalPrevHack.disabled = currentHackIndex === 0;
  modalNextHack.disabled = currentHackIndex === filteredHacks.length - 1;
}

function navigateToAdjacentHack(direction) {
  if (direction === "prev" && currentHackIndex > 0) {
    openModal(filteredHacks[currentHackIndex - 1].id);
  } else if (
    direction === "next" &&
    currentHackIndex < filteredHacks.length - 1
  ) {
    openModal(filteredHacks[currentHackIndex + 1].id);
  }
}

// FUNÇÕES DAS ABAS
function activateTab(button) {
  // Desativa todas as abas
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  tabContents.forEach((content) => content.classList.remove("active"));

  // Ativa a aba selecionada
  button.classList.add("active");
  const tabId = button.dataset.tab;
  document.getElementById(`${tabId}-tab`).classList.add("active");
}

// Carrega os filtros da URL
function loadFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  // Gerações
  if (urlParams.get("generations")) {
    activeFilters.generations = urlParams.get("generations").split(",");
    activeFilters.generations.forEach((gen) => {
      const chip = document.querySelector(`.filter-chip[data-filter="${gen}"]`);
      if (chip) chip.classList.add("active");
    });
  }

  // Tipos
  if (urlParams.get("types")) {
    activeFilters.types = urlParams.get("types").split(",");
    activeFilters.types.forEach((type) => {
      const card = document.querySelector(
        `.filter-card[data-filter="${type}"]`
      );
      if (card) card.classList.add("active");
    });
  }

  // Recursos
  if (urlParams.get("features")) {
    activeFilters.features = urlParams.get("features").split(",");
    activeFilters.features.forEach((feature) => {
      const input = document.querySelector(
        `.filter-switches input[data-filter="${feature}"]`
      );
      if (input) input.checked = true;
    });
  }

  // Ordenação
  if (urlParams.get("sort")) {
    activeFilters.sort = urlParams.get("sort");
    sortSelect.value = activeFilters.sort;
  }

  // Outros parâmetros
  currentPage = parseInt(urlParams.get("page")) || 1;
  currentPageSize = parseInt(urlParams.get("size")) || DEFAULT_PAGE_SIZE;
  currentView = urlParams.get("view") || "grid";
  currentSearchTerm = urlParams.get("search") || "";
  shouldSearch = !!currentSearchTerm;

  // Atualiza UI
  hackSearchInput.value = currentSearchTerm;
  pageSizeSelect.value = currentPageSize;
  clearButton.style.display = currentSearchTerm ? "block" : "none";

  // Ativa visualização
  viewButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.view === currentView) {
      btn.classList.add("active");
    }
  });

  document
    .querySelectorAll(".hacks-grid, .hacks-list, .hacks-cards")
    .forEach((view) => {
      view.classList.remove("active");
    });
  document.getElementById(`${currentView}-view`).classList.add("active");

  updateActiveFiltersCount();
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  // Carrega os filtros da URL
  loadFiltersFromURL();

  // Renderiza os hacks
  renderHacks();

  // Event Listeners para barra de pesquisa
  hackSearchInput.addEventListener(
    "input",
    debounce((e) => {
      currentSearchTerm = e.target.value.trim();
      clearButton.style.display = currentSearchTerm ? "block" : "none";
      isTyping = true;

      // Mostra sugestões enquanto digita
      if (currentSearchTerm.length > 1) {
        renderSuggestions(getSearchSuggestions(currentSearchTerm));
      } else {
        searchSuggestions.classList.remove("show");
        shouldSearch = false;
        currentPage = 1;
        if (!isTyping) {
          renderHacks();
        }
      }
    }, DEBOUNCE_DELAY)
  );

  hackSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      isTyping = false;
      searchSuggestions.classList.remove("show");
      shouldSearch = true;
      currentPage = 1;
      showLoadingSkeleton();
      renderHacks();
      scrollToHacksSection();
    }
  });

  searchButton.addEventListener("click", () => {
    isTyping = false;
    searchSuggestions.classList.remove("show");
    shouldSearch = true;
    currentPage = 1;
    showLoadingSkeleton();
    renderHacks();
    scrollToHacksSection();
  });

  clearButton.addEventListener("click", () => {
    isTyping = false;
    hackSearchInput.value = "";
    currentSearchTerm = "";
    clearButton.style.display = "none";
    searchSuggestions.classList.remove("show");
    shouldSearch = false;
    currentPage = 1;
    showLoadingSkeleton();
    renderHacks();
  });

  // Event Listeners para filtros rápidos
  quickFilters.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove a classe active de todos os botões
      quickFilters.forEach((btn) => btn.classList.remove("active"));
      // Adiciona a classe active apenas no botão clicado
      this.classList.add("active");
      // Aplica o filtro
      applyQuickFilter(this.dataset.filter);
    });
  });

  // Event Listener para toggle dos filtros avançados
  toggleFiltersBtn.addEventListener("click", toggleAdvancedFilters);

  // Event Listeners para filtros
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", function () {
      const filter = this.dataset.filter;
      const index = activeFilters.generations.indexOf(filter);

      if (index === -1) {
        activeFilters.generations.push(filter);
        this.classList.add("active");
      } else {
        activeFilters.generations.splice(index, 1);
        this.classList.remove("active");
      }

      updateActiveFiltersCount();
    });
  });

  document.querySelectorAll(".filter-card").forEach((card) => {
    card.addEventListener("click", function () {
      const filter = this.dataset.filter;
      const index = activeFilters.types.indexOf(filter);

      if (index === -1) {
        activeFilters.types.push(filter);
        this.classList.add("active");
      } else {
        activeFilters.types.splice(index, 1);
        this.classList.remove("active");
      }

      updateActiveFiltersCount();
    });
  });

  document.querySelectorAll(".filter-switches input").forEach((switchEl) => {
    switchEl.addEventListener("change", function () {
      const filter = this.dataset.filter;
      const index = activeFilters.features.indexOf(filter);

      if (this.checked && index === -1) {
        activeFilters.features.push(filter);
      } else if (!this.checked && index !== -1) {
        activeFilters.features.splice(index, 1);
      }

      updateActiveFiltersCount();
    });
  });

  // Ordenação
  sortSelect.addEventListener("change", function () {
    activeFilters.sort = this.value;
    updateActiveFiltersCount();
  });

  // Aplicar filtros
  applyFiltersBtn.addEventListener("click", () => {
    currentPage = 1;
    renderHacks();
    scrollToHacksSection();
  });

  // Resetar filtros
  resetFiltersBtn.addEventListener("click", function () {
    // Reset all filters
    activeFilters = {
      generations: [],
      types: [],
      features: [],
      sort: "popularity",
    };

    // Reset UI
    document.querySelectorAll(".filter-chip, .filter-card").forEach((el) => {
      el.classList.remove("active");
    });

    document.querySelectorAll(".filter-switches input").forEach((el) => {
      el.checked = false;
    });

    // Reset filtros rápidos
    quickFilters.forEach((btn) => btn.classList.remove("active"));

    sortSelect.value = "popularity";
    hackSearchInput.value = "";
    currentSearchTerm = "";
    clearButton.style.display = "none";
    searchSuggestions.classList.remove("show");
    shouldSearch = false;

    updateActiveFiltersCount();
    currentPage = 1;
    renderHacks();
  });

  // Visualizações
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view;

      viewButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document
        .querySelectorAll(".hacks-grid, .hacks-list, .hacks-cards")
        .forEach((view) => {
          view.classList.remove("active");
        });
      document.getElementById(`${currentView}-view`).classList.add("active");

      updateURL();
    });
  });

  // Tamanho da página
  pageSizeSelect.addEventListener("change", () => {
    currentPageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    renderHacks();
  });

  // Paginação
  prevPageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (prevPageBtn.disabled) return;
    currentPage--;
    renderHacks();
    scrollToHacksSection();
  });

  nextPageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (nextPageBtn.disabled) return;
    currentPage++;
    renderHacks();
    scrollToHacksSection();
  });

  // Modal
  modalClose.addEventListener("click", closeModal);
  modalPrevHack.addEventListener("click", () => navigateToAdjacentHack("prev"));
  modalNextHack.addEventListener("click", () => navigateToAdjacentHack("next"));

  // Abas do modal
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn));
  });

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Navegação pelo histórico
  window.addEventListener("popstate", () => {
    loadFiltersFromURL();
    renderHacks();
  });

  // Rolagem para o topo ao atualizar
  window.addEventListener("load", () => {
    // Verifica se há parâmetros na URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString() === "") {
      scrollToTop();
    }
  });
});

// Rolagem para o topo ao clicar em próximo/anterior
prevPageBtn.addEventListener("click", scrollToHacksSection);
nextPageBtn.addEventListener("click", scrollToHacksSection);
