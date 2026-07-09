/* ============================================================
   projects.js — filter pills + fan carousel + mobile carousel
   (vanilla JS, no dependencies)
   ============================================================ */

/* ---- Filter pills ---- */
const filterGroups = Array.from(document.querySelectorAll('.pr-filter__pills'));
const desktopCards = Array.from(document.querySelectorAll('.pr-grid .pr-card'));
const desktopRows = Array.from(document.querySelectorAll('.pr-grid .pr-row'));
const desktopCols = Array.from(document.querySelectorAll('.pr-grid .pr-col'));
const mobileCards = Array.from(document.querySelectorAll('.pr-grid-m .pr-card'));
const mobileRows = Array.from(document.querySelectorAll('.pr-grid-m .pr-grid-m__row'));
const totalCount = document.getElementById('pr-total-count');

const setActiveFilter = (filter) => {
    filterGroups.forEach((group) => {
        group.querySelectorAll('.pr-pill').forEach((pill) => {
            pill.classList.toggle('is-active', pill.dataset.filter === filter);
        });
    });
};

const cardMatches = (card, filter) => {
    if (filter === 'all') return true;
    const categories = (card.dataset.categories || '')
        .split(/\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
    return categories.includes(filter);
};

const updateGroupVisibility = (cards, rows, columns, filter) => {
    cards.forEach((card) => {
        card.classList.toggle('is-filter-hidden', !cardMatches(card, filter));
    });

    rows.forEach((row) => {
        const visibleCards = row.querySelectorAll('.pr-card:not(.is-filter-hidden)');
        row.classList.toggle('is-filter-hidden', visibleCards.length === 0);
    });

    columns.forEach((col) => {
        const visibleCards = col.querySelectorAll('.pr-card:not(.is-filter-hidden)');
        col.classList.toggle('is-filter-hidden', visibleCards.length === 0);
    });
};

const applyFilter = (filter) => {
    setActiveFilter(filter);
    updateGroupVisibility(desktopCards, desktopRows, desktopCols, filter);
    updateGroupVisibility(mobileCards, mobileRows, [], filter);

    if (totalCount) {
        const visibleCount = desktopCards.filter((card) => !card.classList.contains('is-filter-hidden')).length;
        totalCount.textContent = String(visibleCount);
    }
};

filterGroups.forEach((group) => {
    group.addEventListener('click', (e) => {
        const btn = e.target.closest('.pr-pill');
        if (!btn) return;
        applyFilter(btn.dataset.filter || 'all');
    });
});

applyFilter('all');

/* ---- Desktop: fanned coverflow carousel ----
   Each card keeps its own image permanently; sliding is done by smoothly
   transitioning every card's *position* (offset) to its new slot. Looping
   is seamless: the card leaving the deck is teleported (transition
   disabled) to the far invisible edge, then eased back in alongside
   everything else shifting — so it always looks like continuous motion,
   never an abrupt cut. ---- */
const fanStage = document.getElementById('pr-fan-stage');

if (fanStage) {
    const ANIM_MS = 500;
    let order = Array.from(fanStage.querySelectorAll('.pr-fan__card')); // left-to-right, offset = index - 2
    let animating = false;

    // The centred card (offset 0) is scaled up rather than given a fixed
    // pixel size, so "bigger" always travels with whichever card is
    // currently centred, and the size change animates smoothly along with
    // the rest of the slide instead of snapping.
    const transformFor = (offset) => {
        const tx = offset * 240;
        const ty = Math.abs(offset) * 20;
        const rot = offset * 4;
        const scale = offset === 0 ? 1.24 : Math.abs(offset) === 2 ? 0.92 : Math.abs(offset) > 2 ? 0.85 : 1;
        return `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
    };

    const styleFor = (card, offset, { instant = false } = {}) => {
        card.style.transition = instant
            ? 'none'
            : 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease';
        card.style.transform = transformFor(offset);
        card.style.zIndex = String(10 - Math.abs(offset));
        card.style.opacity = Math.abs(offset) >= 3 ? '0' : Math.abs(offset) === 2 ? '0.9' : '1';
        card.classList.toggle('pr-fan__card--hero', offset === 0);
    };

    order.forEach((card, i) => styleFor(card, i - 2, { instant: true }));

    const go = (dir) => {
        if (animating) return;
        animating = true;

        if (dir === 1) {
            // Card leaving on the left teleports out to the right (offset +3), invisible.
            const leaving = order[0];
            styleFor(leaving, 3, { instant: true });
            leaving.getBoundingClientRect(); // force reflow so the jump applies before animating
            order = [...order.slice(1), leaving];
        } else {
            const leaving = order[order.length - 1];
            styleFor(leaving, -3, { instant: true });
            leaving.getBoundingClientRect();
            order = [leaving, ...order.slice(0, -1)];
        }

        requestAnimationFrame(() => {
            order.forEach((card, i) => styleFor(card, i - 2));
        });

        setTimeout(() => { animating = false; }, ANIM_MS);
    };

    const prevBtn = document.getElementById('pr-fan-prev');
    const nextBtn = document.getElementById('pr-fan-next');

    nextBtn?.addEventListener('click', () => go(1));
    prevBtn?.addEventListener('click', () => go(-1));
}

/* ---- Mobile: featured-projects scroll carousel ---- */
const featuredMTrack = document.getElementById('pr-featured-m-track');
const featuredMPrev = document.getElementById('pr-featured-m-prev');
const featuredMNext = document.getElementById('pr-featured-m-next');

if (featuredMTrack && featuredMPrev && featuredMNext) {
    const scrollByCard = (dir) => {
        const card = featuredMTrack.querySelector('.pr-featured-m__card');
        const gap = parseFloat(getComputedStyle(featuredMTrack).columnGap || 16);
        const amount = card ? card.getBoundingClientRect().width + gap : 280;
        featuredMTrack.scrollBy({ left: dir * amount, behavior: 'smooth' });
    };

    featuredMPrev.addEventListener('click', () => scrollByCard(-1));
    featuredMNext.addEventListener('click', () => scrollByCard(1));
}

/* ---- Let AOS know about nodes cloned/resized above (infinite carousels,
   dashed borders) so scroll-triggered animations account for them ---- */
if (window.AOS) AOS.refresh();
