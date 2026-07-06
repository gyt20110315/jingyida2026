/* ============================================================
   无锡精艺达科技有限公司 - Main JavaScript
   Wuxi Jingyida Technology Co., Ltd.
   ============================================================ */

const JYD = {

  // ---- Configuration ----
  config: {
    particleCount: 70,
    connectionDistance: 150,
    revealThreshold: 0.12,
    revealRootMargin: '0px 0px -40px 0px',
    counterDuration: 2200,
    tiltMaxDegrees: 10,
    navScrollThreshold: 60,
  },

  // ---- Initialization ----
  init() {
    JYD.Loader.init();
    JYD.Nav.init();
    JYD.Nav.highlightActivePage();
    JYD.Reveal.init();
    JYD.Counters.init();
    JYD.Parallax.init();
    JYD.Tilt.init();
    JYD.PageTransitions.init();
    JYD.BackToTop.init();

    // Page-specific
    if (document.getElementById('hero-canvas')) {
      JYD.HeroParticles.init('hero-canvas');
    }
    if (document.getElementById('particles-canvas')) {
      JYD.ParticlesBg.init('particles-canvas');
    }
    if (document.querySelector('.timeline')) {
      JYD.Timeline.init();
    }
    if (document.getElementById('equip-modal')) {
      JYD.EquipmentModal.init();
    }
    if (document.getElementById('contact-form')) {
      JYD.ContactForm.init();
    }

    JYD.SectionHints.init();
    JYD.PageJump.init();
    JYD.Utils.attachScrollListeners();
  },

  // ================================================================
  // ---- Loader (Simple & Reliable) ----
  // ================================================================
  Loader: {
    init() {
      var loader = document.getElementById('loader');
      if (!loader) return;

      var ringFill = loader.querySelector('.loader-ring-fill');
      var percentEl = loader.querySelector('.loader-percent');
      var circumference = 408;
      var progress = 0;

      if (ringFill) {
        ringFill.style.strokeDasharray = circumference;
        ringFill.style.strokeDashoffset = circumference;
      }

      function setProgress(val) {
        progress = val;
        if (ringFill) {
          ringFill.style.strokeDashoffset = circumference - (val/100)*circumference;
        }
        if (percentEl) {
          percentEl.innerHTML = val + '<sup>%</sup>';
        }
      }

      // Animate progress with simple timeouts
      function step(val, delay) {
        setTimeout(function() { setProgress(val); }, delay);
      }
      step(15, 150);
      step(35, 400);
      step(55, 700);
      step(72, 1100);
      step(85, 1600);
      step(94, 2200);
      step(99, 2800);

      function hideLoader() {
        setProgress(100);
        setTimeout(function() {
          loader.classList.add('hidden');
          document.body.classList.add('loaded');
        }, 400);
      }

      // Hide on window.load
      if (document.readyState === 'complete') {
        hideLoader();
      } else {
        window.addEventListener('load', hideLoader);
      }

      // Hard fallback
      setTimeout(function() {
        if (loader && !loader.classList.contains('hidden')) {
          hideLoader();
        }
      }, 4000);
    },
  },

  // ================================================================
  // ---- Navigation ----
  // ================================================================
  Nav: {
    init() {
      this.header = document.querySelector('header');
      this.menuToggle = document.querySelector('.menu-toggle');
      this.navLinks = document.querySelector('.nav-links');
      this.progressBar = document.getElementById('scroll-progress');

      if (this.menuToggle) {
        this.menuToggle.addEventListener('click', () => this.toggleMobile());
      }
      if (this.navLinks) {
        this.navLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => this.closeMobile());
        });
      }

      // Mouse proximity elastic effect
      var self = this;
      document.addEventListener('mousemove', function(e) {
        if (!self.header) return;
        var proximityZone = 120;
        if (e.clientY < proximityZone) {
          self.header.classList.add('nav-near');
        } else {
          self.header.classList.remove('nav-near');
        }
      });
    },

    handleScroll() {
      if (!this.header) return;
      const scrollY = window.scrollY;
      this.header.classList.toggle('scrolled', scrollY > JYD.config.navScrollThreshold);

      if (this.progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const progress = Math.min((scrollY / docHeight) * 100, 100);
          this.progressBar.style.width = progress + '%';
        }
      }
    },

    toggleMobile() {
      this.menuToggle.classList.toggle('active');
      this.navLinks.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    },

    closeMobile() {
      if (this.menuToggle) this.menuToggle.classList.remove('active');
      if (this.navLinks) this.navLinks.classList.remove('active');
      document.body.classList.remove('menu-open');
    },

    highlightActivePage() {
      const path = window.location.pathname;
      const page = path.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });
    },
  },

  // ================================================================
  // ---- Scroll Reveal (IntersectionObserver) ----
  // ================================================================
  Reveal: {
    init() {
      const revealEls = document.querySelectorAll('.reveal, .reveal-fast, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur');
      const staggerEls = document.querySelectorAll('.reveal-stagger, .reveal-stagger-slow');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: JYD.config.revealThreshold,
        rootMargin: JYD.config.revealRootMargin,
      });

      revealEls.forEach(el => observer.observe(el));
      staggerEls.forEach(el => observer.observe(el));
    },
  },

  // ================================================================
  // ---- Counter Animation ----
  // ================================================================
  Counters: {
    init() {
      this.counters = document.querySelectorAll('.stat-number[data-target]');
      if (!this.counters.length) return;
      this.animated = new Set();

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated.has(entry.target)) {
            this.animate(entry.target);
            this.animated.add(entry.target);
          }
        });
      }, { threshold: 0.4 });

      this.counters.forEach(el => observer.observe(el));
    },

    animate(el) {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = (target % 1 !== 0) ? 2 : 0;
      const start = performance.now();

      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / JYD.config.counterDuration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = prefix + target + suffix;
        }
      };
      requestAnimationFrame(update);
    },
  },

  // ================================================================
  // ---- 3D Tilt Effect ----
  // ================================================================
  Tilt: {
    init() {
      this.cards = document.querySelectorAll('[data-tilt]');
      if (!this.cards.length) return;

      this.cards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.addEventListener('mousemove', (e) => this.handleMove(e, card));
        card.addEventListener('mouseleave', () => this.handleLeave(card));
      });
    },

    handleMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxDeg = JYD.config.tiltMaxDegrees;

      const rotateX = ((y - centerY) / centerY) * -maxDeg;
      const rotateY = ((x - centerX) / centerX) * maxDeg;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;

      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(200,164,92,0.15), transparent 50%)`;
      }
    },

    handleLeave(card) {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      const glow = card.querySelector('.card-glow');
      if (glow) glow.style.background = 'transparent';
    },
  },

  // ================================================================
  // ---- Hero Interactive Particle System ----
  // ================================================================
  HeroParticles: {
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.trailParticles = [];   // mouse trail particles
      this.mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000 };
      this.smoothMouse = { x: -1000, y: -1000 };
      this.mouseSpeed = 0;
      this.time = 0;
      this.animId = null;

      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Track mouse with velocity
      this.canvas.addEventListener('mousemove', (e) => {
        this.mouse.prevX = this.mouse.x;
        this.mouse.prevY = this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // Calculate mouse speed for dynamic effects
        const dx = this.mouse.x - this.mouse.prevX;
        const dy = this.mouse.y - this.mouse.prevY;
        this.mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy), 60);

        // Spawn trail particles when mouse moves fast enough
        if (this.mouseSpeed > 3 && this.mouse.x > 0) {
          const spawnCount = Math.floor(this.mouseSpeed / 4);
          for (let i = 0; i < spawnCount; i++) {
            this.trailParticles.push(new JYD.HeroParticles.TrailParticle(
              this.mouse.x + (Math.random() - 0.5) * 10,
              this.mouse.y + (Math.random() - 0.5) * 10,
              this.mouseSpeed
            ));
          }
        }
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.mouseSpeed = 0;
      });

      // Also track on the whole document for better responsiveness when mouse is over hero
      const hero = document.getElementById('hero');
      if (hero) {
        hero.addEventListener('mousemove', (e) => {
          this.mouse.prevX = this.mouse.x;
          this.mouse.prevY = this.mouse.y;
          this.mouse.x = e.clientX;
          this.mouse.y = e.clientY;
          const dx = this.mouse.x - this.mouse.prevX;
          const dy = this.mouse.y - this.mouse.prevY;
          this.mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy), 60);
          if (this.mouseSpeed > 3 && this.mouse.x > 0) {
            const spawnCount = Math.floor(this.mouseSpeed / 4);
            for (let i = 0; i < spawnCount; i++) {
              this.trailParticles.push(new JYD.HeroParticles.TrailParticle(
                this.mouse.x + (Math.random() - 0.5) * 10,
                this.mouse.y + (Math.random() - 0.5) * 10,
                this.mouseSpeed
              ));
            }
          }
        });
      }

      const count = window.innerWidth < 768 ? 40 : 80;
      for (let i = 0; i < count; i++) {
        this.particles.push(new JYD.HeroParticles.Particle(this.canvas.width, this.canvas.height));
      }

      this.animate();

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cancelAnimationFrame(this.animId);
        } else {
          this.animate();
        }
      });
    },

    resize() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
    },

    animate() {
      this.animId = requestAnimationFrame(() => this.animate());
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.time += 0.016;

      // Smooth mouse position (lerp)
      this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * 0.12;
      this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * 0.12;

      // 1. Draw ambient particles
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update(this.smoothMouse, this.mouseSpeed, this.canvas.width, this.canvas.height);
        this.particles[i].draw(this.ctx);
      }

      // 2. Draw connections between particles
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < JYD.config.connectionDistance) {
            // Base opacity fades with distance
            let opacity = (1 - dist / JYD.config.connectionDistance) * 0.2;

            // Boost opacity for connections near the mouse
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const mouseDx = this.smoothMouse.x - midX;
            const mouseDy = this.smoothMouse.y - midY;
            const distToMouse = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
            if (distToMouse < 220) {
              opacity += (1 - distToMouse / 220) * 0.4;
            }

            // Width boost near mouse
            let lineWidth = 0.5;
            if (distToMouse < 180) {
              lineWidth = 0.5 + (1 - distToMouse / 180) * 1.5;
            }

            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.strokeStyle = `rgba(200, 164, 92, ${opacity})`;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
          }
        }
      }

      // 3. Connect nearby particles to mouse cursor
      if (this.smoothMouse.x > 0 && this.smoothMouse.y > 0) {
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];
          const dx = this.smoothMouse.x - p.x;
          const dy = this.smoothMouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            const opacity = (1 - dist / 200) * 0.35;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(this.smoothMouse.x, this.smoothMouse.y);
            this.ctx.strokeStyle = `rgba(212, 184, 122, ${opacity})`;
            this.ctx.lineWidth = 0.6;
            this.ctx.stroke();
          }
        }

        // 4. Draw cursor glow
        const glowRadius = 100 + Math.sin(this.time * 2) * 15;
        const glow = this.ctx.createRadialGradient(
          this.smoothMouse.x, this.smoothMouse.y, 0,
          this.smoothMouse.x, this.smoothMouse.y, glowRadius
        );
        glow.addColorStop(0, 'rgba(200, 164, 92, 0.08)');
        glow.addColorStop(0.4, 'rgba(200, 164, 92, 0.03)');
        glow.addColorStop(1, 'rgba(200, 164, 92, 0)');
        this.ctx.beginPath();
        this.ctx.arc(this.smoothMouse.x, this.smoothMouse.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = glow;
        this.ctx.fill();

        // 5. Inner cursor ring
        const ringRadius = 4 + this.mouseSpeed * 0.4;
        const ringAlpha = 0.3 + this.mouseSpeed * 0.01;
        this.ctx.beginPath();
        this.ctx.arc(this.smoothMouse.x, this.smoothMouse.y, ringRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(200, 164, 92, ${Math.min(ringAlpha, 0.7)})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // 6. Outer pulse ring
        const pulsePhase = (this.time * 1.5) % (Math.PI * 2);
        const pulseRadius = 15 + Math.sin(pulsePhase) * 10;
        const pulseAlpha = 0.15 - (pulseRadius - 15) * 0.01;
        this.ctx.beginPath();
        this.ctx.arc(this.smoothMouse.x, this.smoothMouse.y, pulseRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(200, 164, 92, ${Math.max(pulseAlpha, 0.02)})`;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
      }

      // 7. Draw mouse trail particles
      for (let i = this.trailParticles.length - 1; i >= 0; i--) {
        const tp = this.trailParticles[i];
        tp.update();
        tp.draw(this.ctx);
        if (tp.life <= 0) {
          this.trailParticles.splice(i, 1);
        }
      }

      // Limit trail particles
      if (this.trailParticles.length > 100) {
        this.trailParticles.splice(0, this.trailParticles.length - 100);
      }
    },

    // ---- Ambient Particle ----
    Particle: class {
      constructor(w, h) {
        this.canvasW = w;
        this.canvasH = h;
        this.reset(true);
        // Add personal phase for organic movement
        this.phase = Math.random() * Math.PI * 2;
      }

      reset(initial = false) {
        this.x = Math.random() * this.canvasW;
        this.y = initial ? Math.random() * this.canvasH : -10;
        this.size = Math.random() * 2.5 + 0.6;
        this.baseSpeed = Math.random() * 0.35 + 0.12;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = this.baseSpeed;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.vx = 0; // velocity from mouse repulsion
        this.vy = 0;
        const colors = ['200, 164, 92', '212, 184, 122', '184, 115, 90', '220, 200, 155'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(smoothMouse, mouseSpeed, cw, ch) {
        this.canvasW = cw;
        this.canvasH = ch;

        // Base drift upward
        this.y -= this.speedY;
        this.x += this.speedX;

        // Mouse REPULSION — particles are pushed away from cursor
        const dx = this.x - smoothMouse.x;
        const dy = this.y - smoothMouse.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 160;

        if (distToMouse < repelRadius && distToMouse > 0.1) {
          // Push force: stronger when closer to mouse, amplified by mouse speed
          const forceBase = (1 - distToMouse / repelRadius);
          const force = forceBase * forceBase * 2.5; // quadratic falloff
          const speedBoost = 1 + mouseSpeed * 0.03;

          const nx = dx / distToMouse; // direction away from mouse
          const ny = dy / distToMouse;

          this.vx += nx * force * 0.5 * speedBoost;
          this.vy += ny * force * 0.5 * speedBoost;

          // Brighten particle near mouse
          this.targetOpacity = Math.min(this.opacity + forceBase * 0.5, 0.9);
        } else {
          this.targetOpacity = this.opacity;
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Damping — velocities decay
        this.vx *= 0.9;
        this.vy *= 0.9;

        // Clamp velocities
        const maxVel = 4;
        const vel = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (vel > maxVel) {
          this.vx = (this.vx / vel) * maxVel;
          this.vy = (this.vy / vel) * maxVel;
        }

        // Gently restore opacity
        if (this.currentOpacity === undefined) this.currentOpacity = this.opacity;
        this.currentOpacity += (this.targetOpacity - this.currentOpacity) * 0.1;

        // Wrap around edges
        if (this.y < -30) { this.y = this.canvasH + 20; this.x = Math.random() * this.canvasW; }
        if (this.y > this.canvasH + 30) { this.y = -20; this.x = Math.random() * this.canvasW; }
        if (this.x < -30) this.x = this.canvasW + 20;
        if (this.x > this.canvasW + 30) this.x = -20;
      }

      draw(ctx) {
        const alpha = this.currentOpacity !== undefined ? this.currentOpacity : this.opacity;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i + this.phase * 0.1;
          const px = this.x + this.size * Math.cos(angle);
          const py = this.y + this.size * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
        ctx.fill();
      }
    },

    // ---- Mouse Trail Particle ----
    TrailParticle: class {
      constructor(x, y, speed) {
        this.x = x + (Math.random() - 0.5) * 6;
        this.y = y + (Math.random() - 0.5) * 6;
        // Explode outward from cursor
        const angle = Math.random() * Math.PI * 2;
        const vel = Math.random() * speed * 0.3 + 0.5;
        this.vx = Math.cos(angle) * vel;
        this.vy = Math.sin(angle) * vel - Math.random() * 1.5; // slight upward bias
        this.life = 1.0;
        this.decay = 0.01 + Math.random() * 0.04;
        this.size = Math.random() * 2 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.life -= this.decay;
        this.size *= 0.995;
      }

      draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life * 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 184, 122, ${alpha})`;
        ctx.fill();
      }
    },
  },

  // ================================================================
  // ---- Background Particle System (subtle) ----
  // ================================================================
  ParticlesBg: {
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.animId = null;

      this.resize();
      window.addEventListener('resize', () => this.resize());

      const count = window.innerWidth < 768 ? 25 : 50;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedY: Math.random() * 0.2 + 0.05,
          speedX: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.35 + 0.05,
        });
      }

      this.animate();

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(this.animId);
        else this.animate();
      });
    },

    resize() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
    },

    animate() {
      this.animId = requestAnimationFrame(() => this.animate());
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const p of this.particles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < -10) { p.y = this.canvas.height + 10; p.x = Math.random() * this.canvas.width; }
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(200, 164, 92, ${p.opacity})`;
        this.ctx.fill();
      }
    },
  },

  // ================================================================
  // ---- Parallax Effects ----
  // ================================================================
  Parallax: {
    init() {
      this.elements = document.querySelectorAll('[data-parallax]');
    },

    update(scrollY) {
      this.elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const offset = scrollY * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    },
  },

  // ================================================================
  // ---- Page Transitions ----
  // ================================================================
  PageTransitions: {
    init() {
      var self = this;
      document.querySelectorAll('a[href]').forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
        if (link.hasAttribute('target') || link.hasAttribute('download')) return;

        link.addEventListener('click', function(e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          self.transitionOut(href);
        });
      });

      // Page entrance: slide up
      document.body.classList.add('page-enter');
      setTimeout(function() {
        document.body.classList.add('page-enter-active');
      }, 50);
    },

    transitionOut(href) {
      document.body.classList.add('page-exit');
      setTimeout(function() {
        window.location.href = href;
      }, 350);
    },
  },

  // ================================================================
  // ---- Back to Top ----
  // ================================================================
  BackToTop: {
    init() {
      this.btn = document.getElementById('back-to-top');
      if (!this.btn) return;

      this.btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Show/hide handled in scroll listener
      this.originalHandleScroll = JYD.Nav.handleScroll.bind(JYD.Nav);
      const self = this;
      JYD.Nav.handleScroll = function() {
        JYD.Nav.__proto__.handleScroll.call(JYD.Nav);
        if (self.btn) {
          self.btn.classList.toggle('visible', window.scrollY > 400);
        }
      };
    },
  },

  // ================================================================
  // ---- Timeline Component ----
  // ================================================================
  Timeline: {
    init() {
      this.items = document.querySelectorAll('.timeline-item');
      this.line = document.querySelector('.timeline-line-fill');
      if (!this.items.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.25 });

      this.items.forEach(item => observer.observe(item));
    },

    updateLine(scrollY) {
      if (!this.line || !this.items.length) return;
      const firstRect = this.items[0].getBoundingClientRect();
      const lastRect = this.items[this.items.length - 1].getBoundingClientRect();
      const startY = firstRect.top + firstRect.height / 2;
      const endY = lastRect.top + lastRect.height / 2;
      const current = window.innerHeight * 0.75;
      const progress = JYD.Utils.clamp((current - startY) / (endY - startY), 0, 1);
      this.line.style.transform = `scaleY(${progress})`;
    },
  },

  // ================================================================
  // ---- Equipment Detail Modal ----
  // ================================================================
  EquipmentModal: {
    machines: {
      qtn200ms: { name:'马扎克双主轴车铣 QTN200ms', cat:'车铣复合', brand:'Mazak — 日本', desc:'日本Mazak旗舰级双主轴车铣复合机床，搭载Mazatrol对话式编程系统，操作直观高效。上下刀塔配合可调角度动力头，在一次装夹中完成外圆车削、端面铣削、钻孔、攻牙及键槽加工，彻底消除多次装夹带来的定位误差。尤其擅长航空航天精密轴类、半导体设备真空腔体和高端汽车传动部件的批量生产，单件加工周期平均缩短40%以上。', specs:[['最大加工直径','Ø380 mm'],['最大加工长度','500 mm'],['主轴转速','5,000 rpm'],['铣削转速','6,000 rpm'],['刀库容量','12 工位'],['主轴通孔','Ø65 mm'],['控制系统','Mazatrol 640T']]},
      md08d: { name:'现代威亚 MD08D 车铣复合', cat:'车铣复合', brand:'Hyundai WIA — 韩国', desc:'韩国现代威亚经典车铣复合机型，采用整体式45°斜床身结构，热对称设计有效抵消切削热变形。搭载FANUC 0i-TF数控系统与伺服动力刀塔，可在车削循环中同步完成端面铣削与径向钻孔。紧凑的占地面积使其特别适合产线布局优化，广泛应用于汽车零部件、液压阀芯及精密连接器的批量加工。', specs:[['最大车削直径','Ø350 mm'],['最大车削长度','400 mm'],['主轴转速','4,500 rpm'],['铣削转速','5,000 rpm'],['控制系统','FANUC 0i-TF'],['刀塔工位','12 工位']]},
      md08dy: { name:'现代威亚 MD08DY 车铣复合', cat:'车铣复合', brand:'Hyundai WIA — 韩国', desc:'MD08D的Y轴增强型号，在标准X/Z轴基础上增加±50mm的Y轴行程，使机床具备偏心铣削、偏置钻孔和端面轮廓加工能力。搭配可编程液压尾座，长轴类零件装夹更加便捷。FANUC 0i-TF系统内置高速高精控制功能，在复杂轮廓加工中兼顾表面质量与加工效率。', specs:[['最大车削直径','Ø350 mm'],['Y轴行程','±50 mm'],['主轴转速','4,500 rpm'],['控制系统','FANUC 0i-TF'],['动力刀具','12 工位'],['尾座','可编程液压']]},
      goodway: { name:'程泰车铣中心', cat:'车铣复合', brand:'Goodway 台湾程泰', desc:'台湾程泰机械股份有限公司出品的高精密车铣复合加工中心。床身采用米汉纳高级铸铁经二次回火处理，结构刚性与吸震性俱佳，确保长期加工精度稳定性。动力刀塔搭载伺服驱动，响应速度快、定位精度高，可在单次装夹中完成车削、铣削、钻孔与刚性攻牙的完整加工流程。', specs:[['最大加工直径','Ø400 mm'],['加工长度','600 mm'],['主轴转速','4,000 rpm'],['动力刀转速','5,000 rpm'],['产地','台湾'],['应用','精密轴类/盘类']]},
      vcn510cl: { name:'马扎克 VCN-510C L', cat:'加工中心', brand:'Mazak — 日本', desc:'日本Mazak高性能立式加工中心，配备精密液压第四轴旋转工作台，实现四轴联动加工能力。Mazatrol Matrix Nexus 2数控系统搭载智能热补偿功能，实时监测并修正主轴与滚珠丝杠的热位移，确保长时间的加工精度稳定性。30把刀库支持复杂零件的多工序连续加工，广泛应用于航空航天结构件与高端装备基础零部件的精密镗铣作业。', specs:[['工作台','1,300×550 mm'],['XYZ行程','1,050/510/510 mm'],['主轴转速','12,000 rpm'],['快进速度','36 m/min'],['刀库','30 把'],['定位精度','±0.002 mm']]},
      f500: { name:'五轴加工中心 F500', cat:'加工中心', brand:'国产高端五轴', desc:'高性能五轴联动加工中心，A轴摆动范围+30°至-120°、C轴360°连续旋转，可一次装夹完成复杂异形件的五面体加工。特别适用于航空发动机整体叶盘、叶片、涡轮转子等自由曲面的精密铣削，也广泛应用于半导体设备关键结构件与医疗器械植入物的高精度制造。60把刀库搭配高速主轴，兼顾粗加工的高效率与精加工的超高表面质量。', specs:[['工作台','Ø500 mm'],['XYZ行程','500/500/400 mm'],['A/C轴','+30°~-120°/360°'],['主轴转速','15,000 rpm'],['刀库','60 把'],['重复精度','±0.0015 mm']]},
      brother: { name:'兄弟四轴加工中心', cat:'加工中心', brand:'Brother SPEEDIO — 日本', desc:'日本Brother工业SPEEDIO系列高速加工中心，以"速度就是生产力"为设计理念。BT30锥度主轴实现高转速、低惯量的快速启停，配合56m/min的高速进给系统，非切削时间大幅压缩。搭载第四轴旋转工作台后，可在一次装夹中完成多面加工。尤其擅长铝合金、工程塑料等轻金属的高速精密加工，是3C电子、汽车零部件等大批量生产线的理想选择。', specs:[['主轴锥度','BT30'],['主轴转速','16,000 rpm'],['XYZ行程','500/400/300 mm'],['快进速度','56 m/min'],['刀库','14/21 把'],['四轴','旋转工作台']]},
      m08j: { name:'M08J 精密车床', cat:'CNC车床', brand:'FANUC — 日本', desc:'搭载FANUC数控系统的精密平床身CNC车床，主轴采用高精度角接触球轴承组，径向与轴向刚度优异。紧凑的机身设计不牺牲加工能力，适合中小型回转体零件的IT6级精密车削。从单件试制到批量生产的柔性切换简单快捷，广泛应用于精密轴套、定位销、连接器等零件的加工。', specs:[['最大车削直径','Ø280 mm'],['加工长度','350 mm'],['主轴转速','5,000 rpm'],['控制系统','FANUC'],['精度','IT6'],['类型','平床身结构']]},
      m10j: { name:'M10J 精密车床', cat:'CNC车床', brand:'FANUC — 日本', desc:'M08J的加大型号，在保持同等精度水平的前提下提供更宽广的加工范围。FANUC数控系统内置多种固定循环指令，编程效率高、操作上手快。主轴通孔直径适配更大棒料，适合液压阀体、传动轴套、法兰盘等中大型回转体零件的IT6级精密车削与批量生产。', specs:[['最大车削直径','Ø360 mm'],['加工长度','500 mm'],['主轴转速','4,000 rpm'],['控制系统','FANUC'],['精度','IT6'],['类型','平床身结构']]},
      goodwaylathe: { name:'程泰精密车床', cat:'CNC车床', brand:'Goodway 台湾程泰', desc:'台湾程泰高精密CNC车床，米汉纳铸铁床身经两次回火与自然时效处理，内部应力充分释放，长期使用不变形。主轴箱采用对称散热设计，配合自动润滑系统，连续运转温升控制在极小范围。广泛应用于汽车零部件、液压阀体、精密轴套等回转体零件的IT6级高一致性批量加工。', specs:[['最大加工直径','Ø350 mm'],['加工长度','500 mm'],['主轴转速','4,500 rpm'],['产地','台湾'],['精度','IT6'],['应用','轴类/盘类件']]},
      ss327: { name:'SS327 走心机', cat:'走心机', brand:'Swiss-type CNC', desc:'瑞士型走心式CNC自动车床，采用导套支撑结构，工件在加工过程中始终受到导套的径向约束，从根本上解决了细长轴类零件的让刀变形问题。主轴与副主轴同步对接实现自动接料，一次送料即可完成车削、钻孔、攻牙、铣削与切断的全部工序。最小可加工孔径达Ø0.3mm，是医疗器械骨钉、钟表机芯零件、光纤连接器等微型精密件的核心加工装备。', specs:[['最大加工直径','Ø20 mm'],['主轴转速','10,000 rpm'],['刀具数量','22 把'],['最小孔径','Ø0.3 mm'],['类型','瑞士型导套式'],['适用领域','医疗/钟表/电子']]},
      bw209zj: { name:'BW209ZJ 走心机', cat:'走心机', brand:'Swiss-type CNC', desc:'高性能瑞士型走心机，配备旋转导套结构，允许导套与主轴同步旋转，进一步提升细长零件的加工圆度与表面质量。主轴转速高达12,000rpm，配合25把刀具的丰富配置，可处理长径比超过10:1的复杂微型零件。优异的床身热稳定性确保长时间连续加工中尺寸波动控制在微米级，广泛用于高端医疗器械、航空航天精密紧固件及微型传感器的批量制造。', specs:[['最大加工直径','Ø20 mm'],['主轴转速','12,000 rpm'],['刀具数量','25 把'],['导套结构','旋转同步导套'],['精度','IT5'],['长径比','>10:1']]},
      zeiss: { name:'蔡司全自动扫描三坐标', cat:'检测设备', brand:'ZEISS — 德国', desc:'德国卡尔·蔡司工业测量事业部旗舰级全自动扫描三坐标测量机。搭载VAST XT gold主动式扫描测头，支持单点触发与连续扫描双模式，可自动识别零件特征并生成最优测量路径。测量精度MPEE≤1.5+L/350μm，满足AS9100航空质量管理体系中首件检验(FAI)的严苛要求。CALYPSO测量软件自动生成可视化检测报告，为每一件精密零部件的出厂质量提供权威背书。', specs:[['精度MPEE','≤1.5+L/350 μm'],['测量模式','接触式+连续扫描'],['最大速度','500 mm/s'],['品牌','德国蔡司 ZEISS'],['软件','CALYPSO'],['认证','AS9100 FAI兼容']]},
      tesa: { name:'TESA 手动三坐标', cat:'检测设备', brand:'TESA — 瑞士', desc:'瑞士TESA精密手动三坐标测量机，传承瑞士精密机械制造的工匠精神。采用天然花岗岩工作台与空气轴承导轨，移动轻便顺滑且无磨损。测头系统灵敏度高、重复性好，适合中小型精密零件的日常尺寸检测。操作门槛低、维护简单、坚固耐用，是生产现场快速品质验证的可靠伙伴。', specs:[['精度','±2.5 μm'],['测量范围','中小型零件'],['操作方式','手动'],['品牌','瑞士TESA'],['材质','花岗岩+空气轴承'],['特点','高耐用低维护']]},
      spectrometer: { name:'直读光谱仪', cat:'检测设备', brand:'光电直读式', desc:'光电直读光谱仪采用电弧/火花激发光源，可在30秒内完成金属材料中20余种元素的定量分析，包括C、Si、Mn、Cr、Ni、Mo、Ti等关键元素的精确含量。支持铁基、铝基、铜基、钛基等多种基体材料的牌号自动鉴定。每一批入厂原材料均经光谱仪验证化学成分与牌号一致性，从源头杜绝混料风险，满足航空、军工与半导体行业对材料追溯的严格要求。', specs:[['分析时间','<30 秒/样'],['检测元素','20+ 种'],['适用基体','Fe/Al/Cu/Ti等'],['精度','±0.01%'],['牌号库','内置2000+牌号'],['标准','ASTM E415']]},
      profilometer: { name:'轮廓度仪', cat:'检测设备', brand:'接触式精密测量', desc:'高精度接触式轮廓度测量仪，采用金刚石触针沿零件表面匀速滑行，以0.001μm的垂直分辨率记录轮廓轨迹。可测量台阶高度、圆弧半径、沟槽深度、角度等微观几何参数，自动计算实际轮廓与理论轮廓的偏差值。配合专用分析软件，生成符合ISO 4287标准的轮廓度评定报告，是精密加工件形状精度验证不可或缺的检测工具。', specs:[['分辨率','0.001 μm'],['测量力','0.75 mN'],['类型','接触式触针法'],['功能','轮廓/台阶/半径/角度'],['标准','ISO 4287'],['应用','精密加工件形状评定']]},
      roughness: { name:'粗糙度仪', cat:'检测设备', brand:'便携式表面检测', desc:'便携式表面粗糙度测量仪，内置高灵敏度电感式传感器，可快速测量Ra、Rz、Rq、Rt等多种粗糙度参数。测量范围覆盖0.01μm至10μm，兼顾镜面级精密表面与一般加工表面的检测需求。小巧轻便的机身设计使其既可用于计量室的精密分析，也适用于车间现场的快速巡检，确保每一道工序的表面质量达标。', specs:[['测量参数','Ra/Rz/Rq/Rt等'],['Ra范围','0.01~10 μm'],['精度','±5%'],['类型','便携式'],['标准','ISO 4287/GB/T 1031'],['适用场景','现场+实验室']]},
      grinder: { name:'进口五轴磨刀机', cat:'辅助设备', brand:'进口五轴联动', desc:'进口五轴联动CNC刀具磨床，专为铣刀、钻头、铰刀、成形刀具的精密修磨与再研磨而设计。五轴控制可精确复刻刀具的螺旋角、前角、后角与刃带宽度等几何参数，修磨后的刀具切削性能接近新刀水平。配备高压冷却系统与自动对刀探测，操作安全高效。刀具再研磨可延长使用寿命3-5倍，显著降低刀具消耗成本，是企业精益生产的重要支撑装备。', specs:[['控制轴数','五轴联动'],['磨削精度','±0.005 mm'],['适用刀具','铣刀/钻头/铰刀/成形刀'],['冷却系统','高压冷却'],['探测','自动对刀'],['效益','刀具寿命×3~5']]},
    },

    init() {
      var self = this;
      this.modal = document.getElementById('equip-modal');
      if (!this.modal) return;

      // Find or create modal body
      this.body = this.modal.querySelector('.equip-modal-body');
      if (!this.body) {
        // Find the inner modal container
        var innerModal = this.modal.querySelector('.equip-modal');
        if (innerModal) {
          this.body = document.createElement('div');
          this.body.className = 'equip-modal-body';
          innerModal.appendChild(this.body);
        }
      }

      this.closeBtn = this.modal.querySelector('.equip-modal-close');
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', function() { self.close(); });
      }
      this.modal.addEventListener('click', function(e) {
        if (e.target === self.modal) self.close();
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') self.close();
      });

      document.querySelectorAll('.e-card[data-machine]').forEach(function(card) {
        card.addEventListener('click', function() {
          var id = card.dataset.machine;
          self.open(id);
        });
      });
    },

    open(machineId) {
      var data = this.machines[machineId];
      if (!data || !this.body) return;

      var specsHTML = '';
      for (var i = 0; i < data.specs.length; i++) {
        specsHTML += '<tr><td>' + data.specs[i][0] + '</td><td>' + data.specs[i][1] + '</td></tr>';
      }

      this.body.innerHTML =
        '<div class="em-header">' +
          '<div class="em-cat">' + (data.cat || '') + '</div>' +
          '<h2>' + data.name + '</h2>' +
          '<div class="em-sub">' + (data.brand || '') + '</div>' +
        '</div>' +
        '<div class="em-specs">' +
          '<h4>技术规格</h4>' +
          '<table class="em-table">' + specsHTML + '</table>' +
        '</div>' +
        '<div class="em-desc">' +
          '<h4>加工能力</h4>' +
          '<p>' + data.desc + '</p>' +
        '</div>';

      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    close() {
      if (!this.modal) return;
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    },
  },

  // ================================================================
  // ---- Contact Form ----
  // ================================================================
  ContactForm: {
    init() {
      this.form = document.getElementById('contact-form');
      if (!this.form) return;

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validate()) {
          this.submit();
        }
      });

      this.form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearError(field));
      });
    },

    validateField(field) {
      const value = field.value.trim();
      const group = field.closest('.form-group');
      const errorEl = group?.querySelector('.form-error');
      let valid = true;
      let message = '';

      if (field.required && !value) {
        valid = false;
        message = '请填写此字段';
      } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        valid = false;
        message = '请输入有效的邮箱地址';
      } else if (field.type === 'tel' && value && !/^[\d\-+\s()]{7,20}$/.test(value)) {
        valid = false;
        message = '请输入有效的电话号码';
      }

      group?.classList.toggle('has-error', !valid);
      if (errorEl) errorEl.textContent = message;
      return valid;
    },

    clearError(field) {
      field.closest('.form-group')?.classList.remove('has-error');
    },

    validate() {
      let allValid = true;
      this.form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
        if (!this.validateField(field)) allValid = false;
      });
      return allValid;
    },

    submit() {
      const btn = this.form.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span style="display:flex;align-items:center;gap:8px;"><span class="loader-gear-ring" style="width:16px;height:16px;border-width:1.5px;"></span> 发送中...</span>';
      btn.disabled = true;

      setTimeout(() => {
        this.form.innerHTML = `
          <div class="form-success" style="text-align:center;padding:clamp(40px,8vw,80px) 20px;">
            <div style="width:64px;height:64px;margin:0 auto var(--space-lg);position:relative;">
              <svg viewBox="0 0 64 64" fill="none" style="width:100%;height:100%;">
                <circle cx="32" cy="32" r="30" stroke="var(--gold)" stroke-width="2" fill="none" stroke-dasharray="188" stroke-dashoffset="188" style="animation:drawPath 0.6s var(--ease-out-expo) 0.3s forwards;"/>
                <path d="M20 32 L28 40 L44 24" stroke="var(--gold)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="40" stroke-dashoffset="40" style="animation:drawPath 0.4s var(--ease-out-expo) 0.8s forwards;"/>
              </svg>
            </div>
            <h3 style="color:var(--white);margin-bottom:var(--space-sm);">感谢您的留言</h3>
            <p style="color:var(--silver);max-width:400px;margin:0 auto;">我们将在 24 小时内与您联系。如需紧急咨询，请致电我们的服务热线。</p>
          </div>
        `;
      }, 1500);
    },
  },

  // ================================================================
  // ---- Section Scroll Hints ----
  // ================================================================
  SectionHints: {
    init() {
      var self = this;
      // Find all major <section> elements inside <main>
      var sections = document.querySelectorAll('main > section, main > .h-carousel > .h-slide > section');
      if (sections.length < 2) return;

      sections.forEach(function(sec, idx) {
        // Skip the last section
        if (idx >= sections.length - 1) return;
        // Only show hint on every other section (odd indices: 1,3,5...)
        if (idx % 2 === 0) return;
        // Skip if already has a hint
        if (sec.querySelector('.section-hint')) return;

        // Create hint element (appended at end of section, flows naturally)
        var hint = document.createElement('div');
        hint.className = 'section-hint';
        var nextSection = sections[idx + 1];
        var nextId = nextSection.id || '';
        if (!nextId) {
          nextId = 'section-' + (idx + 1);
          nextSection.id = nextId;
        }
        hint.innerHTML = '<div class="section-hint-inner"><div class="section-hint-line"></div><div class="section-hint-dot"></div><div class="section-hint-text">继续向下探索</div></div>';
        sec.appendChild(hint);

        // Observe when hint enters viewport
        var observer = new IntersectionObserver(function(entries) {
          if (entries[0].isIntersecting) {
            hint.classList.add('visible');
          } else {
            hint.classList.remove('visible');
          }
        }, { threshold: 0.5, rootMargin: '0px 0px -60px 0px' });

        observer.observe(hint);
      });
    },
  },

  // ================================================================
  // ---- Page-to-Page Jump ----
  // ================================================================
  PageJump: {
    pages: [
      { file: 'index.html', label: '关于我们' },
      { file: 'about.html', label: '装备展示' },
      { file: 'equipment.html', label: '产品中心' },
      { file: 'products.html', label: '成果展示' },
      { file: 'quality.html', label: '联系我们' },
      { file: 'contact.html', label: '返回首页' },
    ],

    init() {
      var current = window.location.pathname.split('/').pop() || 'index.html';
      var next = null;
      for (var i = 0; i < this.pages.length; i++) {
        if (this.pages[i].file === current) {
          next = this.pages[i];
          break;
        }
      }
      if (!next) return;

      var target = this.pages[(this.pages.indexOf(next) + 1) % this.pages.length];
      if (current === 'contact.html') {
        target = this.pages[0]; // back to home
      }

      // Insert before footer
      var footer = document.querySelector('footer');
      if (!footer) return;

      var jump = document.createElement('div');
      jump.className = 'page-jump';
      jump.innerHTML = '<div class="page-jump-inner"><div class="page-jump-label">' + next.label + '</div><a class="page-jump-btn" href="' + target.file + '">→</a></div>';
      footer.parentNode.insertBefore(jump, footer);
    },
  },

  // ================================================================
  // ---- Utilities ----
  // ================================================================
  Utils: {
    throttle(fn, delay = 16) {
      let last = 0, timer;
      return (...args) => {
        const now = performance.now();
        if (now - last >= delay) {
          last = now;
          fn(...args);
        } else {
          clearTimeout(timer);
          timer = setTimeout(() => { last = performance.now(); fn(...args); }, delay - (now - last));
        }
      };
    },

    clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    },

    lerp(start, end, t) {
      return start + (end - start) * t;
    },

    attachScrollListeners() {
      const onScroll = JYD.Utils.throttle(() => {
        const scrollY = window.scrollY;
        JYD.Nav.handleScroll();
        JYD.Parallax.update(scrollY);
        if (JYD.Timeline.updateLine) JYD.Timeline.updateLine(scrollY);
      }, 16);

      window.addEventListener('scroll', onScroll, { passive: true });
    },
  },
};

// ===== Entry Point =====
document.addEventListener('DOMContentLoaded', function() {
  try {
    JYD.init();
  } catch (e) {
    // Silently fail — page content remains accessible
    document.body.classList.add('loaded');
  }
});
