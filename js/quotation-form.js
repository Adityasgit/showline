/* ============================================================
   quotation-form.js — custom select dropdowns + static form UX
   (reusable wherever the .contact-form markup appears)
   ============================================================ */

/* ---- Custom select dropdowns (progressive enhancement over native <select>) ---- */
const customSelects = [];

const closeAllSelects = (except) => {
    customSelects.forEach((s) => {
        if (s.wrap !== except) s.close();
    });
};

const findSelectedIndex = (options) =>
    options.findIndex((li) => li.getAttribute('aria-selected') === 'true');

const enhanceSelect = (native) => {
    const field = native.closest('.form-field');
    const labelEl = field ? field.querySelector('label') : null;

    const wrap = document.createElement('div');
    wrap.className = 'select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const valueEl = document.createElement('span');
    valueEl.className = 'select__value';
    trigger.appendChild(valueEl);

    const menu = document.createElement('ul');
    menu.className = 'select__menu';
    menu.setAttribute('role', 'listbox');
    menu.tabIndex = -1;

    if (labelEl) {
        if (!labelEl.id) labelEl.id = `${native.id || 'select'}-label`;
        trigger.setAttribute('aria-labelledby', labelEl.id);
        menu.setAttribute('aria-labelledby', labelEl.id);
    }

    // Placeholder comes from the disabled/first option
    const first = native.options[0];
    const placeholder = first ? first.text : '';

    const options = [];
    Array.from(native.options).forEach((opt) => {
        if (opt.disabled) return;   // skip the placeholder row
        const li = document.createElement('li');
        li.className = 'select__option';
        li.setAttribute('role', 'option');
        li.dataset.value = opt.value || opt.text;
        li.textContent = opt.text;
        li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
        menu.appendChild(li);
        options.push(li);
    });

    const renderValue = () => {
        const sel = native.options[native.selectedIndex];
        if (!sel || sel.disabled) {
            valueEl.textContent = placeholder;
            valueEl.classList.add('select__value--placeholder');
        } else {
            valueEl.textContent = sel.text;
            valueEl.classList.remove('select__value--placeholder');
        }
    };

    // Assemble: keep native inside wrap for form submission
    native.parentNode.insertBefore(wrap, native);
    wrap.appendChild(native);
    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    native.classList.add('select__native');
    native.tabIndex = -1;
    native.setAttribute('aria-hidden', 'true');
    renderValue();

    let activeIndex = -1;

    const setActive = (i) => {
        if (activeIndex > -1 && options[activeIndex]) {
            options[activeIndex].classList.remove('is-active');
        }
        activeIndex = i;
        if (i > -1 && options[i]) {
            options[i].classList.add('is-active');
            options[i].scrollIntoView({ block: 'nearest' });
        }
    };

    const open = () => {
        closeAllSelects(wrap);
        wrap.classList.add('select--open');
        trigger.setAttribute('aria-expanded', 'true');
        const sel = findSelectedIndex(options);
        setActive(sel > -1 ? sel : 0);
        menu.focus();
    };

    const close = () => {
        if (!wrap.classList.contains('select--open')) return;
        wrap.classList.remove('select--open');
        trigger.setAttribute('aria-expanded', 'false');
        setActive(-1);
    };

    const choose = (i) => {
        const li = options[i];
        if (!li) return;
        options.forEach((o) => o.setAttribute('aria-selected', 'false'));
        li.setAttribute('aria-selected', 'true');
        native.value = li.dataset.value;
        native.dispatchEvent(new Event('change', { bubbles: true }));
        renderValue();
        close();
        trigger.focus();
    };

    trigger.addEventListener('click', () => {
        wrap.classList.contains('select--open') ? close() : open();
    });

    trigger.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            open();
        }
    });

    menu.addEventListener('click', (e) => {
        const li = e.target.closest('.select__option');
        if (li) choose(options.indexOf(li));
    });

    menu.addEventListener('mousemove', (e) => {
        const li = e.target.closest('.select__option');
        if (li) setActive(options.indexOf(li));
    });

    menu.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault(); setActive(Math.min(activeIndex + 1, options.length - 1)); break;
            case 'ArrowUp':
                e.preventDefault(); setActive(Math.max(activeIndex - 1, 0)); break;
            case 'Home':
                e.preventDefault(); setActive(0); break;
            case 'End':
                e.preventDefault(); setActive(options.length - 1); break;
            case 'Enter':
            case ' ':
                e.preventDefault(); if (activeIndex > -1) choose(activeIndex); break;
            case 'Escape':
                e.preventDefault(); close(); trigger.focus(); break;
            case 'Tab':
                close(); break;
            default:
                if (e.key.length === 1) {   // type-ahead
                    const ch = e.key.toLowerCase();
                    for (let k = 1; k <= options.length; k++) {
                        const idx = (activeIndex + k) % options.length;
                        if (options[idx].textContent.trim().toLowerCase().startsWith(ch)) {
                            setActive(idx); break;
                        }
                    }
                }
        }
    });

    customSelects.push({ wrap, close });
};

const formSelects = document.querySelectorAll('.contact-form select');
if (formSelects.length) {
    formSelects.forEach(enhanceSelect);
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.select')) closeAllSelects(null);
    });
}

/* ---- Consultation form (static, no backend) ---- */
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        if (status) status.hidden = false;
        form.reset();
    });
}
