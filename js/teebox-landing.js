/* Tee Box landing page (vanilla JS, no dependencies)
   1. Mobile nav toggle
   2. "Your programme at a glance" 12-week timeline (lessons + practice tier)
   3. Coach + review sliders
   4. Value-add cards: fade-up reveal
   5. Press quote: background parallax
   6. Primary buttons: left-to-right wipe hover
   7. Pricing: Silver / Gold / Platinum switcher
   8. Nav dropdowns */

/* ---------- 1. Mobile nav toggle ---------- */
(function () {
  var toggle = document.querySelector('[data-tb-nav-toggle]');
  var panel = document.querySelector('[data-tb-nav-panel]');
  if (!toggle || !panel) return;

  var desktop = window.matchMedia('(min-width: 1280px)');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset when resizing up to the desktop layout
  desktop.addEventListener('change', function (e) {
    if (e.matches) setOpen(false);
  });
})();

/* ---------- 2. Programme timeline ----------
   Two pill groups drive the 12-week timeline:
     Lessons (6 / 12 / 24): spread evenly, one in the middle of each equal slot
       6  → one every 2 weeks · 12 → one a week · 24 → two a week
     Practice membership (Silver 5, Gold 8, Platinum 16 sessions a month):
       3 months' worth (15 / 24 / 48) spread evenly across the 12 weeks
   Without JS the timeline shows the week grid with no dots. */
(function () {
  var WEEKS = 12;
  var MONTHS = 3;
  var panel = document.querySelector('[data-tb-timeline]');
  var lessonGroup = document.querySelector('[data-tb-timeline-lessons]');
  var tierGroup = document.querySelector('[data-tb-timeline-tiers]');
  if (!panel || !lessonGroup || !tierGroup) return;

  var lessonPills = Array.prototype.slice.call(lessonGroup.querySelectorAll('[role="radio"]'));
  var tierPills = Array.prototype.slice.call(tierGroup.querySelectorAll('[role="radio"]'));
  var lessonTrack = panel.querySelector('[data-tb-track="lesson"]');
  var practiceTrack = panel.querySelector('[data-tb-track="practice"]');

  function dot(type, number, weekPos, order, delayStep) {
    var week = Math.min(WEEKS, Math.floor(weekPos) + 1);
    var label = (type === 'lesson' ? 'Lesson ' : 'Practice ') + number + ' · Week ' + week;
    var li = document.createElement('li');
    li.className = 'tb-dot tb-dot--' + type;
    li.style.setProperty('--x', (weekPos / WEEKS * 100).toFixed(4) + '%');
    li.style.setProperty('--i', order);
    li.style.setProperty('--step', delayStep + 'ms');
    li.setAttribute('data-label', label);
    var text = document.createElement('span');
    text.className = 'tb-visually-hidden';
    text.textContent = label;
    li.appendChild(text);
    return li;
  }

  function checked(pills) {
    return pills.filter(function (p) { return p.getAttribute('aria-checked') === 'true'; })[0] || pills[0];
  }

  function render() {
    var lessons = parseInt(checked(lessonPills).getAttribute('data-lessons'), 10);
    var tierPill = checked(tierPills);
    var practices = parseInt(tierPill.getAttribute('data-per-month'), 10) * MONTHS;

    var lessonFrag = document.createDocumentFragment();
    var practiceFrag = document.createDocumentFragment();
    var lessonSlot = WEEKS / lessons;
    var practiceSlot = WEEKS / practices;
    // keep the whole pop-in roughly the same length however many dots there are
    var lessonStep = Math.round(600 / lessons);
    var practiceStep = Math.round(600 / practices);

    for (var i = 0; i < lessons; i++) {
      lessonFrag.appendChild(dot('lesson', i + 1, lessonSlot * (i + 0.5), i, lessonStep));
    }
    for (var j = 0; j < practices; j++) {
      practiceFrag.appendChild(dot('practice', j + 1, practiceSlot * (j + 0.5), j, practiceStep));
    }

    lessonTrack.replaceChildren(lessonFrag);
    practiceTrack.replaceChildren(practiceFrag);
    practiceTrack.classList.toggle('is-dense', practices > 30);
  }

  function wire(pills) {
    pills.forEach(function (pill, index) {
      function choose(focus) {
        pills.forEach(function (p) {
          var on = p === pill;
          p.setAttribute('aria-checked', String(on));
          p.tabIndex = on ? 0 : -1;
        });
        render();
        if (focus) pill.focus();
      }
      pill.addEventListener('click', function () { choose(false); });
      pill.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = pills[(index + 1) % pills.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = pills[(index - 1 + pills.length) % pills.length];
        if (next) { e.preventDefault(); next.click(); next.focus(); }
      });
    });
  }

  wire(lessonPills);
  wire(tierPills);
  render();
})();

