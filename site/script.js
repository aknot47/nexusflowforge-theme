document.addEventListener('DOMContentLoaded', () => {
  const animateItems = document.querySelectorAll('[data-animate]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    animateItems.forEach(item => observer.observe(item));
  } else {
    animateItems.forEach(item => item.classList.add('visible'));
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('open');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initCanvas(prefersReducedMotion);
});

function initCanvas(prefersReducedMotion) {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];
  let animationId;

  const colorStops = [
    'rgba(36, 246, 255, 0.85)',
    'rgba(164, 61, 255, 0.85)',
    'rgba(255, 45, 146, 0.85)'
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function createParticles() {
    const count = Math.min(Math.floor((width * height) / 18000), 90);
    particles = new Array(count).fill(null).map(() => {
      const orbit = Math.random() * Math.max(width, height) * 0.6 + 60;
      return {
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 1.8 + 0.5,
        speed: (Math.random() * 0.0007 + 0.00035) * (Math.random() > 0.5 ? 1 : -1),
        orbit,
        xOffset: (Math.random() - 0.5) * 180,
        yOffset: (Math.random() - 0.5) * 180,
        color: colorStops[Math.floor(Math.random() * colorStops.length)]
      };
    });
  }

  function drawFrame(timestamp) {
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      renderParticles(0.2);
      return;
    }

    ctx.fillStyle = 'rgba(4, 1, 15, 0.09)';
    ctx.fillRect(0, 0, width, height);

    const t = (timestamp || 0) * 0.0003;
    renderParticles(t);
    animationId = requestAnimationFrame(drawFrame);
  }

  function renderParticles(t) {
    particles.forEach((p, index) => {
      const wobble = Math.sin(t * 2 + index) * 15;
      const wobbleY = Math.cos(t * 1.5 + index) * 15;
      p.angle += p.speed;
      const x = width / 2 + Math.cos(p.angle) * p.orbit + p.xOffset + wobble;
      const y = height / 2 + Math.sin(p.angle) * p.orbit * 0.55 + p.yOffset + wobbleY;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.radius * 12);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.8, 'rgba(4, 1, 15, 0.0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, p.radius * 12, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function start() {
    resize();
    createParticles();
    if (!prefersReducedMotion) {
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(drawFrame);
    } else {
      renderParticles(0);
    }
  }

  start();
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}
