const imagens = document.querySelectorAll(".foto")
imagens.forEach(img => {
    img.addEventListener("click", () =>{
        const info = img.nextElementSibling;
        info.classList.toggle("ativo");
 });
});
const intro = document.getElementById("intro");
const btnEntrar = document.getElementById("entrar");

const instrucoes = document.getElementById("instrucoes");
const btnGaleria = document.getElementById("btnGaleria");

/* 1️⃣ Sai da intro → mostra instruções */
btnEntrar.addEventListener("click", () => {
    intro.classList.add("sair");

    setTimeout(() => {
        intro.remove();
        instrucoes.classList.add("ativa");
    }, 150);
});

/* 2️⃣ Sai das instruções → galeria */
btnGaleria.addEventListener("click", () => {
    instrucoes.classList.remove("ativa");

    setTimeout(() => {
        instrucoes.remove();
    }, 600);
});
let audioAtual = null;
let elementoAtivo = null;

const elementosComAudio = document.querySelectorAll('[data-audio]');

elementosComAudio.forEach(el => {
    el.addEventListener("click", () => {
        const audioSrc = el.dataset.audio;

        // Se clicar no mesmo elemento
        if (el === elementoAtivo) {
            pararTudo();
            return;
        }

        // Se clicar em outro
        pararTudo();

        el.classList.add("ativo");
        elementoAtivo = el;

        audioAtual = new Audio(audioSrc);
        audioAtual.play();
    });
});

function pararTudo() {
    if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
        audioAtual = null;
    }

    if (elementoAtivo) {
        elementoAtivo.classList.remove("ativo");
        elementoAtivo = null;
    }
}