/* ---------- 3. Sliders (coaches, reviews) ----------
   The track is a native horizontal scroller with CSS scroll-snap, so touch
   swipe, trackpads and keyboard scrolling work without JS. This only wires
   the prev/next buttons and disables them at either end. */
(function () {
  var sliders = document.querySelectorAll('[data-tb-slider]');

  Array.prototype.forEach.call(sliders, function (slider) {
    var track = slider.querySelector('[data-tb-slider-track]');
    var prev = slider.querySelector('[data-tb-slider-prev]');
    var next = slider.querySelector('[data-tb-slider-next]');
    if (!track || !prev || !next) return;

    function step() {
      var card = track.firstElementChild;
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function update() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();

/* ---------- 4. Value-add cards: fade-up reveal ----------
   Plays once, then stays: when the cards are a fifth of the way up the screen
   they fade in and lift 20px one after another, left to right and row by row.
   Scrolling back up doesn't undo it. On stacked (mobile) layouts each card
   plays as it scrolls into view. With JS off or reduced motion, the cards
   simply show. */
(function () {
  var wrap = document.querySelector('[data-tb-essentials]');
  if (!wrap || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var list = wrap.querySelector('.tb-extras');
  var cards = Array.prototype.slice.call(wrap.querySelectorAll('.tb-extra'));
  if (!list || !cards.length) return;

  var STEP = 0.12; // seconds between cards
  var stacked = window.matchMedia('(max-width: 599px)').matches;
  wrap.classList.add('is-armed');

  if (stacked) {
    var cardIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        cardIO.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    cards.forEach(function (card) { cardIO.observe(card); });
    return;
  }

  var listIO = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    listIO.disconnect();
    cards.forEach(function (card, i) {
      card.style.transitionDelay = (i * STEP).toFixed(2) + 's';
      card.classList.add('is-in');
    });
  }, { rootMargin: '0px 0px -20% 0px' });
  listIO.observe(list);
})();

/* ---------- 5. Press quote: background parallax ----------
   As the block scrolls through the screen, its photo moves at a slightly
   different speed from the page (from -60px to +60px, set by --tb-parallax in
   the CSS), so it appears to drift gently behind the quote. Only runs while the
   block is on screen. Off for reduced motion. */
(function () {
  var blocks = document.querySelectorAll('[data-tb-parallax]');
  if (!blocks.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var items = Array.prototype.map.call(blocks, function (block) {
    return { block: block, img: block.querySelector('.tb-quote__bg'), visible: false };
  }).filter(function (item) { return item.img; });

  function update() {
    var vh = window.innerHeight;
    items.forEach(function (item) {
      if (!item.visible) return;
      var r = item.block.getBoundingClientRect();
      var range = parseFloat(getComputedStyle(item.block).getPropertyValue('--tb-parallax')) || 60;
      // 0 as the block enters at the bottom → 1 as it leaves at the top
      var progress = (vh - r.top) / (vh + r.height);
      progress = progress < 0 ? 0 : progress > 1 ? 1 : progress;
      item.img.style.setProperty('--tb-parallax-y', ((progress - 0.5) * 2 * range).toFixed(1) + 'px');
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { update(); ticking = false; });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        items.forEach(function (item) {
          if (item.block === entry.target) item.visible = entry.isIntersecting;
        });
      });
      onScroll();
    });
    items.forEach(function (item) { io.observe(item.block); });
  } else {
    items.forEach(function (item) { item.visible = true; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ---------- 6. Primary buttons: left-to-right wipe hover ----------
   Adds a black-on-gold copy of each gold button's label (.tb-btn__fill) and
   plays a CSS wipe on it: out to the right on hover/focus, back in from the
   left on leave/blur. Without JS, or with reduced motion, the buttons keep a
   simple CSS hover. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var buttons = document.querySelectorAll('.tb-btn--gold');

  Array.prototype.forEach.call(buttons, function (btn) {
    var label = btn.querySelector('span');
    if (!label) return;

    var fill = label.cloneNode(true);
    fill.className = 'tb-btn__fill';
    fill.setAttribute('aria-hidden', 'true');
    btn.appendChild(fill);
    btn.classList.add('tb-btn--wipe');

    var over = false;
    function enter() {
      if (over) return;
      over = true;
      btn.classList.remove('is-wipe-in');
      btn.classList.add('is-wipe-out');
    }
    function leave() {
      if (!over) return;
      over = false;
      btn.classList.remove('is-wipe-out');
      btn.classList.add('is-wipe-in');
    }

    btn.addEventListener('pointerenter', enter);
    btn.addEventListener('pointerleave', function () {
      if (!btn.matches(':focus-visible')) leave(); // a mouse click focuses the link but shouldn't hold the state
    });
    btn.addEventListener('focus', function () {
      if (btn.matches(':focus-visible')) enter();
    });
    btn.addEventListener('blur', function () {
      if (!btn.matches(':hover')) leave();
    });
  });
})();

/* ---------- 7. Pricing: Silver / Gold / Platinum switcher ----------
   Each pricing card stores its prices per tier in data-prices (JSON). The
   pills swap the price, "bought separately" price, monthly instalment, tier
   name and sessions per month on every card. Without JS the pills stay
   hidden and the Silver prices (in the HTML) show. */
(function () {
  var group = document.querySelector('[data-tb-tier-pills]');
  if (!group) return;
  var pills = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tb-price[data-prices]'));
  if (!pills.length || !cards.length) return;

  function setText(root, sel, value) {
    Array.prototype.forEach.call(root.querySelectorAll(sel), function (el) { el.textContent = value; });
  }

  function select(pill, focus) {
    var tier = pill.getAttribute('data-tier');
    pills.forEach(function (p) {
      var on = p === pill;
      p.setAttribute('aria-checked', String(on));
      p.tabIndex = on ? 0 : -1;
    });
    cards.forEach(function (card) {
      var data;
      try { data = JSON.parse(card.getAttribute('data-prices'))[tier]; } catch (e) { return; }
      if (!data) return;
      setText(card, '[data-tb-price]', data.price);
      setText(card, '[data-tb-was]', data.was);
      setText(card, '[data-tb-monthly]', data.monthly);
      setText(card, '[data-tb-tier-name]', pill.getAttribute('data-tier-label'));
      setText(card, '[data-tb-sessions]', pill.getAttribute('data-sessions'));
    });
    if (focus) pill.focus();
  }

  pills.forEach(function (pill, i) {
    pill.addEventListener('click', function () { select(pill, false); });
    pill.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = pills[(i + 1) % pills.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = pills[(i - 1 + pills.length) % pills.length];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  group.hidden = false;
  select(pills[0], false);
})();

/* ---------- 8. Nav dropdowns (Golf lessons, Putting) ----------
   Desktop opens on hover/focus via CSS; a click (or tap) toggles too. In the
   mobile menu they work as accordions. Escape or a click outside closes. */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-tb-drop]'));
  if (!items.length) return;
  function close(item) {
    item.classList.remove('is-open');
    item.querySelector('button').setAttribute('aria-expanded', 'false');
  }
  items.forEach(function (item) {
    var btn = item.querySelector('button');
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      items.forEach(close);
      if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', function (e) {
    items.forEach(function (item) { if (!item.contains(e.target)) close(item); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    items.forEach(function (item) {
      if (item.classList.contains('is-open')) { close(item); item.querySelector('button').focus(); }
    });
  });
})();
