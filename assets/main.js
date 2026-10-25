/* Simon & Robin Schaugg — Interaktionen
   Alles hier ist Progressive Enhancement: Die Seite funktioniert auch ohne JavaScript. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile-Menü ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Menü schließen' : 'Menü öffnen';
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Aktiver Navigationspunkt ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav__link'));
  var sectionFor = {
    arbeit: ['arbeit', 'civic-coding', 'neuhier', 'yold', 'gebaut'],
    expertise: ['expertise', 'ansatz'],
    'ueber-uns': ['ueber-uns', 'fuer-wen', 'formate', 'oekosystem'],
    presse: ['presse'],
    kontakt: ['kontakt']
  };
  if ('IntersectionObserver' in window && navLinks.length) {
    var owner = {};
    Object.keys(sectionFor).forEach(function (key) {
      sectionFor[key].forEach(function (id) { owner[id] = key; });
    });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var key = owner[entry.target.id];
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + key) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(owner).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }

  /* ---------- Kennzahlen zählen hoch ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var start = null;
        var duration = 1100;
        function tick(now) {
          if (start === null) start = now;
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Kontaktformular ---------- */
  var form = document.getElementById('inquiry-form');
  var success = document.getElementById('form-success');
  var errorBox = document.getElementById('form-error');
  var resetBtn = document.getElementById('form-reset');

  /* PROTOTYP: Hier den echten Versand anbinden, z. B.
     return fetch('https://DEIN-FORMULAR-ENDPOINT', {
       method: 'POST',
       headers: { 'Accept': 'application/json' },
       body: new FormData(form)
     }).then(function (r) { if (!r.ok) throw new Error('Versand fehlgeschlagen'); });
  */
  function sendInquiry(data) {
    return new Promise(function (resolve) { setTimeout(resolve, 700); });
  }

  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        errorBox.hidden = false;
        var invalid = form.querySelector(':invalid');
        if (invalid) invalid.focus();
        return;
      }
      errorBox.hidden = true;
      var button = form.querySelector('button[type="submit"]');
      var buttonLabel = button.querySelector('.btn__label') || button;
      button.disabled = true;
      buttonLabel.textContent = 'Wird gesendet …';
      sendInquiry(new FormData(form)).then(function () {
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }).catch(function () {
        errorBox.textContent = 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns per E-Mail.';
        errorBox.hidden = false;
      }).finally(function () {
        button.disabled = false;
        buttonLabel.textContent = 'Projekt besprechen';
      });
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      success.hidden = true;
      form.hidden = false;
      document.getElementById('f-name').focus();
    });
  }

  /* ---------- Jahr im Footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
