/* ============================================================
   exhibition.js — carousels + FAQ accordion
   (vanilla JS, no dependencies)
   ============================================================ */

/* ---- Scroll reveal: whole-section fade/slide-up, fires once when the
   element is ~20-30% into the viewport ---- */
if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    document.querySelectorAll('.reveal-section').forEach((section) => sectionObserver.observe(section));
} else {
    document.querySelectorAll('.reveal-section').forEach((section) => section.classList.add('is-in'));
}

/* ---- Hero heading: reveal each line independently, staggered 100ms apart ---- */
const heroTitle = document.querySelector('.ex-hero__title');
if (heroTitle) {
    const titleLines = Array.from(heroTitle.querySelectorAll('.ex-hero__title-line'));

    if (titleLines.length && 'IntersectionObserver' in window) {
        const titleObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    titleLines.forEach((line, i) => {
                        window.setTimeout(() => line.classList.add('is-in'), i * 100);
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        titleObserver.observe(heroTitle);
    } else {
        titleLines.forEach((line) => line.classList.add('is-in'));
    }
}

/* ---- Hero paragraphs: reveal in reading order at 300ms / 500ms / 700ms ---- */
const heroText = document.querySelector('.ex-hero__text');
if (heroText) {
    const paragraphs = Array.from(heroText.querySelectorAll('p'));
    const paragraphDelays = [300, 500, 700];

    if (paragraphs.length && 'IntersectionObserver' in window) {
        const textObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    paragraphs.forEach((p, i) => {
                        const delay = paragraphDelays[i] ?? paragraphDelays[paragraphDelays.length - 1] + (i - paragraphDelays.length + 1) * 200;
                        window.setTimeout(() => p.classList.add('is-in'), delay);
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        textObserver.observe(heroText);
    } else {
        paragraphs.forEach((p) => p.classList.add('is-in'));
    }
}

/* ---- Generic "scroll by one card" wiring for a track + prev/next pair ---- */
const wireCarousel = (trackId, prevId, nextId, cardSelector, infinite = false, startIndex = 0, autoPlay = false) => {
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

    // Auto-advance continuously while the track is in view — pauses when it
    // scrolls off-screen, resumes when it scrolls back, and stops for good
    // the moment the user touches it themselves.
    if (autoPlay && 'IntersectionObserver' in window) {
        let autoInterval = null;
        let stoppedByUser = false;

        const stopAutoPlay = () => {
            if (autoInterval) {
                window.clearInterval(autoInterval);
                autoInterval = null;
            }
        };

        const startAutoPlay = () => {
            if (autoInterval || stoppedByUser) return;
            autoInterval = window.setInterval(() => scrollByCard(1), 2000);
        };

        const cancelAutoPlay = () => {
            stoppedByUser = true;
            stopAutoPlay();
        };

        const autoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startAutoPlay();
                } else {
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.25 });

        autoObserver.observe(track);

        ['pointerdown', 'wheel', 'touchstart'].forEach((evt) => {
            track.addEventListener(evt, cancelAutoPlay, { passive: true });
        });
        prevBtn.addEventListener('click', cancelAutoPlay);
        nextBtn.addEventListener('click', cancelAutoPlay);
    }
};

const wireFixedSlotCarousel = (trackId, prevId, nextId, cardSelector, activeSlot = 1) => {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    if (!track || !prevBtn || !nextBtn) return;

    let cards = Array.from(track.querySelectorAll(cardSelector));
    if (!cards.length) return;

    const slot = Math.min(Math.max(activeSlot, 0), cards.length - 1);
    let isAnimating = false;

    const setActiveAt = (activeIndex = slot) => {
        cards.forEach((card, index) => {
            card.classList.toggle('is-active', index === activeIndex);
        });
    };

    const reorder = () => {
        cards.forEach((card) => track.appendChild(card));

        if (window.AOS) AOS.refresh();
    };

    const stepSize = () => {
        const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0;
        return cards[0].getBoundingClientRect().width + gap;
    };

    const rotate = (direction) => {
        // Mobile: this carousel is a simple one-card scroll-snap strip — advance by
        // scrolling one card rather than the desktop transform/grow-active animation.
        if (window.matchMedia('(max-width: 768px)').matches) {
            const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0;
            track.scrollBy({ left: direction * (cards[0].getBoundingClientRect().width + gap), behavior: 'smooth' });
            return;
        }

        if (isAnimating) return;
        isAnimating = true;

        if (direction > 0) {
            const distance = stepSize();

            requestAnimationFrame(() => {
                track.style.transition = 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1)';
                track.style.transform = `translateX(-${distance}px)`;
            });

            window.setTimeout(() => {
                cards = [...cards.slice(1), cards[0]];
                track.style.transition = 'none';
                track.style.transform = 'translateX(0)';
                reorder();

                // Force a reflow so the slide is fully settled before the
                // active card's grow/shrink transition starts — otherwise
                // the resize and the slide run at once and the card jitters.
                void track.offsetHeight;

                requestAnimationFrame(() => {
                    track.style.transition = '';
                    setActiveAt();
                    isAnimating = false;
                });
            }, 420);

            return;
        }

        const distance = stepSize();

        requestAnimationFrame(() => {
            track.style.transition = 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `${distance}px`;
        });

        window.setTimeout(() => {
            cards = [cards[cards.length - 1], ...cards.slice(0, -1)];
            track.style.transition = 'none';
            track.style.transform = 'translateX(0)';
            reorder();

            void track.offsetHeight;

            requestAnimationFrame(() => {
                track.style.transition = '';
                setActiveAt();
                isAnimating = false;
            });
        }, 420);
    };

    prevBtn.addEventListener('click', () => rotate(-1));
    nextBtn.addEventListener('click', () => rotate(1));

    reorder();
    setActiveAt();
};

wireCarousel('ex-serve-track', 'ex-serve-prev', 'ex-serve-next', '.ex-serve-card', true, 0, true);
wireFixedSlotCarousel('ex-services-track', 'ex-services-prev', 'ex-services-next', '.ex-service-card', 1);

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
