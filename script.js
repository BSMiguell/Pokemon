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

// Dados dos hacks (simulando um banco de dados)
const hacks = [
  {
    id: 1,
    title: "Pokémon Radical Red",
    creator: "Soupercell",
    creatorUrl: "#",
    image: "img/img-1.jpg",
    description:
      "Um hack desafiador baseado no FireRed com todos os Pokémon até a 8ª geração, mecânicas modernas e dificuldade aumentada.",
    generation: "gen3",
    features: [
      "DexNav",
      "Mega Evoluções",
      "Pokémon até Gen 8",
      "Novas mecânicas",
      "Dificuldade ajustável",
      "EV Training fácil",
      "Move Tutor",
    ],
    officialSite: "#",
    status: "Completo",
    version: "3.1",
    difficulty: "Difícil",
    region: "Kanto",
  },

  {
    id: 2,
    title: "Pokémon Unbound",
    creator: "Skeli",
    creatorUrl: "#",
    image: "img/img-2.jpg",
    description:
      "Explore a região de Borrius nesta aventura épica com uma história original, Pokémon até a 7ª geração e muitos recursos novos.",
    generation: "gen3",
    features: [
      "Região nova",
      "Mega Evoluções",
      "Pokémon até Gen 7",
      "História original",
      "Missões secundárias",
      "DexNav",
      "Sistema de Achievements",
    ],
    officialSite: "#",
    status: "Completo",
    version: "2.0",
    difficulty: "Médio",
    region: "Borrius",
  },

  {
    id: 3,
    title: "Pokémon Renegade Platinum",
    creator: "Drayano",
    creatorUrl: "#",
    image: "img/img-3.jpg",
    description:
      "Um hack do Platinum com todos os Pokémon disponíveis, dificuldade aumentada e muitas melhorias de qualidade de vida.",
    generation: "gen4",
    features: [
      "Todos Pokémon",
      "Dificuldade aumentada",
      "Melhorias QoL",
      "Time do Gym melhorado",
      "Move Tutor",
      "EV Training",
    ],
    officialSite: "#",
    status: "Completo",
    version: "1.3",
    difficulty: "Difícil",
    region: "Sinnoh",
  },

  {
    id: 4,
    title: "Pokémon Gaia",
    creator: "Spherical Ice",
    creatorUrl: "#",
    image: "img/img-4.jpg",
    description:
      "Uma aventura na região de Orbtus com mecânicas da 6ª geração, física 3D e uma história cativante.",
    generation: "gen3",
    features: [
      "Região nova",
      "Mecânicas Gen 6",
      "Física 3D",
      "História original",
      "Mega Evoluções",
    ],
    officialSite: "#",
    status: "Completo",
    version: "3.2",
    difficulty: "Médio",
    region: "Orbtus",
  },

  {
    id: 5,
    title: "Pokémon Quetzal",
    creator: "Diegoisawesome",
    creatorUrl: "#",
    image: "img/img-5.jpg",
    description:
      "Explore a região de Tiamat neste hack com gráficos melhorados, Pokémon até a 8ª geração e uma história original envolvente.",
    generation: "gen3",
    features: [
      "Região nova (Tiamat)",
      "Pokémon até Gen 8",
      "Mega Evoluções",
      "Gigantamax",
      "DexNav",
      "Grágicos melhorados",
    ],
    officialSite: "#",
    status: "Em desenvolvimento",
    version: " 0.8.2",
    difficulty: "Médio",
    region: "Tiamat",
  },

  {
    id: 6,
    title: "Pokémon Hyper Emerald",
    creator: "Hyper",
    creatorUrl: "#",
    image: "img/img-6.jpg",
    description:
      "Uma versão turbinada do Emerald com todos os Pokémon até a 8ª geração, desafios renovados e qualidade de vida melhorada.",
    generation: "gen3",
    features: [
      "Pokémon até Gen 8",
      "Mega Evoluções",
      "DexNav",
      "Dificuldade ajustável",
      "EV Training fácil",
      "Move Tutor",
    ],
    officialSite: "#",
    status: "desenvolvimento",
    version: "1.2",
    difficulty: "Difícil",
    region: "Hoenn",
  },

  {
    id: 7,
    title: "Pokémon The Last Fire Red",
    creator: "Team Rocket",
    creatorUrl: "#",
    image: "img/img-7.jpg",
    description:
      "Uma experiência sombria e madura no universo Pokémon, com uma história reimaginada e mecânicas de jogo inovadoras.",
    generation: "gen3",
    features: [
      "História reimaginada",
      "Tons maduros",
      "Sistema de moralidade",
      "Mega Evoluções",
      "Pokémon até Gen 7",
      "Missões secundárias",
    ],
    officialSite: "#",
    status: "Completo",
    version: "2.5",
    difficulty: "Médio",
    region: "Kanto",
  },

  {
    id: 8,
    title: "Pokémon Sword and Shield Ultimate Plus GBA",
    creator: "GameFreak",
    creatorUrl: "#",
    image: "img/img-8.jpg",
    description:
      "A experiência completa de Sword/Shield adaptada para GBA, com todas as áreas, Pokémon e mecânicas dos jogos originais.",
    generation: "gen3",
    features: [
      "Região de Galar completa",
      "Dynamax/Gigantamax",
      "Wild Area",
      "Pokémon até Gen 8",
      "Gráficos melhorados",
      "História original",
    ],
    officialSite: "#",
    status: "Completo",
    version: "2.1",
    difficulty: "Variável",
    region: "Galar",
  },

  {
    id: 9,
    title: "Pokémon Emerald Seaglass",
    creator: "Ekat",
    creatorUrl: "#",
    image: "img/img-9.jpg",
    description:
      "Uma experiência única no mundo de Hoenn com gráficos renovados, mecânicas modernas e uma paleta de cores suaves inspirada no mar.",
    generation: "gen3",
    features: [
      "Grágicos renovados",
      "Paleta de cores suaves",
      "Mecânicas modernas",
      "Pokémon até Gen 8",
      "DexNav",
      "Sistema de dia/noite",
    ],
    officialSite: "#",
    status: "Completo",
    version: "1.3",
    difficulty: "Médio",
    region: "Hoenn",
  },

  {
    id: 10,
    title: "Pokémon Elite Redux",
    creator: "Diegoisawesome",
    creatorUrl: "#",
    image: "img/img-10.jpg",
    description:
      "Um hack completo com todos os Pokémon até a 8ª geração, mega evoluções e sistema de batalha aprimorado.",
    generation: "gen3",
    features: [
      "Pokémon até Gen 8",
      "Mega Evoluções",
      "Sistema de batalha aprimorado",
      "Grágicos melhorados",
      "Dificuldade ajustável",
    ],
    officialSite: "#",
    status: "Completo",
    version: "1.5",
    difficulty: "Difícil",
    region: "Kanto",
  },

  {
    id: 11,
    title: "Pokémon Glazed",
    creator: "Redriders180",
    creatorUrl: "#",
    image: "img/img-11.jpg",
    description:
      "Aventure-se pelas regiões de Tunod, Rankor e Johto neste hack completo com história original e novos Pokémon.",
    generation: "gen3",
    features: [
      "Regiões novas",
      "História original",
      "Pokémon até Gen 6",
      "Mega Evoluções",
      "Sistema de dia/noite",
    ],
    officialSite: "#",
    status: "Completo",
    version: "8.6.3",
    difficulty: "Médio",
    region: "Tunod/Rankor/Johto",
  },

  {
    id: 12,
    title: "Pokémon Light Platinum",
    creator: "WesleyFG",
    creatorUrl: "#",
    image: "img/img-12.jpg",
    description:
      "Explore a região de Zhery neste hack clássico com história envolvente e desafios renovados.",
    generation: "gen3",
    features: [
      "Região nova",
      "Pokémon até Gen 4",
      "História original",
      "Ginásios desafiadores",
      "World Championship",
    ],
    officialSite: "#",
    status: "Completo",
    version: "1.3",
    difficulty: "Médio",
    region: "Zhery",
  },

  {
    id: 13,
    title: "Pokémon AshGray",
    creator: "Metapod23",
    creatorUrl: "#",
    image: "img/img-13.jpg",
    description:
      "Reviva a jornada de Ash Ketchum desde o início, seguindo fielmente a série animada de Pokémon.",
    generation: "gen3",
    features: [
      "Seguindo a série animada",
      "Eventos canônicos",
      "Pokémon originais",
      "Missões baseadas nos episódios",
    ],
    officialSite: "#",
    status: "Completo",
    version: "3.0",
    difficulty: "Fácil",
    region: "Kanto",
  },

  {
    id: 14,
    title: "Pokémon Fused Dimensions",
    creator: "ChaoticCherryCake",
    creatorUrl: "#",
    image: "img/img-14.jpg",
    description:
      "Um hack único com Pokémon fusionados e mecânicas inovadoras de combinação de espécies.",
    generation: "gen3",
    features: [
      "Sistema de fusão",
      "Pokémon únicos",
      "História original",
      "Mundo paralelo",
      "Combinações criativas",
    ],
    officialSite: "#",
    status: "Completo",
    version: "2.5",
    difficulty: "Variável",
    region: "Dimensão Fusionada",
  },

  {
    id: 15,
    title: "Pokémon Prism",
    creator: "Koolboyman",
    creatorUrl: "#",
    image: "img/img-15.jpg",
    description:
      "Explore a região de Naljo neste hack baseado no Crystal, com novos tipos Pokémon e mecânicas inovadoras.",
    generation: "gen2",
    features: [
      "Região nova (Naljo)",
      "Novos tipos Pokémon",
      "Baseado no Crystal",
      "Pokémon até Gen 4",
      "Sistema de mineração",
      "Músicas originais",
    ],
    officialSite: "#",
    status: "Completo",
    version: "1.2",
    difficulty: "Médio",
    region: "Naljo",
  },

  {
    id: 16,
    title: "Pokémon Glazed Golden",
    creator: "Redriders180",
    creatorUrl: "#",
    image: "img/img-16.jpg",
    description:
      "Versão aprimorada do Pokémon Glazed com novos conteúdos, desafios e melhorias de qualidade de vida.",
    generation: "gen3",
    features: [
      "Conteúdo adicional",
      "Melhorias de qualidade de vida",
      "Pokémon até Gen 7",
      "Mega Evoluções",
      "Regiões de Tunod, Rankor e Johto",
      "História expandida",
    ],
    officialSite: "#",
    status: "Completo",
    version: "1.3",
    difficulty: "Médio",
    region: "Tunod/Rankor/Johto",
  },
];

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

  // Ativa o botão "Todos" nos filtros
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

  // Sempre começa com "all" quando há termo de pesquisa
  const filter = searchTerm ? "all" : urlParams.get("filter") || "all";

  // Configura estado inicial
  document
    .querySelector(`.filter-btn[data-filter="${filter}"]`)
    ?.classList.add("active");
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
      // Limpa a pesquisa
      hackSearchInput.value = "";
      clearIcon.style.display = "none";
      searchIcon.style.display = "block";
      searchSuggestions.classList.remove("show");

      // Ativa o filtro clicado
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      renderHacks(btn.dataset.filter, 1, "");
    });
  });

  // Paginação
  prevPageBtn.addEventListener("click", () => {
    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    renderHacks(activeFilter, currentPage - 1, hackSearchInput.value.trim());
  });

  nextPageBtn.addEventListener("click", () => {
    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    renderHacks(activeFilter, currentPage + 1, hackSearchInput.value.trim());
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
    const filter = searchTerm ? "all" : urlParams.get("filter") || "all";

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
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
