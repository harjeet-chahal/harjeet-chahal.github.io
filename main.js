/* Zen Garden ambient behavior:
   petal drift, morning-to-afternoon light, gentle reveals, filters. */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav state + sky cross-fade on scroll ---------- */
  const nav = document.getElementById("nav");
  const skyAfternoon = document.getElementById("skyAfternoon");

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    const eased = p * p * (3 - 2 * p); // smoothstep: morning → afternoon
    skyAfternoon.style.opacity = eased.toFixed(3);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Project filters ---------- */
  const chips = [...document.querySelectorAll(".chip")];
  const cards = [...document.querySelectorAll(".projects-grid .card")];
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      const filter = chip.dataset.filter;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.tags.split(" ").includes(filter);
        card.hidden = !show;
        if (show && !prefersReduced) {
          card.classList.remove("card-in");
          void card.offsetWidth; // restart the entrance animation
          card.classList.add("card-in");
        }
      });
    });
  });

  /* ---------- Falling petals ---------- */
  const canvas = document.getElementById("petals");
  if (prefersReduced || !canvas.getContext) {
    if (canvas) canvas.remove();
    return;
  }
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const PINKS = ["#F2CBD5", "#EFC3CE", "#F6DCE2", "#F3D2CE"];
  const GREENS = ["#CDDCC3", "#DAE5CF"];

  let W = 0, H = 0;
  const petals = [];

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  function newPetal(anywhere) {
    const green = Math.random() < 0.22; // mostly blossom, a few birch leaves
    return {
      x: rand(-40, W + 40),
      y: anywhere ? rand(-60, H) : rand(-90, -20),
      size: rand(5.5, 11.5),
      vy: rand(13, 32),                    // fall speed in px/s, a gentle breeze
      swayAmp: rand(26, 70),
      swayFreq: rand(0.22, 0.6),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.6, 0.6),
      tumbleFreq: rand(0.35, 0.95),
      tumblePhase: rand(0, Math.PI * 2),
      color: green ? pick(GREENS) : pick(PINKS),
      alpha: rand(0.45, 0.8),
      green
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const target = Math.round(Math.min(26, Math.max(12, (W * H) / 52000)));
    while (petals.length < target) petals.push(newPetal(true));
    petals.length = target;
  }
  window.addEventListener("resize", resize);
  resize();

  function drawPetal(p, t) {
    const x = p.x + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
    const tumble = 0.35 + 0.65 * Math.abs(Math.sin(t * p.tumbleFreq + p.tumblePhase));
    const s = p.size;

    ctx.save();
    ctx.translate(x, p.y);
    ctx.rotate(p.rot + Math.sin(t * 0.5 + p.phase) * 0.55);
    ctx.scale(tumble, 1); // fake 3-D flutter
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    if (p.green) {
      // slim birch leaf, pointed at both ends
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.58, -s * 0.2, 0, s);
      ctx.quadraticCurveTo(-s * 0.58, -s * 0.2, 0, -s);
    } else {
      // cherry-blossom petal: soft, rounded, slightly notched
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.92, -s * 0.55, s * 0.74, s * 0.52, 0, s * 0.72);
      ctx.bezierCurveTo(-s * 0.74, s * 0.52, -s * 0.92, -s * 0.55, 0, -s);
    }
    ctx.fill();
    ctx.restore();
  }

  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = now / 1000;
    const wind = Math.sin(t * 0.09) * 7; // slow, shared breeze

    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.y += p.vy * dt;
      p.x += wind * dt;
      p.rot += p.rotSpeed * dt;
      if (p.y > H + 40) Object.assign(p, newPetal(false));
      drawPetal(p, t);
    }
    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) last = performance.now(); // avoid a jump after tab sleep
  });

  requestAnimationFrame(frame);
})();
