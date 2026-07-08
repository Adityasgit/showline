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

/* ---- Services dropdown (click toggle for touch + accessibility;
   CSS handles hover-open on desktop) ---- */
document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown__toggle');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const open = dropdown.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(open));
    });
});

// Close any open dropdown when clicking outside of it
document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.is-open').forEach((dropdown) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('is-open');
            dropdown.querySelector('.nav-dropdown__toggle')
                ?.setAttribute('aria-expanded', 'false');
        }
    });
});

// Close dropdowns on Escape
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.nav-dropdown.is-open').forEach((dropdown) => {
        dropdown.classList.remove('is-open');
        dropdown.querySelector('.nav-dropdown__toggle')
            ?.setAttribute('aria-expanded', 'false');
    });
});
