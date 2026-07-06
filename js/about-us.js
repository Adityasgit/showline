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
