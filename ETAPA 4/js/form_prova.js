window.updateGabarito = function updateGabarito() {
    if (typeof window.__generateProvaGabarito === 'function') {
        window.__generateProvaGabarito();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const configEl = document.getElementById('form-config');
    if (!configEl) return;

    const numQuestoesId = configEl.getAttribute('data-num-questoes-id');
    const gabaritoTextoId = configEl.getAttribute('data-gabarito-texto-id');
    const dificuldadeTextoId = configEl.getAttribute('data-dificuldade-texto-id');
    const areaTextoId = configEl.getAttribute('data-area-texto-id');  // Fase 2
    const modeloAvaliacaoId = configEl.getAttribute('data-modelo-avaliacao-id'); // Fase 2.5
    const diaEnemId = configEl.getAttribute('data-dia-enem-id'); // Fase 5.5

    const numQuestoesInput = document.getElementById(numQuestoesId);
    const bubbleContainer = document.getElementById('bubble-container');
    const gabaritoHidden = document.getElementById(gabaritoTextoId);
    const dificuldadeHidden = document.getElementById(dificuldadeTextoId);
    const areaHidden = areaTextoId ? document.getElementById(areaTextoId) : null;  // Fase 2
    const modeloAvaliacaoSelect = modeloAvaliacaoId ? document.getElementById(modeloAvaliacaoId) : null; // Fase 2.5
    const diaEnemSelect = diaEnemId ? document.getElementById(diaEnemId) : null; // Fase 5.5
    const padraoEnemCheckbox = document.getElementById('padrao_enem');
    const alternatives = ['A', 'B', 'C', 'D', 'E'];

    // Fase 2: opções de área ENEM por questão
    const AREA_OPTIONS = [
        { val: '', text: '— Sem Área —' },
        { val: 'LIN', text: 'LIN – Linguagens' },
        { val: 'HUM', text: 'HUM – Humanas' },
        { val: 'NAT', text: 'NAT – Natureza' },
        { val: 'MAT', text: 'MAT – Matemática' },
    ];

    // Fase 5.5: mapeamento automático de área por dia e número de questão
    const DIA_ENEM_MAP = {
        DIA1: { rangeA: [1, 45], areaA: 'LIN', rangeB: [46, 90], areaB: 'HUM' },
        DIA2: { rangeA: [1, 45], areaA: 'NAT', rangeB: [46, 90], areaB: 'MAT' },
    };
    const AREA_COLORS = {
        LIN: { bg: 'rgba(20,184,166,.2)', color: '#2dd4bf', label: 'LIN – Linguagens' },
        HUM: { bg: 'rgba(249,115,22,.2)', color: '#fb923c', label: 'HUM – Humanas' },
        NAT: { bg: 'rgba(34,197,94,.2)',  color: '#4ade80', label: 'NAT – Natureza' },
        MAT: { bg: 'rgba(139,92,246,.2)', color: '#a78bfa', label: 'MAT – Matemática' },
    };

    function getAutoArea(numero) {
        const dia = diaEnemSelect ? diaEnemSelect.value : '';
        const cfg = DIA_ENEM_MAP[dia];
        if (!cfg) return null;
        if (numero >= cfg.rangeA[0] && numero <= cfg.rangeA[1]) return cfg.areaA;
        if (numero >= cfg.rangeB[0] && numero <= cfg.rangeB[1]) return cfg.areaB;
        return null;
    }

    if (!numQuestoesInput || !bubbleContainer || !gabaritoHidden || !padraoEnemCheckbox) return;

    let rowsContainer = bubbleContainer.querySelector('.gabarito-rows-container');
    if (!rowsContainer) {
        rowsContainer = document.createElement('div');
        rowsContainer.className = 'gabarito-rows-container';
        bubbleContainer.appendChild(rowsContainer);
    }

    const emptyHint = bubbleContainer.querySelector('.gabarito-empty-hint');

    function setEmptyState(isEmpty) {
        if (emptyHint) {
            emptyHint.hidden = !isEmpty;
        }
    }

    function createQuestionRow(qKey, qLabelText, currentGabarito, currentDificuldades) {
        const row = document.createElement('div');
        row.className = 'd-flex align-center justify-between gabarito-row';
        row.style.padding = '0.5rem 0';
        row.style.borderBottom = '1px solid #334155';

        const label = document.createElement('span');
        label.innerText = qLabelText + ':';
        label.className = 'font-semibold question-number';
        label.style.width = '160px';
        label.style.fontSize = '0.9rem';
        row.appendChild(label);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'd-flex alternatives';
        optionsDiv.style.gap = '0.5rem';

        alternatives.forEach(letter => {
            const bubble = document.createElement('div');
            bubble.innerText = letter;
            bubble.dataset.question = qKey;
            bubble.dataset.letter = letter;
            bubble.className = 'alt-btn';

            bubble.style.width = '35px';
            bubble.style.height = '35px';
            bubble.style.borderRadius = '50%';
            bubble.style.border = '2px solid #334155';
            bubble.style.display = 'flex';
            bubble.style.alignItems = 'center';
            bubble.style.justifyContent = 'center';
            bubble.style.cursor = 'pointer';
            bubble.style.fontWeight = '700';
            bubble.style.transition = 'all 0.2s';

            if (currentGabarito[qKey] === letter) {
                bubble.style.backgroundColor = 'var(--primary)';
                bubble.style.borderColor = 'var(--accent)';
            }

            bubble.onclick = function () {
                optionsDiv.querySelectorAll('[data-letter]').forEach(b => {
                    b.style.backgroundColor = 'transparent';
                    b.style.borderColor = '#334155';
                });
                this.style.backgroundColor = 'var(--primary)';
                this.style.borderColor = 'var(--accent)';
                updateHiddenField();
            };

            optionsDiv.appendChild(bubble);
        });

        row.appendChild(optionsDiv);

        const diffSelect = document.createElement('select');
        diffSelect.className = 'form-select';
        diffSelect.name = `dificuldade_${qKey}`;
        diffSelect.dataset.diffQuestion = qKey;

        // Fase 5.5: renomeia proxy pedagógico (não é TRI real)
        const opts = [
            { val: '-1.0', text: 'Simples' },
            { val: '0.0',  text: 'Moderado' },
            { val: '1.0',  text: 'Complexo' }
        ];

        const currVal = currentDificuldades[qKey] !== undefined ? currentDificuldades[qKey] : '0.0';

        opts.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.val;
            o.innerText = opt.text;
            if (opt.val == currVal) o.selected = true;
            diffSelect.appendChild(o);
        });

        diffSelect.addEventListener('change', updateHiddenField);

        const diffContainer = document.createElement('div');
        diffContainer.className = 'd-flex align-center tri-field';
        diffContainer.appendChild(diffSelect);

        // Fase 2 + 5.5: área por questão
        // Se dia_enem definido: exibe badge automático (read-only) e oculta select manual.
        // Sem dia_enem: exibe select manual (comportamento legado).
        const baseNum = parseInt(qKey.split('_')[0], 10);
        const autoArea = getAutoArea(baseNum);

        const areaContainer = document.createElement('div');
        areaContainer.className = 'd-flex align-center tri-field';

        if (autoArea) {
            // Badge automático visual — o valor real é persistido pelo backend
            const c = AREA_COLORS[autoArea] || {};
            const badge = document.createElement('span');
            badge.textContent = autoArea;
            badge.title = c.label || autoArea;
            badge.dataset.areaQuestion = String(baseNum);
            badge.dataset.autoArea = autoArea; // lido por updateHiddenField
            badge.style.cssText = [
                `background:${c.bg}`, `color:${c.color}`,
                'font-size:.68rem', 'font-weight:700', 'letter-spacing:.07em',
                'text-transform:uppercase', 'padding:.2rem .55rem',
                'border-radius:.35rem', 'white-space:nowrap', 'cursor:default',
            ].join(';');
            areaContainer.appendChild(badge);
        } else {
            // Select manual (Fase 2, sem dia_enem)
            const areaSelect = document.createElement('select');
            areaSelect.className = 'form-select area-select';
            areaSelect.dataset.areaQuestion = qKey.split('_')[0];
            areaSelect.title = 'Área de conhecimento (ENEM)';
            areaSelect.style.minWidth = '150px';

            const currentAreas = parseStoredMap(areaHidden ? areaHidden.value || '' : '');
            const baseKey = qKey.split('_')[0];
            const currArea = currentAreas[baseKey] || '';

            AREA_OPTIONS.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.val;
                o.innerText = opt.text;
                if (opt.val === currArea) o.selected = true;
                areaSelect.appendChild(o);
            });

            areaSelect.addEventListener('change', updateHiddenField);
            areaContainer.appendChild(areaSelect);
        }

        row.appendChild(areaContainer);
        row.appendChild(diffContainer);
        rowsContainer.appendChild(row);
    }

    function parseStoredMap(rawValue) {
        return rawValue.split(',').reduce((acc, curr) => {
            const parts = curr.split(':');
            if (parts.length === 2) acc[parts[0].trim()] = parts[1].trim();
            return acc;
        }, {});
    }

    function generateBubbles() {
        let count = parseInt(numQuestoesInput.value, 10);
        if (isNaN(count) || count < 0) {
            count = 0;
            numQuestoesInput.value = 0;
        }

        if (count === 0) {
            rowsContainer.innerHTML = '';
            setEmptyState(true);
            gabaritoHidden.value = '';
            if (dificuldadeHidden) {
                dificuldadeHidden.value = '';
            }
            return;
        }

        setEmptyState(false);
        rowsContainer.innerHTML = '';

        const currentGabarito = parseStoredMap(gabaritoHidden.value || '');
        const currentDificuldades = dificuldadeHidden && dificuldadeHidden.value
            ? parseStoredMap(dificuldadeHidden.value)
            : {};

        if (!padraoEnemCheckbox.hasAttribute('data-initialized')) {
            if (currentGabarito['1_EN'] || currentGabarito['1_ES']) {
                padraoEnemCheckbox.checked = true;
            }
            padraoEnemCheckbox.setAttribute('data-initialized', 'true');
        }

        const isEnem = padraoEnemCheckbox.checked;

        for (let i = 1; i <= count; i++) {
            if (isEnem && i <= 5) {
                createQuestionRow(`${i}_EN`, `Questão ${i} (Inglês)`, currentGabarito, currentDificuldades);
                createQuestionRow(`${i}_ES`, `Questão ${i} (Espanhol)`, currentGabarito, currentDificuldades);
            } else {
                createQuestionRow(`${i}`, `Questão ${i}`, currentGabarito, currentDificuldades);
            }
        }

        if (typeof window.initCustomSelects === 'function') {
            window.initCustomSelects(rowsContainer);
        }
        toggleTriFields();
    }

    function toggleTriFields() {
        if (!modeloAvaliacaoSelect) return;
        const isTri = modeloAvaliacaoSelect.value === 'TRI';
        bubbleContainer.querySelectorAll('.tri-field').forEach(el => {
            if (isTri) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }

    function updateHiddenField() {
        const results = [];
        rowsContainer.querySelectorAll('div[data-letter]').forEach(b => {
            if (b.style.backgroundColor === 'var(--primary)') {
                results.push(`${b.dataset.question}:${b.dataset.letter}`);
            }
        });
        gabaritoHidden.value = results.join(', ');

        if (dificuldadeHidden) {
            const diffResults = [];
            rowsContainer.querySelectorAll('select[data-diff-question]').forEach(sel => {
                diffResults.push(`${sel.dataset.diffQuestion}:${sel.value}`);
            });
            dificuldadeHidden.value = diffResults.join(', ');
        }

        // Fase 2 + 5.5: serializa as áreas
        // Se há badges automáticos (dia_enem): lê data-auto-area.
        // Se há selects manuais: lê o value selecionado.
        if (areaHidden) {
            const areaResults = [];
            const seenBase = new Set();

            // Badges automáticos
            rowsContainer.querySelectorAll('[data-auto-area]').forEach(badge => {
                const baseKey = badge.dataset.areaQuestion;
                if (!seenBase.has(baseKey)) {
                    seenBase.add(baseKey);
                    areaResults.push(`${baseKey}:${badge.dataset.autoArea}`);
                }
            });

            // Selects manuais (quando não há dia_enem)
            rowsContainer.querySelectorAll('select[data-area-question]').forEach(sel => {
                const baseKey = sel.dataset.areaQuestion;
                if (!seenBase.has(baseKey) && sel.value) {
                    seenBase.add(baseKey);
                    areaResults.push(`${baseKey}:${sel.value}`);
                }
            });

            areaHidden.value = areaResults.join(', ');
        }
    }

    window.__generateProvaGabarito = generateBubbles;
    window.updateGabarito = generateBubbles;

    padraoEnemCheckbox.addEventListener('change', generateBubbles);
    if (modeloAvaliacaoSelect) {
        modeloAvaliacaoSelect.addEventListener('change', () => {
            toggleTriFields();
            generateBubbles(); // regenera bubbles para mostrar/ocultar tri-fields
        });
    }
    // Fase 5.5: ao trocar o dia, regenera bubbles para atualizar badges de área
    if (diaEnemSelect) {
        diaEnemSelect.addEventListener('change', generateBubbles);
    }

    const stepper = numQuestoesInput.closest('.number-stepper');
    if (stepper) {
        const decrementBtn = stepper.querySelector('.stepper-btn.decrement');
        const incrementBtn = stepper.querySelector('.stepper-btn.increment');

        if (decrementBtn) {
            decrementBtn.addEventListener('click', function () {
                numQuestoesInput.stepDown();
                generateBubbles();
            });
        }

        if (incrementBtn) {
            incrementBtn.addEventListener('click', function () {
                numQuestoesInput.stepUp();
                generateBubbles();
            });
        }
    }

    numQuestoesInput.addEventListener('input', generateBubbles);
    numQuestoesInput.addEventListener('change', generateBubbles);

    if (configEl.getAttribute('data-start-blank') === '1') {
        numQuestoesInput.value = 0;
        gabaritoHidden.value = '';
        if (dificuldadeHidden) {
            dificuldadeHidden.value = '';
        }
        padraoEnemCheckbox.checked = false;
        rowsContainer.innerHTML = '';
    }

    updateGabarito();
});
