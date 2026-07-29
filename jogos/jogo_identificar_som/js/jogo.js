// URLs reais do acervo Unsplash/Wikimedia para ilustrar de forma lúdica
const bancoDeRodadas = [
    {
        tema: "ANIMAIS",
        opcoes: [
            { nome: "Gatinho", som: "sons/gato.mp3", img: "imgs/gato.png" },
            { nome: "Cachorrinho", som: "sons/cachorro.mp3", img: "https://unsplash.com" },
            { nome: "Leãozinho", som: "sons/leao.mp3", img: "https://unsplash.com" }
        ]
    },
    {
        tema: "TRANSPORTES",
        opcoes: [
            { nome: "Carro", som: "sons/carro.mp3", img: "https://unsplash.com" },
            { nome: "Avião", som: "sons/aviao.mp3", img: "https://unsplash.com" },
            { nome: "Trem", som: "sons/trem.mp3", img: "https://unsplash.com" }
        ]
    },
    {
        tema: "INSTRUMENTOS",
        opcoes: [
            { nome: "Tambor", som: "sons/tambor.wav", img: "https://unsplash.com" },
            { nome: "Piano", som: "sons/piano.wav", img: "https://unsplash.com" },
            { nome: "Flauta", som: "sons/flauta.wav", img: "https://unsplash.com" }
        ]
    },
    {
        tema: "NATUREZA",
        opcoes: [
            { nome: "Chuva", som: "https://google.com", img: "https://unsplash.com" },
            { nome: "Vento", som: "https://google.com", img: "https://unsplash.com" },
            { nome: "Mar", som: "https://google.com", img: "https://unsplash.com" }
        ]
    },
    {
        tema: "COISAS DE CASA",
        opcoes: [
            { nome: "Telefone", som: "https://google.com", img: "https://unsplash.com" },
            { nome: "Despertador", som: "https://google.com", img: "https://unsplash.com" },
            { nome: "Campainha", som: "https://google.com", img: "https://unsplash.com" }
        ]
    }
];

const somAcerto = new Audio("sons/correto.mp3");
const somErro = new Audio("sons/errado.mp3");
const somFanfarra = new Audio("sons/parabens.mp3");

let escolhasDaRodadaAtual = [];
let itemCorretoIndex;
let audioAtual = null;
let rodadaAtual = 1;
const MAX_RODADAS = 5;

// Elementos de tela
const btnStart = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");
const btnOuvir = document.getElementById("btn-ouvir");
const txtInstrucao = document.getElementById("instrucao");
const hudRodada = document.getElementById("hud-rodada");
const hudTema = document.getElementById("hud-tema");
const msgFinal = document.getElementById("mensagem-final");
const botoesOpcao = document.querySelectorAll(".card-opcao");

// Usa a mesma config de voz/velocidade do painel de acessibilidade do
// header quando disponível, para não conflitar com a escolha do usuário.
function falar(texto, aoTerminar) {
    const cfg = window.acessibilidadeConfig;
    if (cfg && cfg.voz === false) {
        txtInstrucao.textContent = texto;
        if (typeof aoTerminar === "function") aoTerminar();
        return;
    }

    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = (cfg && cfg.vel) ? cfg.vel : 1.1;

    if (typeof aoTerminar === "function") {
        fala.onend = aoTerminar;
        fala.onerror = aoTerminar;
    }

    window.speechSynthesis.speak(fala);
    txtInstrucao.textContent = texto;
}

// Ativa motor de vibração físico se o aparelho permitir
function vibrarDispositivo(padrao) {
    if ("vibrate" in navigator) {
        navigator.vibrate(padrao);
    }
}

// Inicia o Jogo (Botão Start)
btnStart.addEventListener("click", () => {
    document.getElementById("tela-inicio").classList.add("escondido");
    document.getElementById("tela-jogo").classList.remove("escondido");
    rodadaAtual = 1;
    vibrarDispositivo(100); // Vibração curta de confirmação
    iniciarRodada();
});

