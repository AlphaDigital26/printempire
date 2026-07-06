document.addEventListener('DOMContentLoaded', () => {

    // ========== 1. TEXT SPLIT ==========
    document.querySelectorAll('.reveal-text').forEach(el => {
        const text = el.textContent.trim();
        el.innerHTML = text.split(/\s+/).map((w, i) =>
            `<span class="word" style="transition-delay:${i * 80}ms">${w}</span>`
        ).join(' ');
    });

    // ========== 2. PRELOADER ==========
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.getElementById('navbar').classList.add('visible');
        // Trigger hero reveals
        document.querySelectorAll('#hero .reveal-text, #hero .reveal-fade, #hero .reveal-scale').forEach(el => {
            const delay = parseInt(el.dataset.delay || 0);
            setTimeout(() => el.classList.add('visible'), delay);
        });
        // Hero image subtle zoom
        const heroImg = document.querySelector('.hero-visual img');
        if (heroImg) setTimeout(() => heroImg.classList.add('zoomed'), 200);
    }, 2200);

    // ========== 3. SCROLL REVEALS ==========
    const reveals = document.querySelectorAll('.reveal-text, .reveal-fade, .reveal-scale');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay || 0);
                setTimeout(() => entry.target.classList.add('visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach(el => {
        if (!el.closest('#hero')) observer.observe(el);
    });

    // ========== 4. NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // ========== 5. SCROLL PROGRESS ==========
    const progressFill = document.getElementById('progressFill');
    window.addEventListener('scroll', () => {
        const top = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        progressFill.style.width = height > 0 ? (top / height * 100) + '%' : '0%';
    }, { passive: true });

    // ========== 6. COUNTER ANIMATION ==========
    const counters = document.querySelectorAll('.counter[data-count]');
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                counterObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObs.observe(el));

    function animate(el) {
        const target = parseInt(el.dataset.count);
        const dur = 2000;
        const start = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    // ========== 7. GROWTH BARS ==========
    const bars = document.querySelectorAll('.growth-fill');
    const barObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.width + '%';
                barObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    bars.forEach(b => barObs.observe(b));

    // ========== 8. SMOOTH ANCHORS ==========
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const t = document.querySelector(link.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    // ========== 9. MODAL ==========
    const modal = document.getElementById('contactModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const openModal = () => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeModal = () => {
        modal.classList.remove('active'); document.body.style.overflow = '';
        setTimeout(() => { const s = document.getElementById('formStatus'); s.className = 'form-status'; s.textContent = ''; }, 300);
    };
    document.querySelectorAll('.open-modal-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openModal(); }));
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // ========== 10. FORM ==========
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orig = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        try {
            const r = await fetch(form.action, { method:'POST', body:new FormData(form), headers:{'Accept':'application/json'} });
            if (r.ok) { status.textContent = "Thanks! We'll get back to you soon."; status.className = 'form-status success'; form.reset(); }
            else { status.textContent = 'Something went wrong.'; status.className = 'form-status error'; }
        } catch {
            setTimeout(() => { status.textContent = 'Demo: Message simulated!'; status.className = 'form-status success'; form.reset(); }, 600);
        } finally {
            submitBtn.innerHTML = orig; submitBtn.disabled = false;
            if (status.classList.contains('success')) setTimeout(closeModal, 2500);
        }
    });
});
