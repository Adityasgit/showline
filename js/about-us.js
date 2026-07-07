/* ============================================================
   about-us.js — mobile nav toggle + static form UX
   ============================================================ */
(function () {
    'use strict';

    /* ---- Mobile navigation ---- */
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
        });

        // Close the menu when a link is chosen
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---- Custom select dropdowns (progressive enhancement over native <select>) ---- */
    var customSelects = [];

    function closeAllSelects(except) {
        customSelects.forEach(function (s) {
            if (s.wrap !== except) s.close();
        });
    }

    function findSelectedIndex(options) {
        for (var i = 0; i < options.length; i++) {
            if (options[i].getAttribute('aria-selected') === 'true') return i;
        }
        return -1;
    }

    function enhanceSelect(native) {
        var field = native.closest('.form-field');
        var labelEl = field ? field.querySelector('label') : null;

        var wrap = document.createElement('div');
        wrap.className = 'select';

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'select__trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        var valueEl = document.createElement('span');
        valueEl.className = 'select__value';
        trigger.appendChild(valueEl);

        var menu = document.createElement('ul');
        menu.className = 'select__menu';
        menu.setAttribute('role', 'listbox');
        menu.tabIndex = -1;

        if (labelEl) {
            if (!labelEl.id) { labelEl.id = (native.id || 'select') + '-label'; }
            trigger.setAttribute('aria-labelledby', labelEl.id);
            menu.setAttribute('aria-labelledby', labelEl.id);
        }

        // Placeholder comes from the disabled/first option
        var first = native.options[0];
        var placeholder = first ? first.text : '';

        var options = [];
        Array.prototype.forEach.call(native.options, function (opt) {
            if (opt.disabled) { return; }   // skip the placeholder row
            var li = document.createElement('li');
            li.className = 'select__option';
            li.setAttribute('role', 'option');
            li.dataset.value = opt.value || opt.text;
            li.textContent = opt.text;
            li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
            menu.appendChild(li);
            options.push(li);
        });

        function renderValue() {
            var sel = native.options[native.selectedIndex];
            if (!sel || sel.disabled) {
                valueEl.textContent = placeholder;
                valueEl.classList.add('select__value--placeholder');
            } else {
                valueEl.textContent = sel.text;
                valueEl.classList.remove('select__value--placeholder');
            }
        }

        // Assemble: keep native inside wrap for form submission
        native.parentNode.insertBefore(wrap, native);
        wrap.appendChild(native);
        wrap.appendChild(trigger);
        wrap.appendChild(menu);
        native.classList.add('select__native');
        native.tabIndex = -1;
        native.setAttribute('aria-hidden', 'true');
        renderValue();

        var activeIndex = -1;

        function setActive(i) {
            if (activeIndex > -1 && options[activeIndex]) {
                options[activeIndex].classList.remove('is-active');
            }
            activeIndex = i;
            if (i > -1 && options[i]) {
                options[i].classList.add('is-active');
                options[i].scrollIntoView({ block: 'nearest' });
            }
        }

        function open() {
            closeAllSelects(wrap);
            wrap.classList.add('select--open');
            trigger.setAttribute('aria-expanded', 'true');
            var sel = findSelectedIndex(options);
            setActive(sel > -1 ? sel : 0);
            menu.focus();
        }

        function close() {
            if (!wrap.classList.contains('select--open')) { return; }
            wrap.classList.remove('select--open');
            trigger.setAttribute('aria-expanded', 'false');
            setActive(-1);
        }

        function choose(i) {
            var li = options[i];
            if (!li) { return; }
            options.forEach(function (o) { o.setAttribute('aria-selected', 'false'); });
            li.setAttribute('aria-selected', 'true');
            native.value = li.dataset.value;
            native.dispatchEvent(new Event('change', { bubbles: true }));
            renderValue();
            close();
            trigger.focus();
        }

        trigger.addEventListener('click', function () {
            if (wrap.classList.contains('select--open')) { close(); } else { open(); }
        });

        trigger.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });

        menu.addEventListener('click', function (e) {
            var li = e.target.closest('.select__option');
            if (li) { choose(options.indexOf(li)); }
        });

        menu.addEventListener('mousemove', function (e) {
            var li = e.target.closest('.select__option');
            if (li) { setActive(options.indexOf(li)); }
        });

        menu.addEventListener('keydown', function (e) {
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
                    e.preventDefault(); if (activeIndex > -1) { choose(activeIndex); } break;
                case 'Escape':
                    e.preventDefault(); close(); trigger.focus(); break;
                case 'Tab':
                    close(); break;
                default:
                    if (e.key.length === 1) {   // type-ahead
                        var ch = e.key.toLowerCase();
                        for (var k = 1; k <= options.length; k++) {
                            var idx = (activeIndex + k) % options.length;
                            if (options[idx].textContent.trim().toLowerCase().indexOf(ch) === 0) {
                                setActive(idx); break;
                            }
                        }
                    }
            }
        });

        customSelects.push({ wrap: wrap, close: close });
    }

    var formSelects = document.querySelectorAll('.contact-form select');
    if (formSelects.length) {
        Array.prototype.forEach.call(formSelects, enhanceSelect);
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.select')) { closeAllSelects(null); }
        });
    }

    /* ---- Consultation form (static, no backend) ---- */
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            if (status) {
                status.hidden = false;
            }
            form.reset();
        });
    }
})();
