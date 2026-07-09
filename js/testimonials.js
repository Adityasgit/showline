/* ============================================================
   testimonials.js — lightweight testimonial slider
   Progressive enhancement: without JS the cards still render
   in a horizontal, readable row.
   ============================================================ */
const track = document.getElementById('testimonials-track');
const dotsWrap = document.querySelector('.testimonials__dots');

if (track && dotsWrap) {
    const realSlides = Array.from(track.children);
    const realCount = realSlides.length;

    // Duplicate the set (twice) and append so the strip always stays full — the
    // cards keep flowing under the floating form and the auto-loop is seamless.
    for (let pass = 0; pass < 2; pass++) {
        realSlides.forEach((s) => {
            const clone = s.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    }
    const slides = Array.from(track.children);

    let index = 0;
    let animating = false;

    // One dot per real slide
    const dots = realSlides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        dot.addEventListener('click', () => { goTo(i); start(); });
        dotsWrap.appendChild(dot);
        return dot;
    });

    const syncDots = () => {
        const real = ((index % realCount) + realCount) % realCount;
        dots.forEach((d, di) => d.setAttribute('aria-selected', String(di === real)));
    };

    const goTo = (i, animate = true) => {
        index = i;
        // Shift the track by the leading edge of the target card
        const offset = slides[index].offsetLeft - track.offsetLeft;
        track.style.transition = animate ? '' : 'none';
        track.style.transform = `translateX(${-offset}px)`;
        if (!animate) { void track.offsetHeight; track.style.transition = ''; }
        syncDots();
    };

    // After scrolling a whole set into view, jump back an identical set with no
    // transition so the loop is invisible.
    track.addEventListener('transitionend', (e) => {
        if (e.target !== track || e.propertyName !== 'transform') return;
        animating = false;
        if (index >= realCount) goTo(index - realCount, false);
    });

    const next = () => { if (animating) return; animating = true; goTo(index + 1); };

    // ---- Auto-advance ---- (respects reduced-motion; pauses on hover/focus)
    const AUTO_MS = 4000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => {
        if (reduceMotion || realCount < 2) return;
        stop();
        timer = setInterval(next, AUTO_MS);
    };

    // Keep alignment correct across resizes / breakpoint swaps
    window.addEventListener('resize', () => goTo(index, false));

    // Optional touch swipe
    let startX = null;
    track.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    track.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 40) {
            if (dx < 0) next();
            else if (index > 0) goTo(index - 1);
            start();
        }
        startX = null;
    });

    // Pause auto-scroll while the viewer is hovering or focusing the slider
    const viewport = track.closest('.testimonials__viewport') || track;
    viewport.addEventListener('pointerenter', stop);
    viewport.addEventListener('pointerleave', start);
    viewport.addEventListener('focusin', stop);
    viewport.addEventListener('focusout', start);

    goTo(0, false);
    start();
}

/* ============================================================
   Testimonials Page - centred, elevated-card looping carousel
   The active card sits centred and enlarged; a faded card peeks
   on both sides. First/last clones make the loop seamless so a
   neighbour is always present even with only three real slides.
   ============================================================ */
const tTrack = document.getElementById('t-track');
const tPrev = document.getElementById('t-prev');
const tNext = document.getElementById('t-next');
const tViewport = document.querySelector('.t-carousel__viewport');

if (tTrack && tPrev && tNext && tViewport) {
    const tCarousel = tTrack.closest('.t-carousel');
    const realSlides = Array.from(tTrack.children);
    const realCount = realSlides.length;

    // Edge buffers: clone last before the first and first after the last.
    const firstClone = realSlides[0].cloneNode(true);
    const lastClone = realSlides[realCount - 1].cloneNode(true);
    [firstClone, lastClone].forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-hidden', 'true');
    });
    tTrack.appendChild(firstClone);
    tTrack.insertBefore(lastClone, realSlides[0]);

    const slides = Array.from(tTrack.children); // [lastClone, ...real, firstClone]
    let pos = 1;            // track index of the current slide (real slide 0)
    let animating = false;

    const centerOffset = (slide) => {
        const trackLeft = tTrack.getBoundingClientRect().left;
        const slideRect = slide.getBoundingClientRect();
        const viewportW = tViewport.getBoundingClientRect().width;
        return (slideRect.left - trackLeft) - (viewportW / 2) + (slideRect.width / 2);
    };

    const setActive = (activePos) => {
        slides.forEach((slide, i) => {
            const on = i === activePos;
            slide.classList.toggle('is-active', on);
            slide.setAttribute('aria-hidden', String(!on));
        });
    };

    const place = (animate) => {
        tTrack.style.transition = animate ? '' : 'none';
        tTrack.style.transform = `translateX(${-centerOffset(slides[pos])}px)`;
        if (!animate) {
            void tTrack.offsetHeight; // reflow so the next move can animate
            tTrack.style.transition = '';
        }
    };

    const go = (dir) => {
        if (animating) return;
        animating = true;
        pos += dir;
        setActive(pos);
        place(true);
    };

    // When a clone lands in the centre, snap to its real twin. Freezing the
    // card transitions during the jump makes the swap invisible (no resize/fade).
    tTrack.addEventListener('transitionend', (e) => {
        if (e.target !== tTrack || e.propertyName !== 'transform') return;
        if (pos === slides.length - 1 || pos === 0) {
            pos = pos === 0 ? realCount : 1;
            tCarousel.classList.add('is-snapping');
            place(false);
            setActive(pos);
            void tTrack.offsetHeight; // commit the no-transition state
            tCarousel.classList.remove('is-snapping');
        }
        animating = false;
    });

    tPrev.addEventListener('click', () => go(-1));
    tNext.addEventListener('click', () => go(1));

    window.addEventListener('resize', () => place(false));

    let tStartX = null;
    tTrack.addEventListener('pointerdown', (e) => { tStartX = e.clientX; });
    tTrack.addEventListener('pointerup', (e) => {
        if (tStartX === null) return;
        const dx = e.clientX - tStartX;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        tStartX = null;
    });

    // Centre once layout is ready.
    setActive(pos);
    requestAnimationFrame(() => place(false));
}
