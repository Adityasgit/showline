/* ============================================================
   exhibition.js — carousels + FAQ accordion
   (vanilla JS, no dependencies)
   ============================================================ */

/* ---- Generic "scroll by one card" wiring for a track + prev/next pair ---- */
const wireCarousel = (trackId, prevId, nextId, cardSelector, infinite = false, startIndex = 0) => {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    if (!track || !prevBtn || !nextBtn) return;

    let originalCount = track.querySelectorAll(cardSelector).length;
    let cardWidth = 300;
    let gap = 40;
    let setWidth = 0; // width of one full set of original cards (cards + gaps)

    const measure = () => {
        const card = track.querySelector(cardSelector);
        gap = parseFloat(getComputedStyle(track).columnGap || 40) || 40;
        cardWidth = card ? card.getBoundingClientRect().width : 300;
        setWidth = originalCount * (cardWidth + gap);
    };

    if (infinite) {
        const originalCards = Array.from(track.querySelectorAll(cardSelector));
        // Clone a full set before and after so looping in either direction is seamless
        originalCards.forEach((card) => track.insertBefore(card.cloneNode(true), track.firstChild));
        originalCards.forEach((card) => track.appendChild(card.cloneNode(true)));
    }

    measure();

    const jumpTo = (left) => {
        const prevBehavior = track.style.scrollBehavior;
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = left;
        track.style.scrollBehavior = prevBehavior;
    };

    // Start centred on the middle (original) set, offset by startIndex cards
    if (infinite) {
        jumpTo(setWidth + startIndex * (cardWidth + gap));
    }

    const scrollByCard = (dir) => {
        measure();
        track.scrollBy({ left: dir * (cardWidth + gap), behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));

    if (infinite) {
        let scrollEndTimer;
        track.addEventListener('scroll', () => {
            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(() => {
                measure();
                if (setWidth <= 0) return;
                if (track.scrollLeft >= setWidth * 2) {
                    jumpTo(track.scrollLeft - setWidth);
                } else if (track.scrollLeft < setWidth) {
                    jumpTo(track.scrollLeft + setWidth);
                }
            }, 120);
        });

        window.addEventListener('resize', () => {
            measure();
        });
    }
};

wireCarousel('ex-serve-track', 'ex-serve-prev', 'ex-serve-next', '.ex-serve-card', true);
wireCarousel('ex-services-track', 'ex-services-prev', 'ex-services-next', '.ex-service-card', true, 1);

/* ---- SVG dashed borders: size each card's viewBox to its real pixel
   dimensions so the stroke width and corner radius never stretch/distort ---- */
const setupDashedBorders = (cardSelector, borderSelector, rectSelector, radius, stroke) => {
    const cards = Array.from(document.querySelectorAll(cardSelector));
    if (!cards.length) return;

    const sizeBorder = (card) => {
        const svg = card.querySelector(borderSelector);
        const rect = card.querySelector(rectSelector);
        if (!svg || !rect) return;

        const w = card.clientWidth;
        const h = card.clientHeight;
        if (!w || !h) return;

        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        rect.setAttribute('x', stroke / 2);
        rect.setAttribute('y', stroke / 2);
        rect.setAttribute('width', w - stroke);
        rect.setAttribute('height', h - stroke);
        rect.setAttribute('rx', radius);
        rect.setAttribute('ry', radius);
        rect.setAttribute('stroke-width', stroke);
    };

    const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => sizeBorder(entry.target));
    });

    cards.forEach((card) => {
        sizeBorder(card);
        resizeObserver.observe(card);
    });
};

setupDashedBorders('.ex-perform-card', '.ex-perform-card__border', '.ex-perform-card__border-rect', 12, 2);
setupDashedBorders('.ex-service-card', '.ex-service-card__border', '.ex-service-card__border-rect', 14, 1.5);

/* ---- FAQ accordion (single-open) ---- */
const faqList = document.getElementById('ex-faq-list');

if (faqList) {
    const items = Array.from(faqList.querySelectorAll('.ex-faq-item'));

    items.forEach((item) => {
        const header = item.querySelector('.ex-faq-item__header');
        if (!header) return;

        header.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            items.forEach((other) => {
                other.classList.remove('is-open');
                const otherHeader = other.querySelector('.ex-faq-item__header');
                if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                item.classList.add('is-open');
                header.setAttribute('aria-expanded', 'true');
            }

            // FAQ open/close changes page height — let AOS re-measure trigger points
            if (window.AOS) AOS.refresh();
        });
    });
}

/* ---- Let AOS know about nodes cloned/resized above (infinite carousels,
   SVG border sizing) so scroll-triggered animations account for them ---- */
if (window.AOS) AOS.refresh();
