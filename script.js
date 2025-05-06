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

  // Scroll para o topo da seção Hack Rooms
  setTimeout(() => {
    const hacksSection = document.getElementById("hacks");
    if (hacksSection) {
      window.scrollTo({
        top: hacksSection.offsetTop - 20,
        behavior: "smooth",
      });
    }
  }, 100);

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
