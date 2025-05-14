// Elementos do DOM
const hacksContainer = document.getElementById("hacks-container");
const gridView = document.getElementById("grid-view");
const listView = document.getElementById("list-view");
const cardsView = document.getElementById("cards-view");
const viewButtons = document.querySelectorAll(".view-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const quickFilters = document.querySelectorAll(".quick-filter");
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
const toggleFiltersBtn = document.getElementById("toggle-filters");
const advancedFilters = document.getElementById("advanced-filters");
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

// Variáveis de estado
let currentPage = 1;
let currentPageSize = 12;
let currentFilter = null;
let currentSort = "popularity";
let currentSearchTerm = "";
let currentView = "grid";
let scrollPosition = 0;
let currentHackIndex = 0;
let isLoading = false;
let filteredHacks = [];
let shouldSearch = false;
let isTyping = false;

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

function scrollToHacksSection() {
  const headerHeight = document.querySelector("header").offsetHeight;
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

  // Aplica filtro selecionado (se houver)
  if (currentFilter) {
    results = results.filter((hack) => {
      switch (currentFilter) {
        case "trending":
          return hack.trending;
        case "recent":
          return hack.recent;
        case "featured":
          return hack.featured;
        case "gen1":
          return hack.generation === "gen1";
        case "gen2":
          return hack.generation === "gen2";
        case "gen3":
          return hack.generation === "gen3";
        case "gen4":
          return hack.generation === "gen4";
        case "complete":
          return hack.status === "Completo";
        case "new-region":
          return hack.features.some((f) => f.includes("Região"));
        case "difficulty":
          return hack.difficulty === "Difícil";
        case "megas":
          return hack.features.some((f) => f.includes("Mega"));
        case "z-moves":
          return hack.features.some((f) => f.includes("Z-Move"));
        case "dynamax":
          return hack.features.some((f) => f.includes("Dynamax"));
        case "all-gen":
          return hack.features.some((f) => f.includes("Todas Gerações"));
        default:
          return true;
      }
    });
  }

  // Ordena os resultados
  results.sort((a, b) => {
    switch (currentSort) {
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

    // Mantém a posição de rolagem na seção de hacks
    scrollToHacksSection();
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
  if (currentFilter) params.set("filter", currentFilter);
  params.set("page", currentPage);
  params.set("size", currentPageSize);
  params.set("sort", currentSort);
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

document.addEventListener("DOMContentLoaded", () => {
  // Carrega parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  currentFilter = urlParams.get("filter") || null;
  currentPage = parseInt(urlParams.get("page")) || 1;
  currentPageSize = parseInt(urlParams.get("size")) || DEFAULT_PAGE_SIZE;
  currentSort = urlParams.get("sort") || "popularity";
  currentView = urlParams.get("view") || "grid";
  currentSearchTerm = urlParams.get("search") || "";
  shouldSearch = !!currentSearchTerm;

  // Configura estado inicial
  hackSearchInput.value = currentSearchTerm;
  pageSizeSelect.value = currentPageSize;
  sortSelect.value = currentSort;
  clearButton.style.display = currentSearchTerm ? "block" : "none";

  // Ativa o filtro atual (se houver)
  document.querySelectorAll(".filter-btn, .quick-filter").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add("active");
    }
  });

  // Ativa a visualização atual
  viewButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.view === currentView) {
      btn.classList.add("active");
    }
  });

  // Mostra a visualização selecionada
  document
    .querySelectorAll(".hacks-grid, .hacks-list, .hacks-cards")
    .forEach((view) => {
      view.classList.remove("active");
    });
  document.getElementById(`${currentView}-view`).classList.add("active");

  // Renderiza os hacks
  renderHacks();

  // EVENT LISTENERS
  // Barra de pesquisa - comportamento original
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

  // Modifique estes event listeners para pesquisa:
  hackSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      isTyping = false;
      searchSuggestions.classList.remove("show");
      shouldSearch = true;
      currentPage = 1;
      showLoadingSkeleton(); // Mostra loading ao confirmar pesquisa
      renderHacks();
    }
  });

  searchButton.addEventListener("click", () => {
    isTyping = false;
    searchSuggestions.classList.remove("show");
    shouldSearch = true;
    currentPage = 1;
    showLoadingSkeleton(); // Mostra loading ao confirmar pesquisa
    renderHacks();
  });

  clearButton.addEventListener("click", () => {
    isTyping = false;
    hackSearchInput.value = "";
    currentSearchTerm = "";
    clearButton.style.display = "none";
    searchSuggestions.classList.remove("show");
    shouldSearch = false;
    currentPage = 1;
    showLoadingSkeleton(); // Mostra loading ao limpar pesquisa
    renderHacks();
  });

  // Filtros (com desativação)
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      if (currentFilter === filter) {
        currentFilter = null;
        btn.classList.remove("active");
      } else {
        currentFilter = filter;
        document.querySelectorAll(".filter-btn, .quick-filter").forEach((b) => {
          b.classList.remove("active");
        });
        btn.classList.add("active");
      }

      currentPage = 1;
      renderHacks();
    });
  });

  // EVENT LISTENERS
  // Barra de pesquisa
  hackSearchInput.addEventListener(
    "input",
    debounce((e) => {
      currentSearchTerm = e.target.value.trim();
      clearButton.style.display = currentSearchTerm ? "block" : "none";
      currentPage = 1;
      renderHacks();
    }, DEBOUNCE_DELAY)
  );

  hackSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      currentPage = 1;
      renderHacks();
    }
  });

  searchButton.addEventListener("click", () => {
    currentPage = 1;
    renderHacks();
  });

  clearButton.addEventListener("click", () => {
    hackSearchInput.value = "";
    currentSearchTerm = "";
    clearButton.style.display = "none";
    currentPage = 1;
    renderHacks();
  });

  // Filtros - agora podem ser desativados
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      // Se clicar no filtro ativo, desativa
      if (currentFilter === filter) {
        currentFilter = null;
        btn.classList.remove("active");
      } else {
        currentFilter = filter;
        // Remove active de todos os botões
        document.querySelectorAll(".filter-btn, .quick-filter").forEach((b) => {
          b.classList.remove("active");
        });
        // Ativa apenas o botão clicado
        btn.classList.add("active");
      }

      currentPage = 1;
      renderHacks();
    });
  });

  quickFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      if (currentFilter === filter) {
        currentFilter = null;
        btn.classList.remove("active");
      } else {
        currentFilter = filter;
        document.querySelectorAll(".filter-btn, .quick-filter").forEach((b) => {
          b.classList.remove("active");
        });
        btn.classList.add("active");
      }

      currentPage = 1;
      renderHacks();
    });
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

  // Ordenação
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    renderHacks();
  });

  // Tamanho da página
  pageSizeSelect.addEventListener("change", () => {
    currentPageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    renderHacks();
  });

  // Filtros avançados
  toggleFiltersBtn.addEventListener("click", () => {
    advancedFilters.classList.toggle("active");
    toggleFiltersBtn
      .querySelector("i:last-child")
      .classList.toggle("fa-chevron-up");
    toggleFiltersBtn
      .querySelector("i:last-child")
      .classList.toggle("fa-chevron-down");
  });

  // Resetar filtros
  resetFiltersBtn.addEventListener("click", () => {
    currentFilter = null;
    currentSearchTerm = "";
    currentSort = "popularity";
    currentPage = 1;
    hackSearchInput.value = "";
    clearButton.style.display = "none";
    sortSelect.value = "popularity";

    document.querySelectorAll(".filter-btn, .quick-filter").forEach((b) => {
      b.classList.remove("active");
    });

    renderHacks();
  });

  // Paginação
  prevPageBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Evita comportamento padrão
    if (prevPageBtn.disabled) return;
    currentPage--;
    renderHacks();
  });

  nextPageBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Evita comportamento padrão
    if (nextPageBtn.disabled) return;
    currentPage++;
    renderHacks();
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
    const urlParams = new URLSearchParams(window.location.search);
    currentFilter = urlParams.get("filter") || null;
    currentPage = parseInt(urlParams.get("page")) || 1;
    currentPageSize = parseInt(urlParams.get("size")) || DEFAULT_PAGE_SIZE;
    currentSort = urlParams.get("sort") || "popularity";
    currentView = urlParams.get("view") || "grid";
    currentSearchTerm = urlParams.get("search") || "";

    // Atualiza UI
    hackSearchInput.value = currentSearchTerm;
    pageSizeSelect.value = currentPageSize;
    sortSelect.value = currentSort;
    clearButton.style.display = currentSearchTerm ? "block" : "none";

    // Ativa filtro
    document.querySelectorAll(".filter-btn, .quick-filter").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.filter === currentFilter) {
        btn.classList.add("active");
      }
    });

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

    renderHacks();
  });
});
