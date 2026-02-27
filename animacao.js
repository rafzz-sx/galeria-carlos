console.log('🎵 Galeria do Carlos carregada!');

// ==========================================
// PARTE 1: GALERIA ORIGINAL
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

btnEntrar.addEventListener("click", () => {
    intro.classList.add("sair");
    setTimeout(() => {
        intro.remove();
        instrucoes.classList.add("ativa");
    }, 150);
});

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
    el.addEventListener("click", (e) => {
        e.stopPropagation();
        const audioSrc = el.dataset.audio;
        const fotoId = el.dataset.id;
        const fotoTitulo = el.querySelector('h2')?.textContent || 'Sem título';

        if (el === elementoAtivo) {
            pararTudo();
            return;
        }

        pararTudo();
        el.classList.add("ativo");
        elementoAtivo = el;

        audioAtual.src = audioSrc;
        audioAtual.currentTime = 0;
        
        audioAtual.play().then(() => {
            console.log('✅ Tocando:', audioSrc);
            registrarCliqueFoto(fotoId, fotoTitulo);
        }).catch((err) => {
            console.error('❌ Erro:', audioSrc, err);
        });
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
// PARTE 2: DETECÇÃO DE DISPOSITIVO MELHORADA
// ==========================================

function detectarDispositivo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    let tipo = 'PC';
    let icone = '🖥️';
    let nome = 'Computador';
    let sistema = 'Desconhecido';
    
    // Detectar iPhone
    if (/iPhone/.test(ua)) {
        tipo = 'Mobile';
        icone = '📱';
        nome = 'iPhone';
        sistema = 'iOS';
    }
    // Detectar iPad
    else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) {
        tipo = 'Tablet';
        icone = '📱';
        nome = 'iPad';
        sistema = 'iOS';
    }
    // Detectar Android
    else if (/Android/.test(ua)) {
        if (/Mobile/.test(ua)) {
            tipo = 'Mobile';
            icone = '📱';
            nome = 'Android';
        } else {
            tipo = 'Tablet';
            icone = '📱';
            nome = 'Android Tablet';
        }
        sistema = 'Android';
        
        // Tentar pegar marca do Android
        const match = ua.match(/; ([^;]+) Build\//);
        if (match) {
            nome = match[1];
        }
    }
    // Detectar Windows Phone
    else if (/Windows Phone/.test(ua)) {
        tipo = 'Mobile';
        icone = '📱';
        nome = 'Windows Phone';
        sistema = 'Windows Phone';
    }
    // Detectar Mac
    else if (/Mac/.test(platform)) {
        icone = '🖥️';
        nome = 'Mac';
        sistema = 'macOS';
    }
    // Detectar Windows
    else if (/Win/.test(platform)) {
        icone = '🖥️';
        nome = 'Windows PC';
        sistema = 'Windows';
    }
    // Detectar Linux
    else if (/Linux/.test(platform)) {
        icone = '🖥️';
        nome = 'Linux';
        sistema = 'Linux';
    }
    
    return {
        tipo,
        icone,
        nome,
        sistema,
        userAgent: ua.substring(0, 50),
        platform,
        tela: `${window.screen.width}x${window.screen.height}`,
        idioma: navigator.language
    };
}

// ==========================================
// PARTE 3: RASTREAMENTO MELHORADO
// ==========================================

let sessaoAtual = {
    id: Date.now(),
    inicio: new Date(),
    dispositivo: detectarDispositivo(),
    fotosClicadas: [],
    fotosUnicas: new Set()
};

function registrarAcesso() {
    const dispositivo = detectarDispositivo();
    
    const visita = {
        id: sessaoAtual.id,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR'),
        timestamp: Date.now(),
        diaSemana: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
        dispositivo: dispositivo,
        fotosVistas: []
    };
    
    let historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    historico.push(visita);
    localStorage.setItem('carlos_acessos', JSON.stringify(historico));
    
    console.log('📊 Acesso registrado:', dispositivo.nome, dispositivo.sistema);
    adicionarLog(`Nova sessão iniciada: ${dispositivo.nome} (${dispositivo.sistema})`);
    
    return visita;
}

function registrarCliqueFoto(fotoId, fotoTitulo) {
    // Adiciona à sessão atual
    sessaoAtual.fotosClicadas.push({
        id: fotoId,
        titulo: fotoTitulo,
        hora: new Date().toLocaleTimeString('pt-BR')
    });
    sessaoAtual.fotosUnicas.add(fotoId);
    
    // Atualiza no localStorage
    let historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    const sessaoIndex = historico.findIndex(h => h.id === sessaoAtual.id);
    if (sessaoIndex !== -1) {
        historico[sessaoIndex].fotosVistas = Array.from(sessaoAtual.fotosUnicas);
        localStorage.setItem('carlos_acessos', JSON.stringify(historico));
    }
    
    // Estatísticas gerais por foto
    let statsFotos = JSON.parse(localStorage.getItem('carlos_stats_fotos') || '{}');
    if (!statsFotos[fotoId]) {
        statsFotos[fotoId] = {
            titulo: fotoTitulo,
            totalCliques: 0,
            porDispositivo: {}
        };
    }
    statsFotos[fotoId].totalCliques++;
    
    const deviceKey = sessaoAtual.dispositivo.nome;
    if (!statsFotos[fotoId].porDispositivo[deviceKey]) {
        statsFotos[fotoId].porDispositivo[deviceKey] = 0;
    }
    statsFotos[fotoId].porDispositivo[deviceKey]++;
    
    localStorage.setItem('carlos_stats_fotos', JSON.stringify(statsFotos));
    
    console.log('📸 Clique:', fotoTitulo, 'em', sessaoAtual.dispositivo.nome);
    adicionarLog(`Foto clicada: ${fotoTitulo}`);
}

function adicionarLog(mensagem) {
    const logDiv = document.getElementById('logAtividade');
    if (!logDiv) return;
    
    const hora = new Date().toLocaleTimeString('pt-BR');
    const entry = document.createElement('div');
    entry.className = 'log-entry new';
    entry.textContent = `[${hora}] ${mensagem}`;
    
    logDiv.insertBefore(entry, logDiv.firstChild);
    
    // Mantém apenas últimas 50 entradas
    while (logDiv.children.length > 50) {
        logDiv.removeChild(logDiv.lastChild);
    }
    
    // Remove classe 'new' após animação
    setTimeout(() => entry.classList.remove('new'), 2000);
}

// ==========================================
// PARTE 4: PAINEL ADMIN MELHORADO
// ==========================================

function atualizarPainelAdmin() {
    const dispositivo = sessaoAtual.dispositivo;
    
    // Sessão atual
    document.getElementById('sessaoAtual').innerHTML = `
        <div class="device-card" style="border-color: #ff0055;">
            <div class="device-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:30px;">${dispositivo.icone}</span>
                    <div>
                        <div class="device-name">Você está usando: ${dispositivo.nome}</div>
                        <div class="device-info">
                            ${dispositivo.sistema} • ${dispositivo.tela} • ${dispositivo.idioma}
                        </div>
                    </div>
                </div>
                <span style="color:#ff0055; font-weight:bold;">AGORA</span>
            </div>
            <div class="device-stats">
                <div class="device-stat">
                    Fotos vistas: <span class="device-stat-value">${sessaoAtual.fotosUnicas.size}</span>
                </div>
                <div class="device-stat">
                    Cliques: <span class="device-stat-value">${sessaoAtual.fotosClicadas.length}</span>
                </div>
                <div class="device-stat">
                    Tempo: <span class="device-stat-value">${calcularTempoSessao()}</span>
                </div>
            </div>
            ${sessaoAtual.fotosClicadas.length > 0 ? `
                <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                    <small style="color:#888;">Últimas fotos:</small>
                    <div class="sessao-fotos" style="margin-top:5px;">
                        ${sessaoAtual.fotosClicadas.slice(-5).map(f => 
                            `<span class="foto-tag">${f.titulo.substring(0, 20)}${f.titulo.length > 20 ? '...' : ''}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Estatísticas gerais
    const historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    const statsFotos = JSON.parse(localStorage.getItem('carlos_stats_fotos') || '{}');
    
    const totalCliques = Object.values(statsFotos).reduce((sum, f) => sum + f.totalCliques, 0);
    const dispositivosUnicos = new Set(historico.map(h => h.dispositivo.nome)).size;
    
    document.getElementById('statsGerais').innerHTML = `
        <div class="stat-card">
            <span class="stat-number">${historico.length}</span>
            <div class="stat-label">Total de Visitas</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${dispositivosUnicos}</span>
            <div class="stat-label">Dispositivos Únicos</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${totalCliques}</span>
            <div class="stat-label">Total de Cliques</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${Object.keys(statsFotos).length}</span>
            <div class="stat-label">Fotos Interagidas</div>
        </div>
    `;
    
    // Lista de dispositivos
    const dispositivosContagem = {};
    historico.forEach(h => {
        const nome = h.dispositivo.nome;
        if (!dispositivosContagem[nome]) {
            dispositivosContagem[nome] = {
                ...h.dispositivo,
                visitas: 0,
                ultimaVisita: h.timestamp
            };
        }
        dispositivosContagem[nome].visitas++;
        if (h.timestamp > dispositivosContagem[nome].ultimaVisita) {
            dispositivosContagem[nome].ultimaVisita = h.timestamp;
        }
    });
    
    document.getElementById('totalDispositivos').textContent = Object.keys(dispositivosContagem).length;
    document.getElementById('listaDispositivos').innerHTML = Object.values(dispositivosContagem)
        .sort((a, b) => b.visitas - a.visitas)
        .map(d => `
            <div class="device-card">
                <div class="device-header">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="device-icon">${d.icone}</span>
                        <div>
                            <div class="device-name">${d.nome}</div>
                            <div class="device-info">${d.sistema} • ${d.tela}</div>
                        </div>
                    </div>
                    <span style="color:#00f0ff; font-weight:bold;">${d.visitas}x</span>
                </div>
            </div>
        `).join('');
    
    // Histórico por sessão (últimas 20)
    document.getElementById('historicoSessoes').innerHTML = historico
        .slice(-20)
        .reverse()
        .map((h, index) => {
            const fotos = h.fotosVistas || [];
            const statsFotosData = JSON.parse(localStorage.getItem('carlos_stats_fotos') || '{}');
            
            return `
                <div class="sessao-item ${index === 0 ? 'recente' : ''}">
                    <div class="sessao-header">
                        <div class="sessao-device">
                            <span style="font-size:20px;">${h.dispositivo.icone}</span>
                            <div>
                                <div style="font-weight:bold;">${h.dispositivo.nome}</div>
                                <div style="font-size:11px; color:#888;">${h.dispositivo.sistema}</div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div class="sessao-time">${h.data} às ${h.hora}</div>
                            <div style="font-size:11px; color:#666;">${h.diaSemana}</div>
                        </div>
                    </div>
                    ${fotos.length > 0 ? `
                        <div style="margin-top:8px;">
                            <small style="color:#888;">Fotos vistas (${fotos.length}):</small>
                            <div class="sessao-fotos">
                                ${fotos.map(fotoId => {
                                    const fotoData = statsFotosData[fotoId];
                                    return fotoData ? 
                                        `<span class="foto-tag" title="${fotoData.titulo}">${fotoData.titulo.substring(0, 15)}${fotoData.titulo.length > 15 ? '...' : ''}</span>` : 
                                        `<span class="foto-tag">${fotoId}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : '<div style="color:#666; font-size:12px; margin-top:5px;">Nenhuma foto visualizada</div>'}
                </div>
            `;
        }).join('');
    
    // Preferências por dispositivo
    const prefsPorDispositivo = {};
    Object.entries(statsFotos).forEach(([fotoId, data]) => {
        Object.entries(data.porDispositivo).forEach(([deviceName, count]) => {
            if (!prefsPorDispositivo[deviceName]) {
                prefsPorDispositivo[deviceName] = [];
            }
            prefsPorDispositivo[deviceName].push({
                fotoId,
                titulo: data.titulo,
                count
            });
        });
    });
    
    document.getElementById('preferenciasDispositivo').innerHTML = Object.entries(prefsPorDispositivo)
        .sort((a, b) => {
            const totalA = a[1].reduce((sum, item) => sum + item.count, 0);
            const totalB = b[1].reduce((sum, item) => sum + item.count, 0);
            return totalB - totalA;
        })
        .map(([deviceName, fotos]) => {
            const totalClicks = fotos.reduce((sum, f) => sum + f.count, 0);
            const fotosOrdenadas = fotos.sort((a, b) => b.count - a.count).slice(0, 5);
            const maxCount = fotosOrdenadas[0]?.count || 1;
            
            return `
                <div class="pref-item">
                    <div class="pref-header">
                        <span style="font-size:20px;">📱</span>
                        <div>
                            <div class="pref-device">${deviceName}</div>
                            <div style="font-size:12px; color:#888;">${totalClicks} cliques totais</div>
                        </div>
                    </div>
                    <div class="pref-fotos">
                        ${fotosOrdenadas.map(f => `
                            <div class="pref-foto-item">
                                <span style="flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.titulo}</span>
                                <div class="pref-foto-bar">
                                    <div class="pref-foto-fill" style="width: ${(f.count / maxCount) * 100}%"></div>
                                </div>
                                <span class="pref-foto-count">${f.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
}

function calcularTempoSessao() {
    const diff = Math.floor((Date.now() - sessaoAtual.inicio.getTime()) / 1000);
    const minutos = Math.floor(diff / 60);
    const segundos = diff % 60;
    return minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;
}

// Atualiza o tempo em tempo real
setInterval(() => {
    if (document.getElementById('adminPanel')?.style.display === 'block') {
        const tempoEl = document.querySelector('.device-stats .device-stat-value:last-child');
        if (tempoEl) {
            tempoEl.textContent = calcularTempoSessao();
        }
    }
}, 1000);

// ==========================================
// PARTE 5: CONTROLES DO PAINEL
// ==========================================

function abrirAdmin() {
    console.log('🔓 Abrindo painel admin...');
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'block';
        atualizarPainelAdmin();
        console.log('✅ Painel aberto!');
    }
}

function fecharAdmin() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function limparDados() {
    if (confirm('⚠️ ATENÇÃO: Isso apagará TODO o histórico!\n\nTem certeza?')) {
        localStorage.removeItem('carlos_acessos');
        localStorage.removeItem('carlos_stats_fotos');
        sessaoAtual.fotosClicadas = [];
        sessaoAtual.fotosUnicas.clear();
        atualizarPainelAdmin();
        adicionarLog('🗑️ Todos os dados foram apagados');
        alert('Dados apagados com sucesso!');
    }
}

function exportarDados() {
    const dados = {
        acessos: JSON.parse(localStorage.getItem('carlos_acessos') || '[]'),
        estatisticas: JSON.parse(localStorage.getItem('carlos_stats_fotos') || '{}'),
        sessaoAtual: {
            ...sessaoAtual,
            fotosUnicas: Array.from(sessaoAtual.fotosUnicas)
        },
        exportadoEm: new Date().toLocaleString('pt-BR')
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_galeria_carlos_${Date.now()}.json`;
    a.click();
    
    adicionarLog('💾 Dados exportados (JSON)');
    console.log('💾 Exportado!');
}

function exportarCSV() {
    const historico = JSON.parse(localStorage.getItem('carlos_acessos') || '[]');
    const statsFotos = JSON.parse(localStorage.getItem('carlos_stats_fotos') || '{}');
    
    let csv = 'Data,Hora,Dispositivo,Sistema,Tipo,Tela,Fotos Vistas\n';
    
    historico.forEach(h => {
        csv += `${h.data},${h.hora},"${h.dispositivo.nome}","${h.dispositivo.sistema}","${h.dispositivo.tipo}","${h.dispositivo.tela}",${(h.fotosVistas || []).length}\n`;
    });
    
    csv += '\n\nFoto,Total Cliques,Por Dispositivo\n';
    Object.entries(statsFotos).forEach(([id, data]) => {
        const porDevice = Object.entries(data.porDispositivo)
            .map(([d, c]) => `${d}(${c})`)
            .join('; ');
        csv += `"${data.titulo}",${data.totalCliques},"${porDevice}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_galeria_carlos_${Date.now()}.csv`;
    a.click();
    
    adicionarLog('📊 Relatório CSV exportado');
}

// ==========================================
// PARTE 6: ATALHOS
// ==========================================

let teclaCCount = 0;
let ultimoTempoC = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharAdmin();
        return;
    }
    
    if (e.key === 'c' || e.key === 'C') {
        const agora = Date.now();
        if (agora - ultimoTempoC < 2000) {
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
    
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        abrirAdmin();
    }
});

// Mobile
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
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

window.addEventListener('load', () => {
    console.log('🚀 Iniciando...');
    registrarAcesso();
    console.log('💡 Painel somente para o Desenvolvedor: Rafael V');
});

