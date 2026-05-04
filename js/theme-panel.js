/* ============================================================
   THEME COLOR PANEL — js/theme-panel.js
   Simpan file ini di folder js/ dalam project kamu
   ============================================================ */

(function () {
  'use strict';

  /* ── Palette presets ── */
  const PALETTES = [
    { name: 'Teal',     hex: '#00d4aa', rgb: '0,212,170'   },
    { name: 'Electric', hex: '#00aaff', rgb: '0,170,255'   },
    { name: 'Violet',   hex: '#a78bfa', rgb: '167,139,250' },
    { name: 'Coral',    hex: '#ff6b6b', rgb: '255,107,107' },
    { name: 'Gold',     hex: '#f59e0b', rgb: '245,158,11'  },
    { name: 'Lime',     hex: '#84cc16', rgb: '132,204,22'  },
    { name: 'Rose',     hex: '#fb7185', rgb: '251,113,133' },
    { name: 'Cyan',     hex: '#22d3ee', rgb: '34,211,238'  },
    { name: 'Indigo',   hex: '#6366f1', rgb: '99,102,241'  },
    { name: 'Amber',    hex: '#fbbf24', rgb: '251,191,36'  },
  ];

  const DEFAULT_COLOR = '#00d4aa';
  const STORAGE_KEY   = 'bb-portfolio-accent';

  let panelOpen  = false;
  let activeHex  = DEFAULT_COLOR;

  /* ── Helpers ── */
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
  }

  function isValidHex(hex) {
    return /^#[0-9a-fA-F]{6}$/.test(hex);
  }

  /* ── Apply color to entire page ── */
  function applyColor(hex, save = true) {
    if (!isValidHex(hex)) return;
    activeHex = hex;
    const rgb = hexToRgb(hex);

    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-rgb', rgb);

    /* Update preview elements inside panel */
    const bar = document.getElementById('tp-preview-bar');
    const dots = document.querySelectorAll('.tp-preview-dot');
    if (bar) bar.style.background = `linear-gradient(90deg, ${hex} 0%, rgba(255,255,255,0.06) 100%)`;
    dots.forEach(d => { d.style.background = hex; });

    /* Update apply button background */
    const applyBtn = document.getElementById('tp-apply-btn');
    if (applyBtn) {
      applyBtn.style.background = hex;
    }

    /* Sync custom inputs */
    const picker = document.getElementById('tp-color-picker');
    const hexIn  = document.getElementById('tp-hex-input');
    if (picker) picker.value = hex;
    if (hexIn)  hexIn.value  = hex;

    /* Mark active swatch */
    document.querySelectorAll('.tp-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.hex === hex);
    });

    /* Persist */
    if (save) {
      try { localStorage.setItem(STORAGE_KEY, hex); } catch(_) {}
    }
  }

  /* ── Build HTML ── */
  function buildPanel() {
    /* Backdrop */
    const backdrop = document.createElement('div');
    backdrop.className = 'theme-panel-backdrop';
    backdrop.id = 'theme-panel-backdrop';
    backdrop.addEventListener('click', closePanel);

    /* Panel */
    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.id = 'theme-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Theme color settings');

    /* Header */
    panel.innerHTML = `
      <div class="tp-header">
        <span class="tp-title">Theme Color</span>
        <button class="tp-close" id="tp-close-btn" aria-label="Close theme panel">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="tp-body">

        <div class="tp-label">Presets</div>
        <div class="tp-swatches" id="tp-swatches"></div>

        <div class="tp-divider"></div>

        <div class="tp-label">Custom</div>
        <div class="tp-custom-row">
          <input type="color" class="tp-color-input" id="tp-color-picker" value="${activeHex}" aria-label="Pick custom color">
          <input type="text" class="tp-hex-input" id="tp-hex-input" value="${activeHex}" maxlength="7" placeholder="#000000" aria-label="Hex color value">
        </div>
        <button class="tp-apply" id="tp-apply-btn">Apply Color</button>

        <div class="tp-preview">
          <div class="tp-label">Preview</div>
          <div class="tp-preview-bar" id="tp-preview-bar"></div>
          <div class="tp-preview-dots">
            <div class="tp-preview-dot" style="width:32px"></div>
            <div class="tp-preview-dot" style="width:20px;opacity:0.6"></div>
            <div class="tp-preview-dot" style="width:12px;opacity:0.35"></div>
          </div>
        </div>

      </div>

      <div class="tp-footer">
        <button class="tp-reset" id="tp-reset-btn">
          <i class="fas fa-rotate-left" style="margin-right:0.375rem;font-size:0.7rem"></i>
          Reset to default
        </button>
      </div>
    `;

    /* Toggle button */
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.id = 'theme-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Open theme settings');
    toggleBtn.setAttribute('title', 'Theme Settings');
    toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
      </svg>
    `;
    toggleBtn.addEventListener('click', togglePanel);

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.appendChild(toggleBtn);

    /* Build swatches */
    const swatchGrid = panel.querySelector('#tp-swatches');
    PALETTES.forEach(p => {
      const sw = document.createElement('div');
      sw.className = 'tp-swatch';
      sw.dataset.hex = p.hex;
      sw.style.setProperty('--sw-color', p.hex);
      sw.setAttribute('role', 'button');
      sw.setAttribute('tabindex', '0');
      sw.setAttribute('aria-label', `${p.name} ${p.hex}`);
      sw.innerHTML = `
        <div class="tp-swatch-dot"></div>
        <div class="tp-swatch-name">${p.name}</div>
        <div class="tp-swatch-hex">${p.hex}</div>
      `;
      sw.addEventListener('click', () => applyColor(p.hex));
      sw.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') applyColor(p.hex); });
      swatchGrid.appendChild(sw);
    });

    /* Events */
    panel.querySelector('#tp-close-btn').addEventListener('click', closePanel);

    panel.querySelector('#tp-color-picker').addEventListener('input', function () {
      panel.querySelector('#tp-hex-input').value = this.value;
      applyColor(this.value);
    });

    panel.querySelector('#tp-hex-input').addEventListener('input', function () {
      const v = this.value.trim();
      if (isValidHex(v)) {
        panel.querySelector('#tp-color-picker').value = v;
        applyColor(v);
      }
    });

    panel.querySelector('#tp-apply-btn').addEventListener('click', () => {
      const v = panel.querySelector('#tp-hex-input').value.trim();
      if (isValidHex(v)) applyColor(v);
    });

    panel.querySelector('#tp-reset-btn').addEventListener('click', () => {
      applyColor(DEFAULT_COLOR);
    });

    /* Keyboard: close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panelOpen) closePanel();
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

    /* Restore saved color */
    let saved = DEFAULT_COLOR;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR; } catch(_) {}

    applyColor(saved, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