function iniciarRodada() {
    const dadosRodada = bancoDeRodadas[rodadaAtual - 1];
    escolhasDaRodadaAtual = dadosRodada.opcoes;

    // Atualiza HUD superior do console
    hudRodada.textContent = `FASE: ${rodadaAtual}/5`;
    hudTema.textContent = `TEMA: ${dadosRodada.tema}`;

    itemCorretoIndex = Math.floor(Math.random() * escolhasDaRodadaAtual.length);
    audioAtual = new Audio(escolhasDaRodadaAtual[itemCorretoIndex].som);

    // Alimenta botões com Imagens e Acessibilidade
    botoesOpcao.forEach((botao, index) => {
        const item = escolhasDaRodadaAtual[index];
        const imgTag = botao.querySelector(".img-opcao");
        const labelTag = botao.querySelector(".label-opcao");

        imgTag.src = item.img;
        imgTag.alt = `Desenho de um ${item.nome}`;
        labelTag.textContent = item.nome;

        botao.setAttribute("aria-label", `Opção ${index + 1}: ${item.nome}. Pressione a tecla ${index + 1} para escolher.`);
    });

    falar(`Fase ${rodadaAtual}. O tema é ${dadosRodada.tema}. Ouça o som com atenção e me diga qual é!`);

    setTimeout(tocarSomAtual, 5000);
}

function tocarSomAtual() {
    if (audioAtual && rodadaAtual <= MAX_RODADAS) {
        audioAtual.play().catch(() => {});
    }
}

function verificarEscolha(indexEscolhido) {
    if (rodadaAtual > MAX_RODADAS) return;

    if (indexEscolhido === itemCorretoIndex) {
        // CORRETO: Vibração alegre curta e avança
        vibrarDispositivo([80, 50, 80]);
        somAcerto.play();

        rodadaAtual++;
        setTimeout(() => {
            if (rodadaAtual <= MAX_RODADAS) {
                iniciarRodada();
            } else {
                finalizarJogo();
            }
        }, 1200);
    } else {
        // ERRADO: Vibração de erro (longa/dupla) e NÃO avança a fase!
        vibrarDispositivo([300, 100, 300]);
        somErro.play();

        // Fix: a narração e o som eram disparados juntos e se atropelavam.
        // Agora o som só toca depois que a fala termina de ser narrada.
        setTimeout(() => {
            falar("Ops, esse não era o som correto! Tente novamente com outro botão. Vamos ouvir de novo!", tocarSomAtual);
        }, 1200);
    }
}

function finalizarJogo() {
    document.getElementById("tela-jogo").classList.add("escondido");
    document.getElementById("tela-final").classList.remove("escondido");
    somFanfarra.play();
    vibrarDispositivo([200, 100, 200, 100, 500]); // Ritmo de vitória

    const msgVoz = "🎉 Incrível! Você completou todas as fases com sucesso e dominou o videogame! Você tem ouvidos mágicos de super-herói! Parabéns! Pressione a barra de espaço para recomeçar.";
    msgFinal.textContent = "Você completou o desafio das 5 fases perfeitamente! ⭐";

    setTimeout(() => falar(msgVoz), 500);
}

// Reiniciar Tudo
btnRestart.addEventListener("click", () => {
    document.getElementById("tela-final").classList.add("escondido");
    document.getElementById("tela-jogo").classList.remove("escondido");
    rodadaAtual = 1;
    iniciarRodada();
});

// Eventos de Voz e Interação
botoesOpcao.forEach((botao, index) => {
    botao.addEventListener("mouseenter", () => { if(rodadaAtual <= MAX_RODADAS) falar(`Botão ${index + 1}: ${escolhasDaRodadaAtual[index].nome}`); });
    botao.addEventListener("focus", () => { if(rodadaAtual <= MAX_RODADAS) falar(`Botão ${index + 1}: ${escolhasDaRodadaAtual[index].nome}`); });
    botao.addEventListener("click", () => verificarEscolha(index));
});

btnOuvir.addEventListener("click", tocarSomAtual);

// Controles Físicos do Teclado (Estilo Emulator)
window.addEventListener("keydown", (evento) => {
    if (evento.code === "Space") {
        evento.preventDefault();
        if (rodadaAtual > MAX_RODADAS) {
            btnRestart.click();
        } else if(document.getElementById("tela-inicio").classList.contains("escondido")) {
            tocarSomAtual();
        } else {
            btnStart.click();
        }
    }
    if (rodadaAtual <= MAX_RODADAS && !document.getElementById("tela-jogo").classList.contains("escondido")) {
        if (evento.key === "1") verificarEscolha(0);
        if (evento.key === "2") verificarEscolha(1);
        if (evento.key === "3") verificarEscolha(2);
    }
});
