(() => {
  'use strict';
  let data = globalThis.SocialBookData;
  const find = selector => document.querySelector(selector);
  const date = find('#book-date');
  if (!data || !date) return;
  const state = { mode: 'in', type: 'kid', page: 1, size: 10 };
  const typeNames = { kid: 'Kid', elder: 'Elder', pet: 'Pet' };
  const typeButtons = data.types.map(type => find('#book-type-' + type));
  const shortDate = value => new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
  const dateLabel = value => value + (value === data.today ? ' · Today' : '');
  const integer = new Intl.NumberFormat('en-MY');
  const money = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const compact = new Intl.NumberFormat('en-MY', { notation: 'compact', maximumFractionDigits: 1 });
  const dialog = find('#book-image-dialog');
  const tabs = [find('#book-tab-in'), find('#book-tab-out')];
  let returnFocus;
  let animations = [];
  let graphKey;
  const node = (tag, text, className) => {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  };
  const time = value => { const item = node('time', value); item.dateTime = value; return item; };
  const set = (selector, value) => { find(selector).textContent = value; };
  const cancelAnimations = () => { animations.forEach(animation => animation.cancel()); animations = []; };
  const animate = (event, modeChanged = false) => {
    // Keyboard updates stay instant; pointer switches use a short spatial cue.
    if (!event?.detail || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const selectors = ['.book-overview-stats', '.book-chart-area'];
    if (modeChanged) selectors.push('#book-intro', '.book-scope', '.book-panel-heading');
    for (const selector of selectors) {
      const animation = find(selector).animate?.(
        [{ opacity: .45, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: selector === '.book-chart-area' ? 240 : 180, easing: 'cubic-bezier(.23,1,.32,1)' }
      );
      if (animation) animations.push(animation);
    }
  };
  // Disable even CSS motion for keyboard navigation and assistive activation.
  find('#main').addEventListener('keydown', () => { find('#main').dataset.motion = 'instant'; cancelAnimations(); });
  function populateDates(selected = data.today) {
    date.replaceChildren();
    for (const value of data.dates) { const option = node('option', dateLabel(value)); option.value = value; date.append(option); }
    date.value = data.dates.includes(selected) ? selected : data.today;
  }
  populateDates();
  function analysisDays() {
    return [...data.dates].reverse().map(value => ({ date: value, ...data.summary(value, state.type) }));
  }
  const svgNode = (tag, attributes = {}, text) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    if (text !== undefined) element.textContent = text;
    return element;
  };
  function drawGraph(days, isIn) {
    const container = find('#book-chart'); container.replaceChildren();
    const svg = svgNode('svg', { viewBox: '0 0 720 250', role: 'group', 'aria-label': typeNames[state.type] + ': daily ' + (isIn ? 'Total Coins' : 'company spending in RM') + '. Use arrow keys to explore dates.' });
    const defs = svgNode('defs');
    const gradient = svgNode('linearGradient', { id: 'book-chart-fill', x1: '0', y1: '0', x2: '0', y2: '1' });
    gradient.append(svgNode('stop', { offset: '0%', 'stop-opacity': .18, class: 'book-graph-stop' }), svgNode('stop', { offset: '100%', 'stop-opacity': .01, class: 'book-graph-stop' }));
    defs.append(gradient); svg.append(defs);
    const values = days.map(day => isIn ? day.coins : day.sen / 100);
    const maximum = Math.max(1, ...values) * 1.12;
    const left = 58, right = 702, top = 16, bottom = 210;
    for (let index = 0; index <= 4; index++) {
      const y = bottom - (bottom - top) * index / 4;
      svg.append(svgNode('line', { x1: left, x2: right, y1: y, y2: y, class: 'book-graph-grid' }));
      svg.append(svgNode('text', { x: left - 12, y: y + 4, 'text-anchor': 'end', class: 'book-graph-label' }, compact.format(maximum * index / 4)));
    }
    const points = days.map((day, index) => ({ day, value: values[index], x: days.length === 1 ? (left + right) / 2 : left + index * (right - left) / (days.length - 1), y: bottom - values[index] / maximum * (bottom - top) }));
    if (points.length) {
      const coordinates = points.map(point => point.x + ',' + point.y).join(' ');
      svg.append(svgNode('polygon', { points: points[0].x + ',' + bottom + ' ' + coordinates + ' ' + points.at(-1).x + ',' + bottom, class: 'book-graph-area' }));
      svg.append(svgNode('polyline', { points: coordinates, class: 'book-graph-line', 'vector-effect': 'non-scaling-stroke' }));
    }
    const guide = svgNode('line', { y1: top, y2: bottom, class: 'book-graph-guide' });
    const halo = svgNode('circle', { r: 12, class: 'book-graph-halo' });
    svg.append(guide, halo);
    const markerNodes = [];
    const show = index => {
      const point = points[index];
      guide.setAttribute('x1', point.x); guide.setAttribute('x2', point.x);
      halo.setAttribute('cx', point.x); halo.setAttribute('cy', point.y);
      set('#book-chart-readout', dateLabel(point.day.date) + ' · ' + (isIn ? integer.format(point.value) + ' Total Coins' : 'RM ' + money.format(point.value)));
      markerNodes.forEach((marker, i) => { marker.setAttribute('tabindex', i === index ? '0' : '-1'); marker.setAttribute('aria-pressed', String(i === index)); });
    };
    points.forEach((point, index) => {
      const label = dateLabel(point.day.date) + ': ' + (isIn ? integer.format(point.value) + ' Total Coins' : 'RM ' + money.format(point.value));
      const marker = svgNode('circle', { cx: point.x, cy: point.y, r: 5, class: 'book-graph-point' + (point.day.date === data.today ? ' is-today' : ''), role: 'button', tabindex: '-1', 'aria-label': label });
      marker.append(svgNode('title', {}, label));
      marker.addEventListener('pointerenter', () => show(index));
      marker.addEventListener('focus', () => show(index));
      marker.addEventListener('click', () => show(index));
      marker.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? points.length - 1 : event.key === 'ArrowLeft' ? Math.max(0, index - 1) : event.key === 'ArrowRight' ? Math.min(points.length - 1, index + 1) : index;
        show(next); markerNodes[next].focus();
      });
      markerNodes.push(marker); svg.append(marker);
    });
    points.forEach((point, index) => svg.append(svgNode('text', { x: point.x, y: 240, 'text-anchor': index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle', class: 'book-graph-label' + (point.day.date === data.today ? ' is-today' : '') }, point.day.date === data.today ? 'Today' : shortDate(point.day.date))));
    container.append(svg);
    if (points.length) show(points.length - 1);
  }
  function showEvidence(record, trigger) {
    returnFocus = trigger;
    set('#book-dialog-date', record.date + ' · ' + typeNames[record.type] + ' · RM ' + money.format(record.sen / 100));
    const content = find('#book-dialog-content'); content.replaceChildren();
    for (const image of record.images) {
      if (!/^\/(?!\/)|^https:\/\//.test(image.src)) continue;
      const figure = node('figure'); const img = node('img'); img.src = image.src; img.alt = image.alt;
      img.addEventListener('error', () => figure.replaceChildren(node('p', 'Image unavailable')));
      figure.append(img, node('figcaption', image.alt)); content.append(figure);
    }
    if (!content.children.length) content.append(node('div', 'No image available', 'book-dialog-empty'));
    dialog.showModal();
  }
  // Each row is one company submission, with its own amount and evidence.
  function renderCompanyRows(records) {
    find('#book-out-rows').replaceChildren();
    for (const record of records) {
      const row = node('tr'); row.dataset.date = record.date; row.dataset.type = record.type; row.dataset.key = record.key;
      const day = node('th'); day.scope = 'row'; day.append(time(record.date));
      const cell = node('td'); const button = node('button', 'View ↗', 'book-view-evidence'); button.type = 'button';
      button.setAttribute('aria-label', 'View ' + typeNames[record.type] + ' spending evidence for ' + record.date + ', RM ' + money.format(record.sen / 100) + ', record ' + record.key);
      button.addEventListener('click', () => showEvidence(record, button)); cell.append(button);
      row.append(day, node('td', money.format(record.sen / 100), 'book-number'), cell); find('#book-out-rows').append(row);
    }
  }
  function render() {
    cancelAnimations();
    const isIn = state.mode === 'in';
    const days = analysisDays();
    const summary = days.reduce((total, day) => ({ coins: total.coins + day.coins, count: total.count + day.count, highest: Math.max(total.highest, day.highest), sen: total.sen + day.sen, companyRecords: total.companyRecords + day.companyRecords, highestOut: Math.max(total.highestOut, day.sen) }), { coins: 0, count: 0, highest: 0, sen: 0, companyRecords: 0, highestOut: 0 });
    find('#main').dataset.mode = state.mode;
    set('#book-intro', isIn ? 'Explore coins spent by character.' : 'Explore company-submitted spending by character type.');
    typeButtons.forEach((button, index) => { const active = data.types[index] === state.type; button.setAttribute('aria-checked', String(active)); button.tabIndex = active ? 0 : -1; });
    set('#book-analysis-title', typeNames[state.type] + (isIn ? ' · Coins spent' : ' · RM spent'));
    set('#book-window', shortDate(data.dates.at(-1)) + ' — ' + shortDate(data.today));
    tabs.forEach((tab, index) => { const active = index === (isIn ? 0 : 1); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    find('#book-dashboard').setAttribute('aria-labelledby', isIn ? 'book-tab-in' : 'book-tab-out');
    set('#book-total-label', isIn ? 'Total Coins' : 'Company spending · RM');
    set('#book-total', isIn ? integer.format(summary.coins) : money.format(summary.sen / 100));
    set('#book-secondary-label', isIn ? 'Spending records' : 'Company records');
    set('#book-secondary-value', integer.format(isIn ? summary.count : summary.companyRecords));
    set('#book-third-label', isIn ? 'Highest spend · Coins' : 'Highest daily spend · RM');
    set('#book-third-value', isIn ? integer.format(summary.highest) : money.format(summary.highestOut / 100));
    set('#book-chart-unit', isIn ? 'Total Coins' : 'RM');
    const nextGraphKey = state.mode + state.type + data.today;
    if (graphKey !== nextGraphKey) { drawGraph(days, isIn); graphKey = nextGraphKey; }
    set('#book-section-label', (isIn ? 'In / ' : 'Out / ') + typeNames[state.type]);
    set('#book-records-title', isIn ? 'Spending ranking' : 'Company spending records');
    find('#book-in-table').hidden = !isIn; find('#book-out-table').hidden = isIn;
    const result = data.query({ mode: state.mode, type: state.type, date: date.value, page: state.page, size: state.size });
    state.page = result.page;
    const body = find('#book-in-rows'); body.replaceChildren();
    if (isIn) for (const record of result.rows) {
      const row = node('tr'); const id = node('th', record.characterId, 'book-id'); id.scope = 'row';
      const day = node('td'); day.append(time(record.date));
      row.append(id, day, node('td', integer.format(record.coins), 'book-number')); body.append(row);
    }
    renderCompanyRows(isIn ? [] : result.rows);
    find('#book-empty').hidden = result.total > 0;
    set('#book-empty', isIn ? 'No records for this date.' : 'No company spending records for this character type and date.');
    set('#book-range', integer.format(result.start) + '–' + integer.format(result.end) + ' of ' + integer.format(result.total));
    set('#book-page-count', 'of ' + integer.format(result.pages));
    find('#book-page').value = String(result.page); find('#book-page').max = String(result.pages);
    find('#book-first').disabled = find('#book-prev').disabled = result.page === 1;
    find('#book-last').disabled = find('#book-next').disabled = result.page === result.pages;
    set('#book-status', (isIn ? 'In' : 'Out') + ', ' + typeNames[state.type] + ', ' + date.value + ', page ' + result.page + ' of ' + result.pages + '. ' + result.total + (isIn ? ' records.' : ' company records. Analysis total RM ' + money.format(summary.sen / 100) + '.'));
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => {
      const mode = index === 0 ? 'in' : 'out';
      if (state.mode === mode) return;
      find('#main').dataset.motion = event.detail ? 'pointer' : 'instant';
      state.mode = mode; state.page = 1; render(); animate(event, true);
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      state.mode = next === 0 ? 'in' : 'out'; state.page = 1; render(); tabs[next].focus();
    });
  });
  typeButtons.forEach((button, index) => {
    const selectType = next => { state.type = data.types[next]; state.page = 1; render(); };
    button.addEventListener('click', event => { if (state.type === data.types[index]) return; selectType(index); animate(event); });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + 3) % 3;
      selectType(next); typeButtons[next].focus();
    });
  });
  date.addEventListener('change', () => { state.page = 1; render(); });
  find('#book-page-size').addEventListener('change', () => { state.size = Number(find('#book-page-size').value); state.page = 1; render(); });
  for (const [id, change] of [['first', () => 1], ['prev', () => state.page - 1], ['next', () => state.page + 1], ['last', () => data.query({ mode: state.mode, type: state.type, date: date.value, size: state.size }).pages]]) {
    find('#book-' + id).addEventListener('click', () => { state.page = change(); render(); });
  }
  find('#book-page-form').addEventListener('submit', event => { event.preventDefault(); state.page = Number(find('#book-page').value); render(); });
  find('#book-close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
  function refreshDay() {
    if (data.currentDate() === data.today) return;
    const selected = date.value === data.today ? null : date.value;
    data = data.createDemoData();
    globalThis.SocialBookData = data;
    state.page = 1;
    graphKey = undefined;
    if (dialog.open) dialog.close();
    populateDates(selected || data.today);
    render();
  }
  // Roll the demo window at midnight in Malaysia; this is not a live data feed.
  globalThis.setInterval?.(refreshDay, 60000);
  document.addEventListener?.('visibilitychange', () => { if (!document.hidden) refreshDay(); });
  render();
})();
