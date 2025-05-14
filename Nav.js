document.addEventListener("DOMContentLoaded", function () {
  // Elementos do DOM
  const header = document.getElementById("header");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mainNav = document.getElementById("main-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const logo = document.getElementById("logo");
  const particles = document.getElementById("particles");

  // ==================== ANIMAÇÕES ====================

  // Efeito de scroll no header
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Animação no logo
  if (logo) {
    logo.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05)";
      this.style.transition = "transform 0.3s ease";
    });

    logo.addEventListener("mouseleave", function () {
      this.style.transform = "";
    });
  }

  // Efeito de partículas
  if (particles) {
    createParticles();
  }

  function createParticles() {
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Configurações aleatórias para cada partícula
      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 10;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.backgroundColor =
        i % 2 === 0 ? "rgba(0, 188, 212, 0.5)" : "rgba(255, 62, 78, 0.5)";

      particles.appendChild(particle);
    }

    // keyframes dinamicamente
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0% {
          transform: translateY(0) translateX(0);
          opacity: 1;
        }
        50% {
          transform: translateY(-50px) translateX(20px);
          opacity: 0.7;
        }
        100% {
          transform: translateY(0) translateX(0);
          opacity: 1;
        }
      }
      
      .particle {
        position: absolute;
        border-radius: 50%;
        animation: float infinite ease-in-out;
        pointer-events: none;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== NAVEGAÇÃO ====================

  // Menu mobile
  mobileMenuBtn.addEventListener("click", function () {
    this.classList.toggle("active");
    mainNav.classList.toggle("active");
    document.body.style.overflow = mainNav.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Navegação suave
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href");

      // Fecha o menu mobile se estiver aberto
      if (mainNav.classList.contains("active")) {
        mobileMenuBtn.classList.remove("active");
        mainNav.classList.remove("active");
        document.body.style.overflow = "";
      }

      // Animação de scroll suave
      document.querySelector(target).scrollIntoView({
        behavior: "smooth",
      });

      // Atualiza a URL
      history.pushState(null, null, target);

      // Ativa o link clicado
      navLinks.forEach((navLink) => navLink.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // ==================== INICIALIZAÇÃO ====================

  // Animação de carregamento
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 100);
});
