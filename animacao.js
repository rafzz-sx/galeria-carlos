console.log('🎵 Galeria do Carlos carregada!');

// ==========================================
// PARTE 1: GALERIA ORIGINAL (FUNCIONANDO)
// ==========================================

const imagens = document.querySelectorAll(".foto");
imagens.forEach(img => {
    img.addEventListener("click", () => {
        const info = img.nextElementSibling;
        info.classList.toggle("ativo");
    });
});

const intro = document.getElementById("intro");
const btnEntrar = document.getElementById("entrar");
const instrucoes = document.getElementById("instrucoes");
const btnGaleria = document.getElementById("btnGaleria");

// Transição intro -> instruções
btnEntrar.addEventListener("click", () => {
    intro.classList.add("sair");
    setTimeout(() => {
        intro.remove();
        instrucoes.classList.add("ativa");
    }, 150);
});

// Transição instruções -> galeria
btnGaleria.addEventListener("click", () => {
    instrucoes.classList.remove("ativa");
    setTimeout(() => {
        instrucoes.remove();
    }, 600);
});

// Sistema de áudio
let audioAtual = new Audio();
audioAtual.preload = "auto";
audioAtual.volume = 1;
let elementoAtivo = null;

const elementosComAudio = document.querySelectorAll('[data-audio]');

