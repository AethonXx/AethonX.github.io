// script.js — modern interactions + GitHub data

// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ===== 1) Typing effect in hero =====
function initTyping() {
  const el = $('.typed-text');
  if (!el) return;
  const phrases = [
    'Developer & Creator',
    'Building useful tools',
    'Clean code. Clear UX.',
    'Shipping ideas fast'
  ];
  let pi = 0, ci = 0, del = false;

  const tick = () => {
    const text = phrases[pi];
    el.textContent = del ? text.slice(0, ci--) : text.slice(0, ci++);
    const done = (!del && ci > text.length) || (del && ci < 0);
    let t = del ? 40 : 80;

    if (!del && ci > text.length) { del = true; t = 1200; }
    if (del && ci < 0) { del = false; pi = (pi + 1) % phrases.length; t = 400; }
    setTimeout(tick, t);
  };
  tick();
}

// ===== 2) Custom cursor =====
function initCursor() {
  const dot = $('.cursor-dot');
  const ring = $('.cursor-trail');
  if (!dot || !ring) return;
  let x = 0, y = 0, rx = 0, ry = 0;

  const move = e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; };
  window.addEventListener('mousemove', move);

  const loop = () => {
    rx += (x - rx) * 0.12;
    ry += (y - ry) * 0.12;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();

  // hover grow
  $$('a, button, .filter-btn, .direct-link').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '56px'; ring.style.height = '56px'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '40px'; ring.style.height = '40px'; });
  });
}

// ===== 3) Magnetic buttons =====
function initMagnetic() {
  $$('[data-magnetic]').forEach(btn => {
    const strength = 20;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${mx / strength}px, ${my / strength}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
  });
}

// ===== 4) Navbar and smooth anchors =====
function initNav() {
  const nav = $('#navbar');
  window.addEventListener('scroll', () => {
    nav.style.transform = window.scrollY > 20 ? 'translateY(-2px)' : 'translateY(0)';
  });
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        e.preventDefault();
        $(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== 5) Particles background (network) =====
function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w, h; let points = [];
  const N = 90;

  function resize() {
    w = canvas.width = Math.floor(window.innerWidth * DPR);
    h = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = '100%'; canvas.style.height = '100%';
    points = Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3 * DPR,
      vy: (Math.random() - 0.5) * 0.3 * DPR,
      r: (1 + Math.random() * 2) * DPR
    }));
  }
  resize(); window.addEventListener('resize', resize);

  function step() {
    ctx.clearRect(0, 0, w, h);
    // draw lines
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 140 * DPR) {
          ctx.strokeStyle = `rgba(99,102,241,${(1 - d / (140 * DPR)) * 0.25})`;
          ctx.lineWidth = 1 * DPR;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    // draw points
    for (const p of points) {
      ctx.fillStyle = 'rgba(99,102,241,0.9)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(step);
  }
  step();
}

// ===== 6) Reveal on scroll & skill bars =====
function initScrollAnims() {
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => e.isIntersecting && e.target.classList.add('animate'));
  }, { threshold: 0.2 });

  $$('.skill-category, .content-card, .project-card, .info-card').forEach(el => {
    el.style.transform = 'translateY(24px)';
    el.style.opacity = '0';
    el.style.transition = 'all .6s ease';
    io.observe(el);
  });

  // skills levels
  $$('.skill-level').forEach(level => {
    const width = level.dataset.level || 0;
    const bar = document.createElement
