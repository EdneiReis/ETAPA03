document.addEventListener('DOMContentLoaded', () => {
    const configEl = document.getElementById('aguardar-config');
    if (!configEl) return;

    const URL_PROGRESSO = configEl.getAttribute('data-url-progresso');
    const URL_REVISAO = configEl.getAttribute('data-url-revisao');

    const barraEl      = document.getElementById('barra-progresso');
    const pctEl        = document.getElementById('texto-porcentagem');
    const contagemEl   = document.getElementById('texto-contagem');
    const statusEl     = document.getElementById('status-texto');
    const detalheEl    = document.getElementById('status-detalhe');
    const loadingEl    = document.getElementById('loading-icon');
    const btnContainer = document.getElementById('btn-container');
    const btnRevisao   = document.getElementById('btn-revisao');
    const erroContainer = document.getElementById('erro-container');
    const erroMsgEl    = document.getElementById('erro-mensagem');

    let intervalId;

    function atualizarProgresso() {
        fetch(URL_PROGRESSO)
            .then(res => res.json())
            .then(data => {
                const pct   = data.porcentagem || 0;
                const total = data.total || '?';
                const proc  = data.processadas || 0;

                barraEl.style.width = pct + '%';
                pctEl.textContent   = pct + '%';
                contagemEl.textContent = `${proc} de ${total} páginas processadas`;

                if (data.status === 'pendente') {
                    statusEl.textContent   = '⏳ Na fila de processamento...';
                    detalheEl.textContent  = 'O worker vai iniciar em breve';
                } else if (data.status === 'processando') {
                    statusEl.textContent   = '🔍 Executando OCR nas páginas...';
                    detalheEl.textContent  = `Processando gabaritos com OpenCV + PyMuPDF`;
                } else if (data.status === 'concluido') {
                    clearInterval(intervalId);
                    barraEl.style.width    = '100%';
                    pctEl.textContent      = '100%';
                    contagemEl.textContent = `${total} de ${total} páginas processadas`;
                    statusEl.textContent   = '✅ Processamento concluído!';
                    detalheEl.textContent  = 'Todos os gabaritos foram extraídos com sucesso';
                    loadingEl.style.display = 'none';
                    btnRevisao.href         = URL_REVISAO;
                    btnContainer.style.display = 'block';
                } else if (data.status === 'erro') {
                    clearInterval(intervalId);
                    statusEl.textContent   = '❌ Erro durante o processamento';
                    detalheEl.textContent  = '';
                    loadingEl.style.display = 'none';
                    erroMsgEl.textContent  = data.erro || 'Erro desconhecido';
                    erroContainer.style.display = 'block';
                }
            })
            .catch(err => console.error('Erro no polling:', err));
    }

    // Inicia polling a cada 2 segundos
    atualizarProgresso();
    intervalId = setInterval(atualizarProgresso, 2000);
});
