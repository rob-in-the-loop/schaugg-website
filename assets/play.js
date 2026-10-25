/* ==========================================================================
   Interaktive Elemente – Comic-Ebene der Website
   Alles ist Zusatz: Ohne JavaScript bleibt die Seite vollständig lesbar.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function pop(node, delay) {
    if (reduce || !node || !node.animate) return;
    node.animate(
      [{ transform: 'scale(0.2)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 450, delay: delay || 0, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)', fill: 'backwards' }
    );
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

  /* ---------- 1) Hero: Dialog zwischen Mensch und Roboter ---------- */
  var art = $('.hero-art');
  if (art) {
    var dialog = [
      ['Ich hab die Lösung!', 'Schön. Welches Problem?', 'LÖSUNG'],
      ['Chatbot? Chatbot!', 'Für wen genau?', 'CHATBOT'],
      ['Alles automatisieren!', 'Auch das Zuhören?', 'AUTOMATIK'],
      ['Okay. Erst verstehen?', 'Jetzt reden wir.', 'VERSTEHEN']
    ];
    var step = 0;
    var rBubble = $('.art-bubble--robot', art), hBubble = $('.art-bubble--human', art);
    var rText = $('text', rBubble), hText = $('text', hBubble);
    var label = $('.art-label', art), bar = $('.art-bar', art), live = $('#art-live');
    var fit = function (t, max, perChar) { t.setAttribute('textLength', String(Math.min(max, Math.round(t.textContent.length * perChar)))); };
    var next = function () {
      step = (step + 1) % dialog.length;
      var d = dialog[step];
      rText.textContent = d[0]; hText.textContent = d[1]; label.textContent = d[2];
      fit(rText, 224, 10.9); fit(hText, 252, 10.3);
      pop(rBubble, 0); pop(hBubble, 650);
      if (!reduce && bar.animate) bar.animate([{ transform: 'scaleX(0.05)' }, { transform: 'scaleX(1)' }], { duration: 1200, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' });
      if (live) live.textContent = 'Roboter: ' + d[0] + ' Mensch: ' + d[1];
    };
    $$('.art-robot').concat($$('#art-next')).forEach(function (n) { n.addEventListener('click', next); });

    /* Die Augen des Roboters folgen dem Zeiger */
    var eyes = $('.art-eyes', art);
    if (eyes && !reduce) {
      var raf = 0;
      window.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = art.getBoundingClientRect();
          var cx = r.left + r.width * 0.69, cy = r.top + r.height * 0.42;
          var dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 320));
          var dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 320));
          eyes.style.transform = 'translate(' + (dx * 5).toFixed(1) + 'px,' + (dy * 3).toFixed(1) + 'px)';
        });
      }, { passive: true });
    }
  }

  /* ---------- 2) DVV-Assistent: Sprachen umschalten ---------- */
  var DVV = {
    de: { dir: 'ltr', lang: 'de', q: 'Wie melde ich mich für einen Deutschkurs an?', a: 'Ich helfe gern. Zuerst ein paar Fragen zu Ihrem Deutschniveau.', o: ['Ich fange gerade an', 'A2 – B1', 'Weiß ich nicht'] },
    en: { dir: 'ltr', lang: 'en', q: 'How do I sign up for a German course?', a: 'Happy to help. First, a few questions about your German level.', o: ["I'm just starting", 'A2 – B1', "I don't know"] },
    uk: { dir: 'ltr', lang: 'uk', q: 'Як записатися на курс німецької мови?', a: 'Я допоможу. Спочатку кілька запитань про ваш рівень німецької.', o: ['Я тільки починаю', 'A2 – B1', 'Не знаю'] },
    tr: { dir: 'ltr', lang: 'tr', q: 'Almanca kursuna nasıl kaydolabilirim?', a: 'Memnuniyetle yardımcı olurum. Önce Almanca seviyenizle ilgili birkaç soru.', o: ['Yeni başlıyorum', 'A2 – B1', 'Bilmiyorum'] },
    ar: { dir: 'rtl', lang: 'ar', q: 'كيف أسجّل في دورة لتعلّم اللغة الألمانية؟', a: 'يسعدني مساعدتك. أولاً بعض الأسئلة عن مستواك في اللغة الألمانية.', o: ['أنا مبتدئ', 'A2 – B1', 'لا أعرف'] },
    ls: { dir: 'ltr', lang: 'de', q: 'Ich will Deutsch lernen. Wie geht das?', a: 'Ich helfe Ihnen. Ich stelle Ihnen erst ein paar Fragen. Dann finden wir einen Kurs.', o: ['Ich fange neu an', 'Ich kann schon etwas', 'Ich weiß es nicht'], noTrans: true }
  };
  var DVV_TRANS = 'Ich helfe gern. Zuerst ein paar Fragen zu Ihrem Deutschniveau.';
  var DVV_END = 'Demo endet hier. Im echten Assistenten kämen jetzt passende Kursvorschläge – und auf Wunsch eine Person aus der Beratung.';

  $$('[data-chat="dvv"]').forEach(function (chat) {
    var log = $('.chat__log', chat), run = 0;
    function render(key) {
      var d = DVV[key], my = ++run;
      log.innerHTML = '';
      var q = el('p', 'bubble bubble--user', d.q, { lang: d.lang, dir: d.dir });
      log.appendChild(q); pop(q);
      var typing = el('span', 'bubble bubble--bot typing', null, { 'aria-label': 'Assistent schreibt' });
      typing.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(typing);
      wait(750).then(function () {
        if (my !== run) return;
        typing.remove();
        var a = el('div', 'bubble bubble--bot');
        a.appendChild(el('span', null, d.a, { lang: d.lang, dir: d.dir }));
        if (key !== 'de' && !d.noTrans) a.appendChild(el('span', 'bubble__trans', DVV_TRANS));
        log.appendChild(a); pop(a);
        var opts = el('div', 'chat__options', null, { lang: d.lang, dir: d.dir });
        d.o.forEach(function (t) { opts.appendChild(el('button', 'chat__option', t, { type: 'button' })); });
        log.appendChild(opts);
      });
    }
    $$('.chat__lang', chat).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.chat__lang', chat).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); x.classList.toggle('is-on', x === b); });
        render(b.getAttribute('data-lang'));
      });
    });
    log.addEventListener('click', function (e) {
      var o = e.target.closest('.chat__option');
      if (!o || o.disabled) return;
      $$('.chat__option', log).forEach(function (x) { x.disabled = true; });
      var mine = el('p', 'bubble bubble--user', o.textContent, { lang: o.parentNode.getAttribute('lang') || 'de', dir: o.parentNode.getAttribute('dir') || 'ltr' });
      log.appendChild(mine); pop(mine);
      wait(500).then(function () { var n = el('p', 'bubble bubble--note', DVV_END); log.appendChild(n); pop(n); });
    });
  });

  /* ---------- 3) Mio: Fragen zum Alltag in Deutschland ---------- */
  var MIO = [
    { q: 'My colleague said „Wir können uns gerne duzen“. What does that mean – and what do I say?', a: 'In German workplaces „Sie“ is the default. Offering „du“ is a small sign of trust. A friendly reply: „Gerne, ich bin …“ – and from then on you use first names.' },
    { q: 'Why is almost every shop closed on Sunday?', a: 'Sunday is a protected day of rest in Germany, so most shops close. Bakeries in the morning, petrol stations and many train-station shops are often open. Tip: plan your big grocery run for Saturday.' },
    { q: 'What is „Pfand“ on my bottle?', a: 'A deposit. Many bottles and cans carry 8 to 25 cents. Return them to the machine in almost any supermarket and you get a voucher for the money.' }
  ];
  $$('[data-chat="mio"]').forEach(function (chat) {
    var log = $('.chat__log', chat), run = 0;
    $$('.chat__q', chat).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = MIO[Number(b.getAttribute('data-q'))], my = ++run;
        $$('.chat__q', chat).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        log.innerHTML = '';
        var q = el('p', 'bubble bubble--user', d.q, { lang: 'en' }); log.appendChild(q); pop(q);
        var typing = el('span', 'bubble bubble--bot typing', null, { 'aria-label': 'Mio schreibt' });
        typing.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(typing);
        wait(800).then(function () {
          if (my !== run) return;
          typing.remove();
          var a = el('p', 'bubble bubble--bot', d.a, { lang: 'en' }); log.appendChild(a); pop(a);
        });
      });
    });
    var more = $('.suggest__btn', chat), note = $('.suggest__note', chat);
    if (more && note) more.addEventListener('click', function () {
      note.hidden = !note.hidden;
      more.setAttribute('aria-expanded', String(!note.hidden));
    });
  });

  /* ---------- 4) These: den Knoten entwirren ---------- */
  $$('[data-untangle]').forEach(function (btn) {
    var fig = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var neat = !fig.classList.contains('is-neat');
      fig.classList.toggle('is-neat', neat);
      btn.setAttribute('aria-pressed', String(neat));
      btn.textContent = neat ? 'Wieder verknoten' : 'Entwirren';
    });
  });

  /* ---------- 5) Ansatz: Checkliste mit ungeduldigem Roboter ---------- */
  var check = $('[data-checklist]');
  if (check) {
    var say = $('#check-say'), count = $('#check-count'), meter = $('#check-meter'), bot = $('.bot-check');
    var buttons = $$('.q-btn', check);
    var lines = ['Darf ich schon bauen?', 'Darf ich jetzt bauen?', 'Und jetzt?', 'Immer noch nicht?', 'Gute Fragen, ehrlich.', 'Fast geschafft …', 'Noch eine!', 'Jetzt bauen wir.'];
    var update = function () {
      var n = buttons.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).length;
      count.textContent = String(n);
      meter.style.setProperty('--p', String(n / buttons.length));
      say.textContent = lines[n];
      bot.classList.toggle('is-done', n === buttons.length);
      pop(say);
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
        update();
      });
    });
  }

  /* ---------- 6) YOLD: Wissens-Würfel ---------- */
  var roll = $('#dice-roll');
  if (roll) {
    var skills = ['Sauerteig ansetzen', 'Instagram verstehen', 'Stricken', 'eine Bewerbung schreiben', 'Jazz-Klavier', 'Smartphone-Fotografie',
      'die Steuererklärung', 'Romanempfehlungen', 'Excel-Formeln', 'Spanisch für den Urlaub', 'Fahrradreparatur', 'Schach', 'Podcasts aufnehmen', 'Gärtnern auf dem Balkon'];
    var outA = $('#dice-a'), outB = $('#dice-b'), die = $('.dice__die', roll), out = $('.dice__out');
    roll.addEventListener('click', function () {
      var a = Math.floor(Math.random() * skills.length), b;
      do { b = Math.floor(Math.random() * skills.length); } while (b === a || skills[b] === outB.textContent);
      if (!reduce && die && die.animate) die.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(540deg)' }], { duration: 600, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' });
      wait(300).then(function () { outA.textContent = skills[a]; outB.textContent = skills[b]; pop(out); });
    });
  }

  /* ---------- 7) Kontakt: Papierflieger beim Absenden ---------- */
  var form = $('#inquiry-form');
  if (form) {
    form.addEventListener('submit', function () {
      if (form.checkValidity()) form.classList.add('is-sending');
    }, true);
    var reset = $('#form-reset');
    if (reset) reset.addEventListener('click', function () { form.classList.remove('is-sending'); });
  }
})();
