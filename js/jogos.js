document.addEventListener("DOMContentLoaded", function () {

  // ─── VLibras ──────────────────────────────────────────────────
  if (window.VLibras) {
    new window.VLibras.Widget("https://vlibras.gov.br/app");
  }

  // ─── Narração por voz ─────────────────────────────────────────
  const vozSuportada = "speechSynthesis" in window;

  const legendaBox   = document.querySelector(".legenda-box");
  const textoLegenda = document.getElementById("texto-legenda");

  // Estado das configurações de acessibilidade
  const config = {
    voz:     true,
    legenda: true,
    vel:     1,
  };

  // ─── Função Fila / Ler Texto ─────────────────────────────────────────

  let fila = [];
  let falando = false;

  function processarFila() {
    if (falando || fila.length === 0) return;

    falando = true;
    const { texto } = fila.shift();

    const mensagem = new SpeechSynthesisUtterance(texto);
    mensagem.lang = "pt-BR";
    mensagem.rate = config.vel;

    if (config.legenda && legendaBox && textoLegenda) {
      textoLegenda.innerText = texto;
      legendaBox.classList.add("ativa");
    }

    mensagem.onend = function () {
      if (legendaBox) legendaBox.classList.remove("ativa");
      falando = false;
      processarFila();
    };

    mensagem.onerror = function () {
      if (legendaBox) legendaBox.classList.remove("ativa");
      falando = false;
      processarFila();
    };

    window.speechSynthesis.speak(mensagem);
  }

  function falarTexto(e) {
    if (!vozSuportada || !config.voz) return;

    const texto = e.currentTarget.innerText.trim();
    if (!texto) return;

    fila.push({ texto });
    processarFila();
  }

  // ─── Passarinho do header ──────────────────────────────────────
  const passarinho = document.getElementById("passarinho");
  const linksNav   = document.querySelectorAll(".nav-list a");
  const navList    = document.querySelector(".nav-list");
  let timeoutSumir = null;
 
  function moverPassarinho(link) {
    if (document.body.classList.contains("sem-animacoes")) return;
    const rect    = link.getBoundingClientRect();
    const navRect = document.querySelector(".nav").getBoundingClientRect();
    const esquerda = rect.left - navRect.left + rect.width / 2 - 30;
 
    clearTimeout(timeoutSumir);
 
    if (passarinho.classList.contains("visivel")) {
      passarinho.classList.add("pousando");
      setTimeout(() => passarinho.classList.remove("pousando"), 300);
    }
 
    passarinho.style.left = esquerda + "px";
    passarinho.classList.add("visivel");
  }
 
  function esconderPassarinho() {
    timeoutSumir = setTimeout(() => {
      passarinho.classList.remove("visivel");
    }, 400);
  }
 
  // mouseenter em cada link move o passarinho
  linksNav.forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      clearTimeout(timeoutSumir); // cancela qualquer sumiço pendente
      moverPassarinho(this);
    });
  });
 
  // só o nav-list controla o sumiço — evita bug entre links
  navList.addEventListener("mouseleave", esconderPassarinho);
  navList.addEventListener("mouseenter", function () {
    clearTimeout(timeoutSumir);
  });
 
  document.querySelector(".nav-list").addEventListener("mouseleave", esconderPassarinho);

  // Leitura ao passar o mouse (menu)
  document.querySelectorAll(".narra-texto").forEach(function (el) {
    el.addEventListener("mouseenter", falarTexto);
  });

  // Leitura ao clicar
  document.querySelectorAll(".leitura").forEach(function (el) {
    el.addEventListener("click", falarTexto);
  });

  // ─── Cursor personalizado ──────────────────────────────────────
  // Usa left/top (igual ao original) — transform causava desalinhamento
  const cursor = document.getElementById("cursor-personalizado");

  if (cursor) {
    document.addEventListener("mousemove", function (e) {
      cursor.style.left = (e.clientX - 40) + "px";
      cursor.style.top  = (e.clientY - 40) + "px";
    });
  }

  // ─── Gradiente do header conforme scroll ───────────────────────
  const layers = [
    { el: document.getElementById("azul"),   threshold: 0    },
    { el: document.getElementById("verde"),  threshold: 750  },
    { el: document.getElementById("marrom"), threshold: 1850 },   
  ];

  // Thresholds dinâmicos — recalcula se o layout mudar
  function recalcularThresholds() {
    const alturaDoc = document.documentElement.scrollHeight;
    if (alturaDoc > 1000) {
      layers[1].threshold = alturaDoc * 0.20;
      layers[2].threshold = alturaDoc * 0.50;
    }
  }

  recalcularThresholds();
  window.addEventListener("resize", recalcularThresholds);

  // Scroll com requestAnimationFrame para não travar a página
  let rafAgendado = false;

  function atualizarGradiente() {
    const y = window.scrollY;
    let ativa = 0;

    layers.forEach(function (layer, i) {
      if (y >= layer.threshold) ativa = i;
    });

    layers.forEach(function (layer, i) {
      layer.el.style.opacity = i === ativa ? "1" : "0";
    });

    rafAgendado = false;
  }

  window.addEventListener("scroll", function () {
    if (!rafAgendado) {
      rafAgendado = true;
      requestAnimationFrame(atualizarGradiente);
    }
  }, { passive: true });

  // ─── Carrossel ──────────────────────────────────────

  /* ─────────────────────────────────────────────
     Dados dos carrosséis
     Adicione quantos objetos quiser neste array.
     Cada objeto precisa de: title e items[].
  ───────────────────────────────────────────── */
  const CAROUSELS = [
    {
      title: "Jogos",
      items: [
        { title: "Aventura",  image: "imgs/logo.png" },
        { title: "RPG fantasia",  image: "https://picsum.photos/seed/game2/600/400" },
        { title: "Corrida futurista", image: "https://picsum.photos/seed/game3/600/400" },
        { title: "Batalha espacial",  image: "https://picsum.photos/seed/game4/600/400" },
      ],
    },
    {
      title: "Filmes",
      items: [
        { title: "Drama intenso",      image: "https://picsum.photos/seed/movie1/600/400" },
        { title: "Comédia leve",       image: "https://picsum.photos/seed/movie2/600/400" },
        { title: "Ficção científica",  image: "https://picsum.photos/seed/movie3/600/400" },
      ],
    },
    {
      title: "Músicas",
      items: [
        { title: "Pop nacional",       image: "https://picsum.photos/seed/music1/600/400" },
        { title: "Jazz clássico",      image: "https://picsum.photos/seed/music2/600/400" },
        { title: "Rock alternativo",   image: "https://picsum.photos/seed/music3/600/400" },
        { title: "Eletrônico",         image: "https://picsum.photos/seed/music4/600/400" },
        { title: "Sertanejo",          image: "https://picsum.photos/seed/music5/600/400" },
      ],
    },
  ];
 
  /* ─────────────────────────────────────────────
     Cria e monta um carrossel no container dado
  ───────────────────────────────────────────── */
  function createCarousel({ title, items }, container) {
    let current = 0;
 
    // Estrutura HTML
    const wrapper = document.createElement("div");
    wrapper.className = "carousel";
 
    const h2 = document.createElement("h2");
    h2.className = "carousel-title";
    h2.textContent = title;
 
    const row = document.createElement("div");
    row.className = "carousel-row";
 
    const btnPrev = makeButton("Anterior", `<path d="M15 18l-6-6 6-6"/>`);
    const track   = document.createElement("div");
    track.className = "carousel-track";
    const btnNext = makeButton("Próximo",  `<path d="M9 18l6-6-6-6"/>`);
 
    const dotsEl = document.createElement("div");
    dotsEl.className = "carousel-dots";
 
    row.append(btnPrev, track, btnNext);
    wrapper.append(h2, row, dotsEl);
    container.appendChild(wrapper);
 
    // Cria cards e dots
    items.forEach((item, i) => {
      // Card
      const card = document.createElement("div");
      card.className = "carousel-card";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" draggable="false" />
        <div class="overlay"></div>
        <div class="card-title">${item.title}</div>
      `;
      track.appendChild(card);
 
      // Dot
      const dot = document.createElement("div");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dotsEl.appendChild(dot);
    });
 
    const cards = track.querySelectorAll(".carousel-card");
    const dots  = dotsEl.querySelectorAll(".dot");
 
    // Posiciona os cards via translateX
    function goTo(index) {
      current = (index + items.length) % items.length;
      cards.forEach((card, i) => {
        card.style.transform = `translateX(${(i - current) * 100}%)`;
      });
      dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
      btnPrev.disabled = false;
      btnNext.disabled = false;
    }
 
    btnPrev.addEventListener("click", () => goTo(current - 1));
    btnNext.addEventListener("click", () => goTo(current + 1));
 
    // Estado inicial
    goTo(0);
  }
 
  /* ─────────────────────────────────────────────
     Utilitário: cria botão com ícone de seta
  ───────────────────────────────────────────── */
  function makeButton(label, pathD) {
    const btn = document.createElement("button");
    btn.className = "carousel-btn";
    btn.setAttribute("aria-label", label);
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      ${pathD}
    </svg>`;
    return btn;
  }
 
  /* ─────────────────────────────────────────────
     Monta todos os carrosséis
  ───────────────────────────────────────────── */
  const app = document.getElementById("app");
  CAROUSELS.forEach((data) => createCarousel(data, app));


  // ══════════════════════════════════════════════════════════════
  // ─── PAINEL DE ACESSIBILIDADE ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  const btnAbrir  = document.getElementById("btnAcessibilidade");
  const btnFechar = document.getElementById("btnFechar");
  const sidebar   = document.getElementById("sidebarAcessibilidade");
  const overlay   = document.getElementById("sbOverlay");

  function abrirSidebar() {
    sidebar.classList.add("aberta");
    sidebar.setAttribute("aria-hidden", "false");
    sidebar.inert = false;
    overlay.classList.add("ativo");
    btnFechar.focus();
  }

  function fecharSidebar() {
    sidebar.classList.remove("aberta");
    sidebar.setAttribute("aria-hidden", "true");
    sidebar.inert = true;
    overlay.classList.remove("ativo");
    btnAbrir.focus();
  }

  btnAbrir.addEventListener("click", abrirSidebar);
  btnFechar.addEventListener("click", fecharSidebar);
  overlay.addEventListener("click", fecharSidebar);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("aberta")) {
      fecharSidebar();
    }
  });

  // ─── Toggle: Narração por voz ──────────────────────────────────
  document.getElementById("togVoz").addEventListener("change", function () {
    config.voz = this.checked;
    if (!this.checked) {
      window.speechSynthesis.cancel();
      fila = [];
      falando = false;
      if (legendaBox) legendaBox.classList.remove("ativa");
    }
    document.getElementById("rowVelocidade").style.opacity = this.checked ? "1" : "0.4";
    document.getElementById("rowVelocidade").style.pointerEvents = this.checked ? "all" : "none";
  });

  // ─── Toggle: Legendas ─────────────────────────────────────────
  document.getElementById("togLegenda").addEventListener("change", function () {
    config.legenda = this.checked;
    if (!this.checked && legendaBox) legendaBox.classList.remove("ativa");
  });

  // ─── Botões: Velocidade da narração ───────────────────────────
  document.querySelectorAll("[data-vel]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-vel]").forEach(b => b.classList.remove("ativo"));
      this.classList.add("ativo");
      config.vel = parseFloat(this.dataset.vel);
    });
  });

  // ─── Toggle: Animações ────────────────────────────────────────
  document.getElementById("togAnim").addEventListener("change", function () {
    document.body.classList.toggle("sem-animacoes", !this.checked);
    if (!this.checked) passarinho.classList.remove("visivel");
  });

  // ─── Toggle: Alto contraste ───────────────────────────────────
  document.getElementById("togContraste").addEventListener("change", function () {
    document.body.classList.toggle("alto-contraste", this.checked);
  });

  // ─── Botões: Tamanho da fonte ─────────────────────────────────
  document.querySelectorAll("[data-fonte]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-fonte]").forEach(b => b.classList.remove("ativo"));
      this.classList.add("ativo");
      document.body.classList.remove("fonte-pequena", "fonte-normal", "fonte-grande");
      document.body.classList.add("fonte-" + this.dataset.fonte);
    });
  });

  const selTipoFonte = document.getElementById("selTipoFonte");
  if (selTipoFonte) {
    selTipoFonte.addEventListener("change", function () {
      document.body.classList.remove("fonte-dislexia", "fonte-discalculia");
      if (this.value !== "padrao") {
        document.body.classList.add("fonte-" + this.value);
      }
    });
  }

  // ─── Toggle: Cursor personalizado ─────────────────────────────
  document.getElementById("togCursor").addEventListener("change", function () {
    document.body.classList.toggle("cursor-padrao", !this.checked);
  });

  // ─── Música de fundo ─────────────────────
  //
  // Nunca toca sozinha (nada de autoplay): só inicia quando a pessoa
  // clica no botão do header ou liga o toggle "Música de fundo" no
  // painel — os dois controles refletem e controlam o mesmo estado,
  // ficando sempre sincronizados entre si.
  const musicaFundo = document.getElementById("musicaFundo");
  const btnMusica = document.getElementById("btnMusica");
  const togMusica = document.getElementById("togMusica");

  if (musicaFundo && btnMusica && togMusica) {
    musicaFundo.volume = 0.35;

    function tocarMusica() {
      // .play() retorna uma Promise que pode rejeitar (ex: arquivo
      // musica-fundo.mp3 ainda não foi adicionado nesta página, ou o
      // navegador bloqueou por algum motivo). Isso não deve quebrar o
      // resto do site — apenas a música não começa.
      musicaFundo.play().then(() => {
        btnMusica.classList.add("tocando");
        btnMusica.setAttribute("aria-pressed", "true");
        btnMusica.setAttribute("aria-label", "Pausar música de fundo");
        togMusica.checked = true;
      }).catch(() => {
        pausarMusica();
      });
    }

    function pausarMusica() {
      musicaFundo.pause();
      btnMusica.classList.remove("tocando");
      btnMusica.setAttribute("aria-pressed", "false");
      btnMusica.setAttribute("aria-label", "Tocar música de fundo");
      togMusica.checked = false;
    }

    btnMusica.addEventListener("click", () => {
      if (btnMusica.classList.contains("tocando")) {
        pausarMusica();
      } else {
        tocarMusica();
      }
    });

    togMusica.addEventListener("change", function () {
      if (this.checked) {
        tocarMusica();
      } else {
        pausarMusica();
      }
    });
  }
})