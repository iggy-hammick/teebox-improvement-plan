/* =========================================================================
   DEV ONLY: layout grid overlay. Press "G" to toggle.
   Desktop (≥1024px): 12 columns · 80px margin · 20px gutter · capped at 1600px
   Tablet (600–1023px): 8 columns · 32px margin · 20px gutter
   Phone (<600px):      4 columns · 20px margin · 20px gutter
   The margin is read from the page's --tb-gutter token, so the overlay always
   matches the live layout. Runs only on localhost / 127.0.0.1 / *.local /
   *.test, so it's harmless if it ships, but the agency can delete this file
   and its <script> tag.
   ========================================================================= */
(function () {
  var host = location.hostname;
  var isDev = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' ||
              /\.(local|test|localhost)$/.test(host);
  if (!isDev) return;

  var GUTTER = 20;
  var MAX = 1600;
  var MAX_COLUMNS = 12;
  var STORAGE_KEY = 'tb-grid-visible';

  function columnsFor(width) {
    if (width >= 1024) return 12;
    if (width >= 600) return 8;
    return 4;
  }

  var style = document.createElement('style');
  style.textContent =
    '.tb-grid-overlay{position:fixed;inset:0;z-index:9999;pointer-events:none;display:none}' +
    '.tb-grid-overlay.is-visible{display:block}' +
    '.tb-grid-overlay__inner{height:100%;max-width:' + MAX + 'px;margin:0 auto;' +
      'padding:0 var(--tb-grid-margin,80px);display:grid;' +
      'grid-template-columns:repeat(var(--tb-grid-cols,12),minmax(0,1fr));' +
      'column-gap:' + GUTTER + 'px;box-sizing:border-box}' +
    '.tb-grid-overlay__col{background:rgba(255,0,80,.12);border-inline:1px solid rgba(255,0,80,.35)}' +
    '.tb-grid-overlay__col[hidden]{display:none}' +
    '.tb-grid-overlay__label{position:fixed;right:12px;bottom:12px;max-width:calc(100% - 24px);' +
      'padding:6px 10px;background:rgba(0,0,0,.8);color:#fff;' +
      'font:500 12px/1.3 system-ui,sans-serif;border-radius:4px}';
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'tb-grid-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  var inner = document.createElement('div');
  inner.className = 'tb-grid-overlay__inner';
  var cols = [];
  for (var i = 0; i < MAX_COLUMNS; i++) {
    var col = document.createElement('div');
    col.className = 'tb-grid-overlay__col';
    inner.appendChild(col);
    cols.push(col);
  }
  overlay.appendChild(inner);

  var label = document.createElement('div');
  label.className = 'tb-grid-overlay__label';
  overlay.appendChild(label);

  document.body.appendChild(overlay);

  function layout() {
    var width = document.documentElement.clientWidth;
    var count = columnsFor(width);
    var margin = getComputedStyle(document.documentElement).getPropertyValue('--tb-gutter').trim() || '80px';

    inner.style.setProperty('--tb-grid-cols', count);
    inner.style.setProperty('--tb-grid-margin', margin);
    cols.forEach(function (c, idx) { c.hidden = idx >= count; });

    var colWidth = cols[0].getBoundingClientRect().width;
    label.textContent = count + ' cols · ' + margin + ' margin · ' + GUTTER + 'px gutter · col ' +
      colWidth.toFixed(1) + 'px · viewport ' + width + 'px';
  }

  function setVisible(visible) {
    overlay.classList.toggle('is-visible', visible);
    if (visible) layout();
    try { localStorage.setItem(STORAGE_KEY, visible ? '1' : '0'); } catch (e) {}
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'g' && e.key !== 'G') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    setVisible(!overlay.classList.contains('is-visible'));
  });

  window.addEventListener('resize', function () {
    if (overlay.classList.contains('is-visible')) layout();
  });

  // Remember the last state across reloads
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === '1') setVisible(true);
})();
