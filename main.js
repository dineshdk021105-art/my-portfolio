/* Dineshkumar P Portfolio — main.js
   Google Sheets via AppScript (GET, no-cors, file:// safe)
   ─────────────────────────────────────────────────────── */

// ── CONFIG ──────────────────────────────────────────────
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysKLgnRc9_ycY43rezm0pwyNtQAIoPcKeBd7wzQX-4yd2GO3zMRzGAzby9LIe5aBgO/exec";

document.addEventListener('DOMContentLoaded', function () {

  // ── 1. Navbar scroll ──────────────────────────────────
  var navbar = document.getElementById('navbar');
  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── 2. Mobile nav toggle ──────────────────────────────
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');

  navToggle.addEventListener('click', function () {
    var isOpen = navMobile.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen.toString());
    navMobile.setAttribute('aria-hidden', (!isOpen).toString());
  });

  navMobile.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navMobile.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navMobile.setAttribute('aria-hidden', 'true');
    });
  });

  // ── 3. Active nav link ────────────────────────────────
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');

  function activateNav() {
    var current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', activateNav, { passive: true });

  // ── 4. Scroll animations ──────────────────────────────
  var animEls = document.querySelectorAll('[data-animate]');
  var animObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animEls.forEach(function (el) { animObserver.observe(el); });

  // ── 5. Count-up for stats ─────────────────────────────
  var statEls = document.querySelectorAll('.stat-number[data-count]');
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1600;
      var start = null;

      function step(ts) {
        if (!start) start = ts;
        var prog = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - prog, 3);
        var val = Math.floor(eased * target);
        el.innerHTML = val + '<span class="accent">' + suffix + '</span>';
        if (prog < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statEls.forEach(function (el) { countObserver.observe(el); });

  // ── 6. FAQ accordion ──────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── 7. Contact form → Google Sheets (GET, no-cors) ────
  var form = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  var formNetErr = document.getElementById('formNetworkError');
  var submitBtn = document.getElementById('contact-submit-btn');

  function validate(inputId, errorId, testFn) {
    var input = document.getElementById(inputId);
    var errEl = document.getElementById(errorId);
    var invalid = !testFn(input.value.trim());
    input.classList.toggle('is-error', invalid);
    errEl.classList.toggle('show', invalid);
    return !invalid;
  }

  function showSuccess() {
    if (form) form.style.display = 'none';
    if (formNetErr) formNetErr.classList.remove('show');
    if (formSuccess) {
      formSuccess.classList.add('show');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showNetworkError() {
    if (submitBtn) submitBtn.classList.remove('loading');
    if (formNetErr) formNetErr.classList.add('show');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameOk = validate('contact-name', 'error-name', function (v) { return v.length >= 2; });
      var emailOk = validate('contact-email', 'error-email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); });

      if (!nameOk || !emailOk) return;

      // Loading state
      submitBtn.classList.add('loading');
      if (formNetErr) formNetErr.classList.remove('show');

      var name = document.getElementById('contact-name').value.trim();
      var email = document.getElementById('contact-email').value.trim();
      var phone = document.getElementById('contact-phone').value.trim();

      // ── CRITICAL FETCH RULES ──────────────────────────
      // Build GET URL with query params
      var url = SCRIPT_URL + "?" + new URLSearchParams({ name: name, email: email, phone: phone });

      // mode: "no-cors" — response is opaque, never read it
      // No .then(res => res.json()), no res.ok, no res.status
      fetch(url, { method: "GET", mode: "no-cors" })
        .then(function () { showSuccess(); })
        .catch(function () { showNetworkError(); });
    });

    // Live validation on blur
    ['contact-name', 'contact-email'].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('blur', function () {
        if (id === 'contact-email') {
          validate('contact-email', 'error-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); });
        } else {
          validate('contact-name', 'error-name', function (v) { return !v || v.length >= 2; });
        }
      });
      input.addEventListener('input', function () {
        if (input.classList.contains('is-error')) {
          input.classList.remove('is-error');
          var errId = 'error-' + id.replace('contact-', '');
          var errEl = document.getElementById(errId);
          if (errEl) errEl.classList.remove('show');
        }
      });
    });
  }

  // ── 8. Smooth scroll ──────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = navbar ? navbar.offsetHeight + 16 : 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  // ── 9. Hero card subtle parallax (desktop) ───────────
  var heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && window.innerWidth > 900) {
    document.addEventListener('mousemove', function (e) {
      var rect = heroVisual.getBoundingClientRect();
      var dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      var dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      heroVisual.style.transform = 'rotateY(' + (dx * 3) + 'deg) rotateX(' + (-dy * 2) + 'deg)';
    });
    document.addEventListener('mouseleave', function () {
      heroVisual.style.transform = '';
    });
  }

});
