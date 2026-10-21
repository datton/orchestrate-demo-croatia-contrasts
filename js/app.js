// Text animations and page behaviour (owner: Full-Stack).
// Everything here is progressive: with JS off or reduced motion the text just reads normally.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // 1. Scroll reveal (.reveal): classes live in css/site.css.
  var items = document.querySelectorAll('.reveal');
  if (reduce || !hasIO) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Everything below is motion only: stop here for visitors who asked for less.
  if (reduce) return;

  // Styles for the effects below, injected so they exist only when motion is allowed.
  var css = [
    '.kin-ready .char, .kin-ready .word { opacity: 0; transform: translateY(.6em); transition: opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1); transition-delay: calc(var(--i) * 45ms); }',
    '.kin-ready.is-in .char, .kin-ready.is-in .word { opacity: 1; transform: none; }',
    '.kin-ready[data-kinetic="chars"] .char { display: inline-block; }',
    '.sw-word { opacity: .3; transition: opacity .25s ease; }',
    '.sw-word.lit { opacity: 1; }',
    '.rotator { display: inline-block; transition: opacity .4s ease, transform .4s ease; }',
    '.rotator.is-out { opacity: 0; transform: translateY(.4em); }',
    '.drift { transition: letter-spacing 1.2s ease; }',
    '.drift.is-in { letter-spacing: .04em; }'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // 2. Kinetic type: data-kinetic="chars" or "words" splits the text and staggers it in.
  // The parent keeps the full text in aria-label; the pieces are hidden from screen readers.
  function split(el, mode) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var i = 0;
    text.split(' ').forEach(function (w, wi, all) {
      var word = document.createElement('span');
      word.className = 'word';
      word.setAttribute('aria-hidden', 'true');
      word.style.display = 'inline-block';
      if (mode === 'chars') {
        w.split('').forEach(function (c) {
          var ch = document.createElement('span');
          ch.className = 'char';
          ch.style.setProperty('--i', i++);
          ch.textContent = c;
          word.appendChild(ch);
        });
        // chars carry the stagger; the word wrapper itself stays still
        word.style.opacity = '1';
        word.style.transform = 'none';
        word.style.transition = 'none';
      } else {
        word.style.setProperty('--i', i++);
        word.textContent = w;
      }
      el.appendChild(word);
      if (wi < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('kin-ready');
  }
  var kinetic = document.querySelectorAll('[data-kinetic]');
  kinetic.forEach(function (el) { split(el, el.getAttribute('data-kinetic')); });
  function playAll(list) {
    if (!hasIO) { list.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var kio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); kio.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    list.forEach(function (el) { kio.observe(el); });
  }
  playAll(Array.prototype.slice.call(kinetic));
  playAll(Array.prototype.slice.call(document.querySelectorAll('.drift')));

  // 3. Rotating word: <span data-rotate="green|stone|salt">green</span> cycles through the list.
  document.querySelectorAll('[data-rotate]').forEach(function (el) {
    var words = el.getAttribute('data-rotate').split('|');
    if (words.length < 2) return;
    el.classList.add('rotator');
    var n = 0;
    setInterval(function () {
      el.classList.add('is-out');
      setTimeout(function () {
        n = (n + 1) % words.length;
        el.textContent = words[n];
        el.classList.remove('is-out');
      }, 400);
    }, 2600);
  });

  // 4. Scroll-driven text: words of [data-scroll-words] light up as the paragraph scrolls through.
  var scrollBlocks = [];
  document.querySelectorAll('[data-scroll-words]').forEach(function (el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var spans = text.split(' ').map(function (w, i, all) {
      var s = document.createElement('span');
      s.className = 'sw-word';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w;
      el.appendChild(s);
      if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    scrollBlocks.push({ el: el, spans: spans });
  });
  if (scrollBlocks.length) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      scrollBlocks.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        p = Math.max(0, Math.min(1, p));
        var lit = Math.round(p * b.spans.length);
        b.spans.forEach(function (s, i) { s.classList.toggle('lit', i < lit); });
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