elementosComAudio.forEach(el => {
    el.addEventListener("click", (e) => {
        // Evita duplo disparo se clicar na imagem e no article
        e.stopPropagation();
        
        const audioSrc = el.dataset.audio;
        console.log('🎵 Tentando tocar:', audioSrc);

        // Se clicar no mesmo elemento, para
        if (el === elementoAtivo) {
            pararTudo();
            return;
        }

        // Para qualquer outro ativo
        pararTudo();

        // Ativa novo
        el.classList.add("ativo");
        elementoAtivo = el;

        // Toca áudio
        audioAtual.src = audioSrc;
        audioAtual.currentTime = 0;
        
        audioAtual.play().then(() => {
            console.log('✅ Tocando:', audioSrc);
        }).catch((err) => {
            console.error('❌ Erro ao tocar:', audioSrc, err);
            alert('Erro ao carregar áudio: ' + audioSrc + '\nVerifique se o arquivo existe na pasta audio/');
        });

        // Registra clique
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
// PARTE 2: RASTREAMENTO (NOVO)
// ==========================================

function registrarAcesso() {
    const agora = new Date();
    const dataHora = {
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR'),
        timestamp: agora.getTime(),
        diaSemana: agora.toLocaleDateString('pt-BR', { weekday: 'long' }),
        plataforma: navigator.platform,
        userAgent: navigator.userAgent.substring(0, 30)
    };
    
    let historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    historico.push(dataHora);
    localStorage.setItem('carlos_acessos', JSON.stringify(historico));
    
    console.log('📊 Acesso registrado:', dataHora.data, dataHora.hora);
}

function registrarCliqueFoto(elemento) {
    const titulo = elemento.querySelector('h2')?.textContent || 'Foto sem título';
    let cliques = JSON.parse(localStorage.getItem('carlos_cliques') || '{}');
    
    if (!cliques[titulo]) {
        cliques[titulo] = { count: 0, ultimoClique: null };
    }
    cliques[titulo].count++;
    cliques[titulo].ultimoClique = new Date().toLocaleString('pt-BR');
    
    localStorage.setItem('carlos_cliques', JSON.stringify(cliques));
    console.log('📸 Clique registrado:', titulo, 'Total:', cliques[titulo].count);
}

// ==========================================
// PARTE 3: PAINEL ADMIN (CORRIGIDO)
// ==========================================

function atualizarPainelAdmin() {
    const agora = new Date();
    
    // Acesso atual
    document.getElementById('acessoAtual').innerHTML = `
        <strong>Data:</strong> ${agora.toLocaleDateString('pt-BR')}<br>
        <strong>Hora:</strong> ${agora.toLocaleTimeString('pt-BR')}<br>
        <strong>Dia:</strong> ${agora.toLocaleDateString('pt-BR', { weekday: 'long' })}<br>
        <strong>Plataforma:</strong> ${navigator.platform}
    `;
    
    // Histórico
    const historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    document.getElementById('totalVisitas').textContent = historico.length;
    
    const historicoDiv = document.getElementById('historicoVisitas');
    if (historico.length === 0) {
        historicoDiv.innerHTML = '<p style="color:#888;">Nenhum acesso ainda...</p>';
    } else {
        historicoDiv.innerHTML = historico.slice().reverse().map((visita, index) => `
            <div class="visita-item ${index === 0 ? 'recente' : ''}">
                <div class="visita-data">${index === 0 ? '🆕 ' : ''}${visita.data} às ${visita.hora}</div>
                <div class="visita-info">${visita.diaSemana} | ${visita.plataforma}</div>
            </div>
        `).join('');
    }
    
    // Stats de fotos
    const cliques = JSON.parse(localStorage.getItem('carlos_cliques') || '{}');
    const fotosOrdenadas = Object.entries(cliques).sort((a, b) => b[1].count - a[1].count);
    
    const statsDiv = document.getElementById('statsFotos');
    if (fotosOrdenadas.length === 0) {
        statsDiv.innerHTML = '<p style="color:#888;">Nenhum clique registrado...</p>';
    } else {
        statsDiv.innerHTML = fotosOrdenadas.map(([titulo, dados], index) => `
            <div class="foto-stat">
                <span>${index + 1}. ${titulo}</span>
                <span class="foto-stat-count">${dados.count} cliques</span>
            </div>
        `).join('');
    }
}

function abrirAdmin() {
    console.log('🔓 Abrindo painel admin...');
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'block';
        atualizarPainelAdmin();
        console.log('✅ Painel aberto!');
    } else {
        console.error('❌ Painel não encontrado no HTML');
    }
}

function fecharAdmin() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function limparDados() {
    if (confirm('Apagar TODO o histórico?')) {
        localStorage.removeItem('carlos_acessos');
        localStorage.removeItem('carlos_cliques');
        atualizarPainelAdmin();
        alert('Dados apagados!');
    }
}

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

// ==========================================
// ATALHOS PARA ABRIR O PAINEL
// ==========================================

// Método 1: Tecla 'C' 3x rápido
let teclaCCount = 0;
let ultimoTempoC = 0;

document.addEventListener('keydown', (e) => {
    // Debug no console
    console.log('Tecla pressionada:', e.key);
    
    // Fechar com ESC
    if (e.key === 'Escape') {
        fecharAdmin();
        return;
    }
    
    // Detectar 'C' ou 'c'
    if (e.key === 'c' || e.key === 'C') {
        const agora = Date.now();
        
        if (agora - ultimoTempoC < 2000) {
            teclaCCount++;
            console.log('Contagem C:', teclaCCount);
        } else {
            teclaCCount = 1;
            console.log('Contagem reiniciada');
        }
        ultimoTempoC = agora;
        
        if (teclaCCount >= 3) {
            abrirAdmin();
            teclaCCount = 0;
        }
    }
    
    // Método 2: Ctrl+Shift+C (mais fácil)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        console.log('Atalho Ctrl+Shift+C detectado!');
        abrirAdmin();
    }
});

// Método 3: Mobile - toque 5x no canto inferior direito
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
    
    console.log('Toques mobile:', toquesMobile);
    
    if (toquesMobile >= 5) {
        abrirAdmin();
        toquesMobile = 0;
        if (navigator.vibrate) navigator.vibrate(50);
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

window.addEventListener('load', () => {
    console.log('🚀 Página carregada, registrando acesso...');
    registrarAcesso();
    
    // Teste: mostra no console como abrir o painel
    console.log('💡 DICA: Aperte C 3x rápido ou Ctrl+Shift+C para abrir o painel admin');
});
