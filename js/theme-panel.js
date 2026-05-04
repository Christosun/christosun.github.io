/* ============================================================
   THEME COLOR PANEL — js/theme-panel.js
   ============================================================ */

(function () {
  'use strict';

  const PALETTES = [
    { name: 'Teal',     hex: '#00d4aa' },
    { name: 'Electric', hex: '#00aaff' },
    { name: 'Violet',   hex: '#a78bfa' },
    { name: 'Coral',    hex: '#ff6b6b' },
    { name: 'Gold',     hex: '#f59e0b' },
    { name: 'Lime',     hex: '#84cc16' },
    { name: 'Rose',     hex: '#fb7185' },
    { name: 'Cyan',     hex: '#22d3ee' },
    { name: 'Indigo',   hex: '#6366f1' },
    { name: 'Amber',    hex: '#fbbf24' },
  ];

  const DEFAULT_COLOR = '#00d4aa';
  const STORAGE_KEY   = 'bb-portfolio-accent';
  const STORAGE_POS_Y = 'bb-portfolio-btn-y';

  let panelOpen = false;
  let activeHex = DEFAULT_COLOR;

  /* ── Helpers ── */
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return r + ',' + g + ',' + b;
  }
  function isValidHex(hex) { return /^#[0-9a-fA-F]{6}$/.test(hex); }

  /* ── Apply accent color ── */
  function applyColor(hex, save) {
    if (save === undefined) save = true;
    if (!isValidHex(hex)) return;
    activeHex = hex;
    const rgb = hexToRgb(hex);

    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-rgb', rgb);

    var bar = document.getElementById('tp-preview-bar');
    if (bar) bar.style.background = 'linear-gradient(90deg, ' + hex + ' 0%, rgba(255,255,255,0.06) 100%)';

    document.querySelectorAll('.tp-preview-dot').forEach(function(d) { d.style.background = hex; });

    var applyBtn = document.getElementById('tp-apply-btn');
    if (applyBtn) applyBtn.style.background = hex;

    var tab = document.getElementById('theme-toggle-btn');
    if (tab) tab.style.setProperty('--tab-accent', hex);

    var picker = document.getElementById('tp-color-picker');
    var hexIn  = document.getElementById('tp-hex-input');
    if (picker) picker.value = hex;
    if (hexIn)  hexIn.value  = hex;

    document.querySelectorAll('.tp-swatch').forEach(function(sw) {
      sw.classList.toggle('active', sw.dataset.hex === hex);
    });

    if (save) { try { localStorage.setItem(STORAGE_KEY, hex); } catch(e) {} }
  }

  /* ── Inject styles ── */
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      /* Toggle tab */
      '#theme-toggle-btn{',
        'position:fixed;right:0;top:50%;transform:translateY(-50%);',
        'z-index:1100;width:34px;height:56px;',
        'border:none;border-radius:10px 0 0 10px;',
        'background:rgba(11,15,23,0.95);',
        'cursor:grab;display:flex;align-items:center;justify-content:center;',
        'padding:0;outline:none;',
        'box-shadow:-4px 0 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05);',
        'transition:width .22s ease,background .2s ease;',
        'user-select:none;touch-action:none;',
        '--tab-accent:#00d4aa;',
      '}',
      '#theme-toggle-btn::before{',
        'content:"";position:absolute;left:0;top:8px;bottom:8px;',
        'width:3px;border-radius:2px;',
        'background:var(--tab-accent);transition:background .3s;',
      '}',
      '#theme-toggle-btn:hover,#theme-toggle-btn.panel-active{',
        'width:40px;background:rgba(15,20,32,0.98);',
      '}',
      '#theme-toggle-btn:active{cursor:grabbing;}',
      '#theme-toggle-btn.dragging{cursor:grabbing;transition:none;}',

      /* Arrow icon */
      '.tt-arrow{',
        'width:14px;height:14px;display:flex;align-items:center;justify-content:center;',
        'color:rgba(232,237,245,0.5);pointer-events:none;',
        'transition:transform .3s cubic-bezier(.4,0,.2,1),color .2s;',
      '}',
      '#theme-toggle-btn:hover .tt-arrow,#theme-toggle-btn.panel-active .tt-arrow{',
        'color:var(--tab-accent);',
      '}',
      '#theme-toggle-btn.panel-active .tt-arrow{transform:rotate(180deg);}',

      /* Grip dots */
      '.tt-grip{',
        'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);',
        'display:flex;flex-direction:column;gap:3px;pointer-events:none;',
        'opacity:0;transition:opacity .2s;',
      '}',
      '#theme-toggle-btn:hover .tt-grip{opacity:1;}',
      '.tt-grip span{display:block;width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.2);}',

      /* Backdrop */
      '#theme-panel-backdrop{',
        'position:fixed;inset:0;z-index:1098;',
        'background:rgba(0,0,0,0.38);backdrop-filter:blur(2px);',
        '-webkit-backdrop-filter:blur(2px);',
        'opacity:0;pointer-events:none;transition:opacity .3s ease;',
      '}',
      '#theme-panel-backdrop.open{opacity:1;pointer-events:all;}',

      /* Panel */
      '#theme-panel{',
        'position:fixed;top:0;right:0;bottom:0;width:262px;',
        'background:rgba(9,13,20,0.97);',
        'border-left:1px solid rgba(255,255,255,0.07);',
        'z-index:1099;display:flex;flex-direction:column;',
        'transform:translateX(100%);',
        'transition:transform .35s cubic-bezier(.4,0,.2,1);',
        'backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);',
      '}',
      '#theme-panel.open{transform:translateX(0);}',

      /* Header */
      '.tp-header{',
        'display:flex;align-items:center;justify-content:space-between;',
        'padding:1.375rem 1.25rem 1rem;',
        'border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;',
      '}',
      '.tp-title{',
        'font-family:"Space Mono",monospace;font-size:.66rem;',
        'letter-spacing:.16em;text-transform:uppercase;',
        'color:rgba(122,133,153,.75);',
      '}',
      '.tp-close{',
        'width:26px;height:26px;border-radius:6px;',
        'border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);',
        'color:rgba(122,133,153,.7);display:flex;align-items:center;justify-content:center;',
        'cursor:pointer;font-size:.72rem;transition:all .18s;outline:none;',
      '}',
      '.tp-close:hover{color:#e8edf5;border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.06);}',

      /* Body */
      '.tp-body{',
        'flex:1;overflow-y:auto;padding:1.125rem 1.25rem;',
        'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.07) transparent;',
      '}',
      '.tp-body::-webkit-scrollbar{width:3px;}',
      '.tp-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.07);border-radius:2px;}',

      /* Section label */
      '.tp-section-label{',
        'font-family:"Space Mono",monospace;font-size:.57rem;',
        'letter-spacing:.14em;text-transform:uppercase;',
        'color:rgba(122,133,153,.48);margin-bottom:.6rem;',
        'display:flex;align-items:center;gap:.5rem;',
      '}',
      '.tp-section-label::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.05);}',

      /* Swatches */
      '.tp-swatches{display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:1.25rem;}',
      '.tp-swatch{',
        'border-radius:9px;padding:.6rem .55rem;cursor:pointer;',
        'border:1.5px solid transparent;background:rgba(255,255,255,.03);',
        'transition:transform .18s ease,border-color .18s,background .18s;',
        'outline:none;',
      '}',
      '.tp-swatch:hover{transform:translateY(-2px);background:rgba(255,255,255,.055);}',
      '.tp-swatch.active{border-color:var(--sw-color)!important;background:rgba(255,255,255,.05);}',
      '.tp-swatch-dot{',
        'width:22px;height:22px;border-radius:50%;background:var(--sw-color);',
        'margin-bottom:.35rem;display:flex;align-items:center;justify-content:center;',
        'transition:transform .18s;',
      '}',
      '.tp-swatch:hover .tp-swatch-dot{transform:scale(1.1);}',
      '.tp-swatch-dot svg{opacity:0;transition:opacity .15s;width:10px;height:10px;}',
      '.tp-swatch.active .tp-swatch-dot svg{opacity:1;}',
      '.tp-swatch-name{font-size:.65rem;font-weight:500;color:#e8edf5;line-height:1.2;}',
      '.tp-swatch-hex{font-size:.57rem;color:rgba(122,133,153,.65);font-family:"Space Mono",monospace;}',

      /* Divider */
      '.tp-divider{height:1px;background:rgba(255,255,255,.05);margin:1rem 0;}',

      /* Custom */
      '.tp-custom-row{display:flex;gap:.5rem;align-items:center;margin-bottom:.6rem;}',
      '.tp-color-input{',
        'width:36px;height:36px;border-radius:8px;',
        'border:1px solid rgba(255,255,255,.1);background:transparent;',
        'cursor:pointer;padding:3px;flex-shrink:0;',
      '}',
      '.tp-color-input::-webkit-color-swatch-wrapper{padding:0;border-radius:5px;}',
      '.tp-color-input::-webkit-color-swatch{border:none;border-radius:5px;}',
      '.tp-hex-input{',
        'flex:1;background:rgba(255,255,255,.04);',
        'border:1px solid rgba(255,255,255,.08);border-radius:8px;',
        'color:#e8edf5;font-family:"Space Mono",monospace;',
        'font-size:.7rem;padding:0 .75rem;height:36px;outline:none;',
        'transition:border-color .18s,background .18s;',
      '}',
      '.tp-hex-input:focus{border-color:rgba(var(--accent-rgb),.4);background:rgba(var(--accent-rgb),.04);}',

      /* Apply btn */
      '.tp-apply{',
        'width:100%;padding:.52rem;border-radius:8px;border:none;',
        'background:var(--accent);color:#0a0e14;',
        'font-family:"DM Sans",sans-serif;font-size:.75rem;font-weight:700;',
        'cursor:pointer;transition:filter .18s,transform .18s,box-shadow .18s;',
        'letter-spacing:.02em;outline:none;',
      '}',
      '.tp-apply:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 20px rgba(var(--accent-rgb),.28);}',
      '.tp-apply:active{transform:translateY(0);}',

      /* Preview */
      '.tp-preview{margin-top:1.25rem;}',
      '.tp-preview-bar{height:4px;border-radius:2px;margin-bottom:.5rem;transition:background .3s;}',
      '.tp-preview-dots{display:flex;gap:5px;align-items:center;}',
      '.tp-preview-dot{height:18px;border-radius:4px;transition:background .3s;}',

      /* Footer */
      '.tp-footer{padding:.875rem 1.25rem 1.125rem;border-top:1px solid rgba(255,255,255,.05);flex-shrink:0;}',
      '.tp-reset{',
        'width:100%;padding:.45rem;border-radius:7px;',
        'border:1px solid rgba(255,255,255,.08);background:transparent;',
        'color:rgba(122,133,153,.7);font-family:"DM Sans",sans-serif;font-size:.72rem;',
        'cursor:pointer;transition:all .18s;outline:none;',
        'display:flex;align-items:center;justify-content:center;gap:.375rem;',
      '}',
      '.tp-reset:hover{color:#e8edf5;border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.04);}',

      /* Mobile */
      '@media(max-width:480px){#theme-panel{width:100%;max-width:280px;}}',
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Build DOM ── */
  function buildPanel() {
    injectStyles();

    /* Backdrop */
    var backdrop = document.createElement('div');
    backdrop.id = 'theme-panel-backdrop';
    backdrop.addEventListener('click', closePanel);

    /* Panel */
    var panel = document.createElement('div');
    panel.id = 'theme-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Theme color settings');
    panel.innerHTML =
      '<div class="tp-header">' +
        '<span class="tp-title">Theme Color</span>' +
        '<button class="tp-close" id="tp-close-btn" aria-label="Close"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="tp-body">' +
        '<div class="tp-section-label">Presets</div>' +
        '<div class="tp-swatches" id="tp-swatches"></div>' +
        '<div class="tp-divider"></div>' +
        '<div class="tp-section-label">Custom</div>' +
        '<div class="tp-custom-row">' +
          '<input type="color" class="tp-color-input" id="tp-color-picker" value="' + activeHex + '" aria-label="Pick custom color">' +
          '<input type="text" class="tp-hex-input" id="tp-hex-input" value="' + activeHex + '" maxlength="7" placeholder="#000000" aria-label="Hex value">' +
        '</div>' +
        '<button class="tp-apply" id="tp-apply-btn">Apply Color</button>' +
        '<div class="tp-preview">' +
          '<div class="tp-section-label">Preview</div>' +
          '<div class="tp-preview-bar" id="tp-preview-bar"></div>' +
          '<div class="tp-preview-dots">' +
            '<div class="tp-preview-dot" style="width:36px"></div>' +
            '<div class="tp-preview-dot" style="width:22px;opacity:.55"></div>' +
            '<div class="tp-preview-dot" style="width:14px;opacity:.3"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tp-footer">' +
        '<button class="tp-reset" id="tp-reset-btn">' +
          '<i class="fas fa-rotate-left" style="font-size:.66rem"></i> Reset to default' +
        '</button>' +
      '</div>';

    /* Toggle tab button — arrow icon */
    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'theme-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Open theme settings');
    toggleBtn.setAttribute('title', 'Theme Settings');
    toggleBtn.innerHTML =
      '<span class="tt-arrow">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"' +
             'stroke-linecap="round" stroke-linejoin="round" width="13" height="13">' +
          '<polyline points="15 18 9 12 15 6"/>' +
        '</svg>' +
      '</span>' +
      '<span class="tt-grip"><span></span><span></span><span></span></span>';

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.appendChild(toggleBtn);

    /* Swatches */
    var grid = panel.querySelector('#tp-swatches');
    PALETTES.forEach(function(p) {
      var sw = document.createElement('div');
      sw.className = 'tp-swatch';
      sw.dataset.hex = p.hex;
      sw.style.setProperty('--sw-color', p.hex);
      sw.setAttribute('role', 'button');
      sw.setAttribute('tabindex', '0');
      sw.setAttribute('aria-label', p.name + ' ' + p.hex);
      sw.innerHTML =
        '<div class="tp-swatch-dot">' +
          '<svg viewBox="0 0 12 12" fill="none" stroke="#0a0e14" stroke-width="2.2" stroke-linecap="round">' +
            '<polyline points="2 6 5 9 10 3"/>' +
          '</svg>' +
        '</div>' +
        '<div class="tp-swatch-name">' + p.name + '</div>' +
        '<div class="tp-swatch-hex">' + p.hex + '</div>';
      sw.addEventListener('click', function() { applyColor(p.hex); });
      sw.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') applyColor(p.hex); });
      grid.appendChild(sw);
    });

    /* Events */
    panel.querySelector('#tp-close-btn').addEventListener('click', closePanel);

    panel.querySelector('#tp-color-picker').addEventListener('input', function() {
      panel.querySelector('#tp-hex-input').value = this.value;
      applyColor(this.value);
    });

    panel.querySelector('#tp-hex-input').addEventListener('input', function() {
      var v = this.value.trim();
      if (isValidHex(v)) {
        panel.querySelector('#tp-color-picker').value = v;
        applyColor(v);
      }
    });

    panel.querySelector('#tp-apply-btn').addEventListener('click', function() {
      var v = panel.querySelector('#tp-hex-input').value.trim();
      if (isValidHex(v)) applyColor(v);
    });

    panel.querySelector('#tp-reset-btn').addEventListener('click', function() {
      applyColor(DEFAULT_COLOR);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panelOpen) closePanel();
    });

    makeDraggable(toggleBtn);
  }

  /* ── Draggable tab ── */
  function makeDraggable(btn) {
    var dragging = false;
    var didDrag  = false;
    var startY   = 0;
    var startTop = 0;

    function clampY(y) {
      var h = btn.offsetHeight || 56;
      return Math.max(8, Math.min(window.innerHeight - h - 8, y));
    }

    function clientY(e) {
      if (e.clientY !== undefined) return e.clientY;
      if (e.touches && e.touches[0]) return e.touches[0].clientY;
      return 0;
    }

    /* Restore saved position */
    try {
      var saved = localStorage.getItem(STORAGE_POS_Y);
      if (saved !== null) {
        btn.style.top = clampY(parseFloat(saved)) + 'px';
        btn.style.transform = 'none';
      }
    } catch(e) {}

    function onDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      didDrag  = false;
      startY   = clientY(e);
      var rect = btn.getBoundingClientRect();
      startTop = rect.top;
      btn.style.top = startTop + 'px';
      btn.style.transform = 'none';
      btn.classList.add('dragging');
      try { if (e.pointerId !== undefined) btn.setPointerCapture(e.pointerId); } catch(err) {}
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      var dy = clientY(e) - startY;
      if (Math.abs(dy) > 4) didDrag = true;
      btn.style.top = clampY(startTop + dy) + 'px';
      if (e.cancelable) e.preventDefault();
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      btn.classList.remove('dragging');
      var finalTop = clampY(parseFloat(btn.style.top) || startTop);
      btn.style.top = finalTop + 'px';
      try { localStorage.setItem(STORAGE_POS_Y, String(finalTop)); } catch(err) {}
      if (!didDrag) togglePanel();
    }

    btn.addEventListener('pointerdown', onDown, { passive: false });
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);

    window.addEventListener('resize', function() {
      var cur = parseFloat(btn.style.top);
      if (!isNaN(cur)) btn.style.top = clampY(cur) + 'px';
    });
  }

  /* ── Open / close ── */
  function openPanel() {
    panelOpen = true;
    document.getElementById('theme-panel').classList.add('open');
    document.getElementById('theme-panel-backdrop').classList.add('open');
    document.getElementById('theme-toggle-btn').classList.add('panel-active');
    document.getElementById('theme-toggle-btn').setAttribute('aria-label', 'Close theme settings');
  }

  function closePanel() {
    panelOpen = false;
    document.getElementById('theme-panel').classList.remove('open');
    document.getElementById('theme-panel-backdrop').classList.remove('open');
    document.getElementById('theme-toggle-btn').classList.remove('panel-active');
    document.getElementById('theme-toggle-btn').setAttribute('aria-label', 'Open theme settings');
  }

  function togglePanel() {
    panelOpen ? closePanel() : openPanel();
  }

  /* ── Init ── */
  function init() {
    buildPanel();
    var saved = DEFAULT_COLOR;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR; } catch(e) {}
    applyColor(saved, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();