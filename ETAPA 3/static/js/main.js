(function () {
    function toggleDropdown(button) {
        document.querySelectorAll('.dropdown-menu').forEach(function (menu) {
            if (menu !== button.nextElementSibling) {
                menu.classList.remove('show');
            }
        });
        button.nextElementSibling.classList.toggle('show');
    }

    function initDropdowns() {
        document.querySelectorAll('[data-dropdown-trigger]').forEach(function (button) {
            button.addEventListener('click', function () {
                toggleDropdown(button);
            });
        });

        window.addEventListener('click', function (event) {
            if (!event.target.closest('.dropdown-container')) {
                document.querySelectorAll('.dropdown-menu').forEach(function (menu) {
                    menu.classList.remove('show');
                });
            }
        });
    }

    function initLoteUploadForm() {
        const form = document.getElementById('form-upload');
        if (!form) {
            return;
        }

        form.addEventListener('submit', function () {
            const btn = document.getElementById('btn-enviar');
            if (!btn) {
                return;
            }

            btn.disabled = true;
            btn.textContent = '⏳ Enviando PDF...';
        });
    }

    function closeAllCustomSelects() {
        document.querySelectorAll('.custom-options.open').forEach(function (el) {
            el.classList.remove('open');
        });
        document.querySelectorAll('.custom-select-trigger.open').forEach(function (el) {
            el.classList.remove('open');
        });
    }

    /**
     * Transforma selects elegíveis em UI customizada. Idempotente (.customized).
     * @param {ParentNode} [root] - opcional; quando passado (ex.: gabarito dinâmico), só escaneia esse nó.
     */
    function initCustomSelects(root) {
        const scope = root && root.querySelectorAll ? root : document;
        const selector = '.form-select:not(.customized), select[name^="dificuldade"]:not(.customized), .gabarito-area select:not(.customized)';
        const selectElements = scope.querySelectorAll(selector);

        selectElements.forEach(function (select) {
            if (select.classList.contains('no-custom-select')) {
                return;
            }

            select.classList.add('customized');
            select.style.display = 'none';

            const wrapper = document.createElement('div');
            wrapper.className = 'custom-select-wrapper';
            select.parentNode.insertBefore(wrapper, select);
            wrapper.appendChild(select);

            const trigger = document.createElement('div');
            trigger.className = 'custom-select-trigger';
            trigger.innerHTML = select.options[select.selectedIndex]
                ? select.options[select.selectedIndex].innerHTML
                : 'Selecione...';
            wrapper.appendChild(trigger);

            const optionsList = document.createElement('div');
            optionsList.className = 'custom-options';

            for (let i = 0; i < select.options.length; i++) {
                const opt = select.options[i];
                const optionDiv = document.createElement('div');
                optionDiv.className = 'custom-option';
                optionDiv.innerHTML = opt.innerHTML;

                optionDiv.addEventListener('click', function (e) {
                    e.stopPropagation();
                    select.selectedIndex = i;
                    trigger.innerHTML = select.options[i].innerHTML;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    optionsList.classList.remove('open');
                    trigger.classList.remove('open');
                });

                optionsList.appendChild(optionDiv);
            }

            wrapper.appendChild(optionsList);

            trigger.addEventListener('click', function (e) {
                e.stopPropagation();
                document.querySelectorAll('.custom-select-trigger.open').forEach(function (el) {
                    if (el !== trigger) {
                        el.classList.remove('open');
                        const next = el.nextElementSibling;
                        if (next) {
                            next.classList.remove('open');
                        }
                    }
                });
                trigger.classList.toggle('open');
                optionsList.classList.toggle('open');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initDropdowns();
        initLoteUploadForm();
        initCustomSelects();
    });

    document.addEventListener('click', function () {
        closeAllCustomSelects();
    });

    window.toggleDropdown = toggleDropdown;
    window.initCustomSelects = initCustomSelects;
})();
