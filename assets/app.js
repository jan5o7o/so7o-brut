/* SO7O BRUT — shared page helpers.
   Everything is dependency free. The font itself is described by
   assets/glyphs.json, which build.py rewrites on every build. */

(function () {
  'use strict';

  // Digits are built from char codes on purpose: a literal run of ten digits
  // gets scrubbed by some tooling and would corrupt the file. Same reason
  // build.py uses chr(48 + i).
  const DIGITS = Array.from({ length: 10 }, (_, i) => String.fromCharCode(48 + i));
  const UPPER = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const LOWER = UPPER.map(c => c.toLowerCase());
  const PUNCT = Array.from(".,:;!?-–—_/\\|+=<>()[]{}'\"\u2018\u2019*@&%$#^~`\u00b0\u2022\u00a9");

  const FAMILIES = {
    slab: 'So7o Brut Slab',
    square: 'So7o Brut Square',
    condensed: 'So7o Brut Condensed',
    wide: 'So7o Brut Wide'
  };

  // Kerning, in units of 1000 (the upm): 50 is -0.05em, and -50 font units in
  // the SVG maker. Derived in build.py from the outlines - every glyph carries
  // the same 50 units of sidebearing, so a loose pair is one where the shapes
  // leave that air unused. `python3 build.py --kern` reprints this block; edit
  // build.py, never this copy.
  const KERN = {
    'AT': 40, 'AV': 50, 'AW': 50, 'AY': 50, 'CV': 35, 'CW': 25, 'CX': 55,
    'CY': 55, 'FA': 40, 'GT': 90, 'GV': 80, 'GW': 60, 'GX': 55, 'GY': 90,
    'KC': 55, 'KG': 55, 'KO': 55, 'KQ': 55, 'LT': 90, 'LV': 90, 'LW': 90,
    'LY': 90, 'OV': 35, 'OW': 25, 'OX': 55, 'OY': 55, 'PA': 25, 'QV': 35,
    'QW': 25, 'QY': 55, 'TA': 40, 'VA': 50, 'VC': 35, 'VG': 35, 'VO': 35,
    'VQ': 35, 'WA': 50, 'WC': 25, 'WG': 25, 'WO': 25, 'WQ': 25, 'XC': 55,
    'XG': 55, 'XO': 55, 'XQ': 55, 'YA': 50, 'YC': 55, 'YG': 55, 'YO': 55,
    'YQ': 55};

  // The palette the two working pages offer as swatches, next to their colour
  // pickers: neutrals warm enough to sit with the paper, one pale red and one
  // pale orange ramp. Pale tints are grounds, the 500s are marks/borders, the
  // 700s are the text-safe deep tones. Contrast numbers live in docs/palette.md.
  const PALETTE = [
    { name: 'ink', hex: '#101010' },
    { name: 'grey 900', hex: '#1C1B19' },
    { name: 'grey 700', hex: '#2E2C28' },
    { name: 'grey 600', hex: '#4B4841' },
    { name: 'grey 500', hex: '#6B675C' },
    { name: 'grey 400', hex: '#9B9689' },
    { name: 'grey 300', hex: '#C3BEB0' },
    { name: 'grey 200', hex: '#DCD8CA' },
    { name: 'grey 100', hex: '#EDEAE0' },
    { name: 'paper', hex: '#F2EFE4' },
    { name: 'white', hex: '#FFFFFF' },
    { name: 'red 100', hex: '#F7DAD4' },
    { name: 'red 200', hex: '#F0BDB3' },
    { name: 'red 300', hex: '#E79D90' },
    { name: 'red 500', hex: '#C24A34' },
    { name: 'red 700', hex: '#8E2F22' },
    { name: 'orange 100', hex: '#FAE0C9' },
    { name: 'orange 200', hex: '#F5C9A5' },
    { name: 'orange 300', hex: '#EFB07F' },
    { name: 'orange 500', hex: '#C76520' },
    { name: 'orange 700', hex: '#8A4517' }
  ];

  // Swatches under a colour input: clicking one sets the input and fires the
  // same `input` event the picker would, so the page's render wiring just works.
  function buildChips(container, picker) {
    container.textContent = '';
    for (const swatch of PALETTE) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.style.background = swatch.hex;
      b.dataset.hex = swatch.hex.toLowerCase();
      b.title = swatch.name + ' · ' + swatch.hex;
      b.setAttribute('aria-label', swatch.name + ' ' + swatch.hex);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        picker.value = swatch.hex;
        picker.dispatchEvent(new Event('input', { bubbles: true }));
      });
      container.append(b);
    }
    return container;
  }

  // A palette in a popover: chips from PALETTE plus a way out to any colour.
  // Used by the poster's per-line swatches, where 21 inline chips per control
  // would bury the panel.
  let popover = null;

  function closeColor() {
    if (!popover) return;
    popover.remove();
    popover = null;
    document.removeEventListener('pointerdown', outsideColor, true);
    document.removeEventListener('keydown', escapeColor, true);
  }

  function outsideColor(e) {
    if (popover && !popover.contains(e.target)) closeColor();
  }

  function escapeColor(e) {
    if (e.key === 'Escape') closeColor();
  }

  function pickColor(anchorEl, current, onPick) {
    closeColor();
    const box = document.createElement('div');
    box.className = 'palette-pop';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Palette');

    const grid = document.createElement('div');
    grid.className = 'chips';
    const now = String(current || '').toLowerCase();
    for (const swatch of PALETTE) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.style.background = swatch.hex;
      b.title = swatch.name + ' · ' + swatch.hex;
      b.setAttribute('aria-label', swatch.name + ' ' + swatch.hex);
      b.setAttribute('aria-pressed', swatch.hex.toLowerCase() === now ? 'true' : 'false');
      b.addEventListener('click', () => { onPick(swatch.hex); closeColor(); });
      grid.append(b);
    }

    const custom = document.createElement('label');
    custom.className = 'pop-custom';
    custom.textContent = 'any colour';
    const input = document.createElement('input');
    input.type = 'color';
    input.value = /^#[0-9a-f]{6}$/i.test(now) ? now : '#101010';
    input.addEventListener('input', () => onPick(input.value));
    custom.append(input);

    box.append(grid, custom);
    document.body.append(box);

    const r = anchorEl.getBoundingClientRect();
    const w = box.offsetWidth, h = box.offsetHeight;
    const left = Math.min(Math.max(8, r.left), Math.max(8, innerWidth - w - 8));
    const top = r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6;
    box.style.left = left + 'px';
    box.style.top = top + 'px';

    popover = box;
    setTimeout(() => document.addEventListener('pointerdown', outsideColor, true), 0);
    document.addEventListener('keydown', escapeColor, true);
  }

  // WCAG contrast of two hex colours, for the readout under the pickers.
  function contrast(a, b) {
    const lin = c => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const lum = hex => {
      const h = String(hex || '').replace('#', '');
      const [r, g, bl] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0);
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
    };
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function markChips(container, hex) {
    const value = String(hex || '').toLowerCase();
    for (const b of container.children) {
      b.setAttribute('aria-pressed', b.dataset.hex === value ? 'true' : 'false');
    }
  }

  // Negative offset for a pair, in em (multiply by the upm for font units).
  function kern(left, right, strength) {
    const units = KERN[(left + right).toUpperCase()] || 0;
    if (!units) return 0;
    const s = strength === undefined ? 1 : strength;
    return -(units / 1000) * s;
  }


  let toastTimer = null;

  function toast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.append(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 1600);
  }

  function copy(text) {
    const done = () => toast('copied');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('copy failed'); }
      ta.remove();
    }
  }

  function hex(ch) {
    return 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  }

  function loadData() {
    return fetch('assets/glyphs.json', { cache: 'no-cache' }).then(r => {
      if (!r.ok) throw new Error('glyphs.json ' + r.status);
      return r.json();
    });
  }

  function pickVariant(data, id) {
    return data.variants.find(v => v.id === id) || data.variants[0];
  }

  // A grid of glyph cells. Clicking a cell copies the character.
  function buildGrid(el, family, chars) {
    el.textContent = '';
    for (const ch of chars) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.fontFamily = family;
      const big = document.createElement('div');
      big.className = 'ch';
      big.textContent = ch;
      const label = document.createElement('div');
      label.className = 'hex';
      label.textContent = hex(ch);
      cell.append(big, label);
      cell.title = hex(ch) + ' — click to copy';
      cell.addEventListener('click', () => copy(ch));
      el.append(cell);
    }
  }

  function qs(name, fallback) {
    const p = new URLSearchParams(location.search);
    return p.has(name) ? p.get(name) : fallback;
  }

  // ---------------------------------------------------------------- theme
  // Light unless the system says otherwise; a click stores the choice, and the
  // shell keeps following the system for as long as nobody has clicked.
  const THEME_KEY = 'sb-theme';

  function themeButtons() {
    return document.querySelectorAll('[data-theme-toggle]');
  }

  function systemTheme() {
    return window.matchMedia &&
      matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    return set === 'dark' || set === 'light' ? set : systemTheme();
  }

  function storedTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch (e) { return null; }
  }

  // The button is labelled with the mode a click gives you, not the current one.
  function paintTheme() {
    const target = currentTheme() === 'dark' ? 'light' : 'dark';
    for (const b of themeButtons()) {
      const label = b.querySelector('.t');
      if (label) label.textContent = target;
      const msg = 'Switch to ' + target + ' theme';
      b.setAttribute('aria-label', msg);
      b.title = msg;
    }
  }

  function setTheme(next, store) {
    document.documentElement.dataset.theme = next;
    if (store) { try { localStorage.setItem(THEME_KEY, next); } catch (e) {} }
    paintTheme();
  }

  function initTheme() {
    const stored = storedTheme();
    if (stored) document.documentElement.dataset.theme = stored;
    paintTheme();
    for (const b of themeButtons()) {
      b.addEventListener('click', () => {
        setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
      });
    }
    if (window.matchMedia) {
      matchMedia('(prefers-color-scheme: dark)').addEventListener(
        'change', () => { if (!storedTheme()) paintTheme(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  window.SB = {
    DIGITS, UPPER, LOWER, PUNCT, FAMILIES, KERN, PALETTE,
    toast, copy, hex, loadData, pickVariant, buildGrid, qs, kern,
    buildChips, markChips, contrast, pickColor, closeColor,
    theme: { current: currentTheme, set: setTheme, init: initTheme },
    clamp: (v, lo, hi) => Math.min(hi, Math.max(lo, v))
  };
})();
