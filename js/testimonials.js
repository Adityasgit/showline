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
