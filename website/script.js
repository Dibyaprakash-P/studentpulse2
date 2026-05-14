/* ═══════════════════════════════════════════════════════════
   Student Pulse — Download Website Scripts
   Handles: navbar scroll, mobile menu, scroll animations
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Navbar scroll effect ─────────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── Mobile menu toggle ───────────────────────────────────
  const menuBtn = document.getElementById('mobileMenu');
  const mobileNav = document.getElementById('mobileNav');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });

  // Close mobile nav on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });

  // ── Scroll-reveal animations ─────────────────────────────
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation delays
        const el = entry.target;
        const siblings = Array.from(el.parentElement.children);
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = `${idx * 80}ms`;
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  // Observe all animated cards
  document.querySelectorAll('.feature-card, .step-card, .download-card, .about-card').forEach(el => {
    observer.observe(el);
  });

  // ── Smooth scroll for nav links ──────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
