/* ============================================================
   testimonials.js — lightweight testimonial slider
   Progressive enhancement: without JS the cards still render
   in a horizontal, readable row.
   ============================================================ */
const track = document.getElementById('testimonials-track');
const dotsWrap = document.querySelector('.testimonials__dots');

if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let index = 0;

    // Build one dot per slide
    const dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    const goTo = (i) => {
        index = (i + slides.length) % slides.length;
        // Shift the track by the leading edge of the target card
        const offset = slides[index].offsetLeft - track.offsetLeft;
        track.style.transform = `translateX(${-offset}px)`;
        dots.forEach((d, di) => d.setAttribute('aria-selected', String(di === index)));
    };

    // Keep alignment correct across resizes / breakpoint swaps
    window.addEventListener('resize', () => goTo(index));

    // Optional touch swipe
    let startX = null;
    track.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    track.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
        startX = null;
    });

    goTo(0);
}

/* ============================================================
   Testimonials Page - Center-aligned Carousel
   ============================================================ */
const tTrack = document.getElementById('t-track');
const tPrev = document.getElementById('t-prev');
const tNext = document.getElementById('t-next');
const tViewport = document.querySelector('.t-carousel__viewport');

if (tTrack && tPrev && tNext && tViewport) {
    const tSlides = Array.from(tTrack.children);
    let tIndex = 0;

    const getCenterOffset = (slide) => {
        const slideRect = slide.getBoundingClientRect();
        const viewportRect = tViewport.getBoundingClientRect();
        // Calculate offset to center the slide in the viewport
        const offset = (slideRect.left - tTrack.getBoundingClientRect().left) - (viewportRect.width / 2) + (slideRect.width / 2);
        return offset;
    };

    const goT = (i) => {
        tIndex = (i + tSlides.length) % tSlides.length;
        
        // Update classes and ARIA
        tSlides.forEach((slide, idx) => {
            if (idx === tIndex) {
                slide.classList.add('is-active');
                slide.setAttribute('aria-hidden', 'false');
            } else {
                slide.classList.remove('is-active');
                slide.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Shift track to center
        const offset = getCenterOffset(tSlides[tIndex]);
        tTrack.style.transform = `translateX(${-offset}px)`;
    };

    tPrev.addEventListener('click', () => goT(tIndex - 1));
    tNext.addEventListener('click', () => goT(tIndex + 1));

    window.addEventListener('resize', () => goT(tIndex));

    let tStartX = null;
    tTrack.addEventListener('pointerdown', (e) => { tStartX = e.clientX; });
    tTrack.addEventListener('pointerup', (e) => {
        if (tStartX === null) return;
        const dx = e.clientX - tStartX;
        if (Math.abs(dx) > 40) goT(tIndex + (dx < 0 ? 1 : -1));
        tStartX = null;
    });

    // Initial setup needs a tiny delay to ensure layout is complete for bounding rects
    setTimeout(() => goT(0), 50);
}
