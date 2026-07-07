/* ============================================================
   navbar.js — mobile navigation toggle (shared across pages)
   ============================================================ */
const toggle = document.getElementById('nav-toggle');
const nav = document.getElementById('site-nav');

if (toggle && nav) {
    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
    });

    // Close the menu when a link is chosen
    nav.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}
