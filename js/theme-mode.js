/* ============================================================
   LIGHT / DARK MODE — js/theme-mode.js
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'bb-portfolio-mode';
  var root = document.documentElement;
  var sw = document.getElementById('modeSwitch');
  if (!sw) return;

  function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  function apply(mode) {
    root.setAttribute('data-theme', mode);
    sw.setAttribute('aria-checked', mode === 'light' ? 'true' : 'false');
    sw.setAttribute('title', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'light' ? '#f5f7fb' : '#0a0e14');
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }

  function toggle() {
    var next = current() === 'light' ? 'dark' : 'light';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Circular reveal dari posisi saklar
    if (document.startViewTransition && !reduce) {
      var r = sw.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var t = document.startViewTransition(function () { apply(next); });
      t.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
      return;
    }

    // Fallback: fade
    root.classList.add('theme-anim');
    apply(next);
    setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
  }

  sw.addEventListener('click', toggle);
  apply(current()); // sinkronkan aria + meta dengan state awal
})();
