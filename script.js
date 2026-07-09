document.addEventListener('DOMContentLoaded', () => {

    // TEXT SPLIT
    document.querySelectorAll('.reveal-text').forEach(el => {
        const text = el.textContent.trim();
        el.innerHTML = text.split(/\s+/).map((w, i) =>
            `<span class="word" style="transition-delay:${i * 80}ms">${w}</span>`
        ).join(' ');
    });

    // PRELOADER 
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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

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

    // ========== 9. MODAL & CSRF ==========
    const modal = document.getElementById('contactModal');
    const closeBtn = document.getElementById('closeModalBtn');

    const openModal = () => { 
        modal.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
    };
    
    const closeModal = () => {
        modal.classList.remove('active'); 
        document.body.style.overflow = '';
        setTimeout(() => { 
            const s = document.getElementById('formStatus'); 
            s.className = 'form-status'; s.textContent = ''; 
            document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        }, 300);
    };
    
    document.querySelectorAll('.open-modal-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openModal(); }));
    closeBtn.addEventListener('click', closeModal);
    
    let isMouseDownOnOverlay = false;
    modal.addEventListener('mousedown', e => { isMouseDownOnOverlay = (e.target === modal); });
    modal.addEventListener('mouseup', e => { 
        if (isMouseDownOnOverlay && e.target === modal) closeModal(); 
        isMouseDownOnOverlay = false;
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // ========== 10. FORM VALIDATION & SUBMISSION ==========
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    const validateForm = () => {
        let isValid = true;
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

        const name = document.getElementById('name');
        if (!name.value.trim()) { name.nextElementSibling.textContent = 'Name is required'; isValid = false; }
        
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) { 
            email.nextElementSibling.textContent = 'Email is required'; isValid = false; 
        } else if (!emailRegex.test(email.value.trim())) {
            email.nextElementSibling.textContent = 'Enter a valid email address'; isValid = false;
        }
        
        const phone = document.getElementById('phone');
        if (!phone.value.trim()) { phone.nextElementSibling.textContent = 'Phone is required'; isValid = false; }
        
        const subject = document.getElementById('subject');
        if (!subject.value.trim()) { subject.nextElementSibling.textContent = 'Subject is required'; isValid = false; }
        
        const message = document.getElementById('message');
        if (!message.value.trim()) { message.nextElementSibling.textContent = 'Message is required'; isValid = false; }

        return isValid;
    };

    // Toast Notification Function
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '<i class="fa-solid fa-circle-check" style="color:var(--gold);"></i>' : '<i class="fa-solid fa-circle-exclamation" style="color:#dc2626;"></i>';
        toast.innerHTML = `${icon} <span>${message}</span>`;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const orig = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        status.className = 'form-status';
        status.textContent = '';
        
        try {
            const formData = new FormData(form);
            const jsonBody = {};
            formData.forEach((value, key) => jsonBody[key] = value);

            const r = await fetch(form.action, { 
                method: 'POST', 
                body: JSON.stringify(jsonBody), 
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } 
            });
            const result = await r.json();
            
            if (result.success) { 
                showToast(result.message || "Thank you! Your message has been sent successfully.", "success");
                form.reset(); 
                closeModal(); // Close modal immediately on success
            } else { 
                showToast(result.message || 'Something went wrong.', "error");
            }
        } catch (error) {
            showToast('Network error. Please try again later.', "error");
        } finally {
            submitBtn.innerHTML = orig; 
            submitBtn.disabled = false;
        }
    });

    // ========== 11. CUSTOM SELECT FOR COUNTRY CODE ==========
    const customSelectWrapper = document.getElementById('customCountrySelect');
    if (customSelectWrapper) {
        const selectElement = customSelectWrapper.querySelector('select');
        
        // Create selected display div
        const selectedDiv = document.createElement('div');
        selectedDiv.setAttribute('class', 'select-selected');
        selectedDiv.innerHTML = `<span>${selectElement.options[selectElement.selectedIndex].innerHTML}</span><i class="fa-solid fa-chevron-down"></i>`;
        customSelectWrapper.appendChild(selectedDiv);
        
        // Create dropdown list div
        const optionsDiv = document.createElement('div');
        optionsDiv.setAttribute('class', 'select-items select-hide');
        
        // Populate options
        for (let i = 0; i < selectElement.length; i++) {
            const optionItem = document.createElement('div');
            optionItem.innerHTML = selectElement.options[i].innerHTML;
            if (i === selectElement.selectedIndex) {
                optionItem.classList.add('same-as-selected');
            }
            
            optionItem.addEventListener('click', function(e) {
                // Update native select
                selectElement.selectedIndex = i;
                
                // Update selected display
                selectedDiv.querySelector('span').innerHTML = this.innerHTML;
                
                // Remove highlight from previous
                const currentSelected = optionsDiv.querySelector('.same-as-selected');
                if (currentSelected) currentSelected.classList.remove('same-as-selected');
                
                // Add highlight to current
                this.classList.add('same-as-selected');
                
                // Close dropdown
                selectedDiv.click();
            });
            optionsDiv.appendChild(optionItem);
        }
        customSelectWrapper.appendChild(optionsDiv);
        
        // Toggle dropdown on click
        selectedDiv.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle('select-hide');
            this.classList.toggle('select-arrow-active');
        });
        
        // Close when clicking outside
        function closeAllSelect(elmnt) {
            const items = document.querySelectorAll('.select-items');
            const selected = document.querySelectorAll('.select-selected');
            for (let i = 0; i < selected.length; i++) {
                if (elmnt !== selected[i]) {
                    selected[i].classList.remove('select-arrow-active');
                }
            }
            for (let i = 0; i < items.length; i++) {
                if (elmnt !== selected[i]) {
                    items[i].classList.add('select-hide');
                }
            }
        }
        document.addEventListener('click', closeAllSelect);
    }
});
