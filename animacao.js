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

let audioAtual = new Audio();
audioAtual.preload = "auto";
audioAtual.volume = 1;

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

        // APENAS TROCA O SRC E DÁ PLAY
        audioAtual.src = audioSrc;
        audioAtual.currentTime = 0;

        audioAtual.play().catch(() => {
            console.log("Áudio bloqueado pelo navegador mobile");
        });
        
        // NOVO: Rastrear clique na foto
        registrarCliqueFoto(el);
    });
});

function pararTudo() {
    if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
    }

    if (elementoAtivo) {
        elementoAtivo.classList.remove("ativo");
        elementoAtivo = null;
    }
}

// ==========================================
// NOVO: SISTEMA DE RASTREAMENTO
// ==========================================

// Registrar acesso com data e hora
function registrarAcesso() {
    const agora = new Date();
    const dataHora = {
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR'),
        timestamp: agora.getTime(),
        diaSemana: agora.toLocaleDateString('pt-BR', { weekday: 'long' }),
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        plataforma: navigator.platform
    };
    
    // Salvar no localStorage
    let historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    historico.push(dataHora);
    localStorage.setItem('carlos_acessos', JSON.stringify(historico));
    
    // Mostrar no console
    console.log('🎉 NOVO ACESSO NA GALERIA DO CARLOS!');
    console.log('📅 Data:', dataHora.data);
    console.log('🕐 Hora:', dataHora.hora);
    console.log('💻 Dispositivo:', dataHora.plataforma);
    
    return dataHora;
}

// Registrar clique em foto
function registrarCliqueFoto(elemento) {
    const titulo = elemento.querySelector('h2')?.textContent || 'Foto sem título';
    const agora = new Date();
    
    let cliques = JSON.parse(localStorage.getItem('carlos_cliques') || '{}');
    if (!cliques[titulo]) {
        cliques[titulo] = { count: 0, ultimoClique: null };
    }
    cliques[titulo].count++;
    cliques[titulo].ultimoClique = agora.toLocaleString('pt-BR');
    
    localStorage.setItem('carlos_cliques', JSON.stringify(cliques));
}

// Atualizar painel admin com dados
function atualizarPainelAdmin() {
    const acessoAtual = document.getElementById('acessoAtual');
    const historicoDiv = document.getElementById('historicoVisitas');
    const totalVisitas = document.getElementById('totalVisitas');
    const statsFotos = document.getElementById('statsFotos');
    
    // Acesso atual
    const agora = new Date();
    acessoAtual.innerHTML = `
        <strong>Data:</strong> ${agora.toLocaleDateString('pt-BR')}<br>
        <strong>Hora:</strong> ${agora.toLocaleTimeString('pt-BR')}<br>
        <strong>Dia:</strong> ${agora.toLocaleDateString('pt-BR', { weekday: 'long' })}<br>
        <strong>Dispositivo:</strong> ${navigator.platform}<br>
        <strong>Navegador:</strong> ${navigator.userAgent.split(' ').pop()}
    `;
    
    // Histórico
    const historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    totalVisitas.textContent = historico.length;
    
    if (historico.length === 0) {
        historicoDiv.innerHTML = '<p style="color:#888;">Nenhum acesso registrado ainda...</p>';
    } else {
        historicoDiv.innerHTML = historico.slice().reverse().map((visita, index) => `
            <div style="border-bottom:1px solid #333; padding:10px 0; ${index === 0 ? 'background:rgba(0,240,255,0.1);' : ''}">
                <strong style="color:${index === 0 ? '#00f0ff' : 'white'}">
                    ${index === 0 ? '🆕 ' : ''}${visita.data} às ${visita.hora}
                </strong><br>
                <small style="color:#888;">${visita.diaSemana} | ${visita.plataforma}</small>
            </div>
        `).join('');
    }
    
    // Stats de fotos
    const cliques = JSON.parse(localStorage.getItem('carlos_cliques') || '{}');
    const fotosOrdenadas = Object.entries(cliques).sort((a, b) => b[1].count - a[1].count);
    
    if (fotosOrdenadas.length === 0) {
        statsFotos.innerHTML = '<p style="color:#888;">Nenhum clique registrado...</p>';
    } else {
        statsFotos.innerHTML = fotosOrdenadas.map(([titulo, dados], index) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #333;">
                <span style="flex:1; margin-right:10px;">${index + 1}. ${titulo}</span>
                <span style="color:#00f0ff; font-weight:bold; white-space:nowrap;">${dados.count} cliques</span>
            </div>
        `).join('');
    }
}

// Abrir painel admin (PC)
let teclaCCount = 0;
let ultimoTempoC = 0;

document.addEventListener('keydown', (e) => {
    const agora = Date.now();
    
    // Detectar 'C' pressionado 3x rápido (dentro de 1.5 segundos)
    if (e.key === 'c' || e.key === 'C') {
        if (agora - ultimoTempoC < 1500) {
            teclaCCount++;
        } else {
            teclaCCount = 1;
        }
        ultimoTempoC = agora;
        
        if (teclaCCount >= 3) {
            abrirAdmin();
            teclaCCount = 0;
        }
    }
    
    // Alternativa: Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        abrirAdmin();
    }
    
    // Fechar com ESC
    if (e.key === 'Escape') {
        fecharAdmin();
    }
});

// Abrir painel admin
function abrirAdmin() {
    const panel = document.getElementById('adminPanel');
    panel.style.display = 'block';
    atualizarPainelAdmin();
    console.log('🔓 PAINEL ADMIN ABERTO');
}

// Fechar painel admin
function fecharAdmin() {
    document.getElementById('adminPanel').style.display = 'none';
}

// Limpar todos os dados
function limparDados() {
    if (confirm('Tem certeza que quer apagar TODO o histórico?')) {
        localStorage.removeItem('carlos_acessos');
        localStorage.removeItem('carlos_cliques');
        atualizarPainelAdmin();
        alert('Dados apagados com sucesso!');
    }
}

// Exportar dados (backup)
function exportarDados() {
    const dados = {
        acessos: JSON.parse(localStorage.getItem('carlos_acessos') || '[]'),
        cliques: JSON.parse(localStorage.getItem('carlos_cliques') || '{}'),
        exportadoEm: new Date().toLocaleString('pt-BR')
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_galeria_carlos_${Date.now()}.json`;
    a.click();
    
    console.log('💾 Dados exportados!');
}

// Mobile: toque 5x no canto inferior direito
let toquesMobile = 0;
let ultimoToqueTempo = 0;

function ativarMobileAdmin() {
    const agora = Date.now();
    
    if (agora - ultimoToqueTempo < 1000) {
        toquesMobile++;
    } else {
        toquesMobile = 1;
    }
    ultimoToqueTempo = agora;
    
    if (toquesMobile >= 5) {
        abrirAdmin();
        toquesMobile = 0;
        // Feedback tátil se disponível
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
}

// Iniciar quando página carregar
window.addEventListener('load', () => {
    registrarAcesso();
});
