(() => {
  'use strict';
  const data = globalThis.SocialBookData;
  const find = selector => document.querySelector(selector);
  const date = find('#book-date');
  if (!data || !date) return;
  const state = { mode: 'in', page: 1, size: 10 };
  const integer = new Intl.NumberFormat('en-MY');
  const money = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const compact = new Intl.NumberFormat('en-MY', { notation: 'compact', maximumFractionDigits: 1 });
  const dialog = find('#book-image-dialog');
  const tabs = [find('#book-tab-in'), find('#book-tab-out')];
  let returnFocus;
  let animation;
  const node = (tag, text, className) => {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  };
  const time = value => { const item = node('time', value); item.dateTime = value; return item; };
  const set = (selector, value) => { find(selector).textContent = value; };
  const animate = event => {
    animation?.cancel();
    // Keyboard updates stay instant; pointer switches use a short spatial cue.
    if (!event?.detail || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    animation = find('#book-dashboard').animate?.([{ opacity: .65, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'cubic-bezier(.23,1,.32,1)' });
  };
  const all = node('option', 'All 8 dates'); all.value = 'all'; date.append(all);
  for (const value of data.dates) { const option = node('option', value); option.value = value; date.append(option); }
  date.value = data.dates[0];
  const chart = [...data.dates].reverse().map(value => {
    const button = node('button', undefined, 'book-chart-day'); button.type = 'button';
    const amount = node('span', '', 'book-chart-value');
    const track = node('span', undefined, 'book-chart-track'); track.setAttribute('aria-hidden', 'true');
    const bar = node('span', undefined, 'book-chart-bar'); track.append(bar);
    button.append(amount, track, time(value));
    button.addEventListener('click', event => { date.value = value; state.page = 1; render(); animate(event); });
    find('#book-chart').append(button);
    return { value, button, amount, bar };
  });
  function showEvidence(record, trigger) {
    returnFocus = trigger;
    set('#book-dialog-date', record.date + ' · RM ' + money.format(record.sen / 100));
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
  // Out always shows every company date, without a pager.
  for (const record of data.outgoing) {
    const row = node('tr'); row.dataset.date = record.date;
    const day = node('th'); day.scope = 'row'; day.append(time(record.date));
    const cell = node('td'); const button = node('button', 'View ↗', 'book-view-evidence'); button.type = 'button';
    button.setAttribute('aria-label', 'View spending evidence for ' + record.date);
    button.addEventListener('click', () => showEvidence(record, button)); cell.append(button);
    row.append(day, node('td', money.format(record.sen / 100), 'book-number'), cell); find('#book-out-rows').append(row);
  }
  function render() {
    animation?.cancel();
    const isIn = state.mode === 'in';
    const summary = data.summary(date.value);
    find('#main').dataset.mode = state.mode;
    tabs.forEach((tab, index) => { const active = index === (isIn ? 0 : 1); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    find('#book-dashboard').setAttribute('aria-labelledby', isIn ? 'book-tab-in' : 'book-tab-out');
    set('#book-total-label', isIn ? 'Total Coins' : 'Company spending · RM');
    set('#book-total', isIn ? integer.format(summary.coins) : money.format(summary.sen / 100));
    set('#book-selected-date', date.value === 'all' ? '2026-10-07 — 2026-10-14' : date.value);
    set('#book-secondary-label', isIn ? 'Spending records' : 'Recorded dates');
    set('#book-secondary-value', integer.format(isIn ? summary.count : summary.companyDays));
    set('#book-third-label', isIn ? 'Highest spend · Coins' : '8-date total · RM');
    set('#book-third-value', isIn ? integer.format(summary.highest) : money.format(data.summary().sen / 100));
    set('#book-chart-unit', isIn ? 'Total Coins' : 'RM');
    const values = chart.map(item => data.summary(item.value)[isIn ? 'coins' : 'sen']);
    const maximum = Math.max(1, ...values);
    chart.forEach((item, index) => {
      const value = isIn ? values[index] : values[index] / 100;
      item.amount.textContent = compact.format(value);
      item.bar.style.transform = 'scaleY(' + values[index] / maximum + ')';
      item.button.setAttribute('aria-pressed', String(item.value === date.value));
      item.button.setAttribute('aria-label', item.value + ': ' + (isIn ? integer.format(value) + ' Total Coins' : 'RM ' + money.format(value)));
      item.button.title = item.button.getAttribute('aria-label');
    });
    set('#book-section-label', isIn ? 'In / Platform' : 'Out / Company');
    set('#book-records-title', isIn ? 'Spending ranking' : 'Daily company spending');
    find('#book-in-table').hidden = !isIn; find('#book-out-table').hidden = isIn;
    find('#book-pagination').hidden = !isIn; find('#book-page-size-control').hidden = !isIn; find('#book-out-label').hidden = isIn;
    for (const row of find('#book-out-rows').children) row.classList.toggle('is-selected', row.dataset.date === date.value);
    const result = data.query({ date: date.value, page: state.page, size: state.size });
    state.page = result.page;
    const body = find('#book-in-rows'); body.replaceChildren();
    if (isIn) for (const record of result.rows) {
      const row = node('tr'); const id = node('th', record.characterId, 'book-id'); id.scope = 'row';
      const day = node('td'); day.append(time(record.date));
      row.append(id, day, node('td', integer.format(record.coins), 'book-number')); body.append(row);
    }
    find('#book-empty').hidden = !isIn || result.total > 0;
    set('#book-range', integer.format(result.start) + '–' + integer.format(result.end) + ' of ' + integer.format(result.total));
    set('#book-page-count', 'of ' + integer.format(result.pages));
    find('#book-page').value = String(result.page); find('#book-page').max = String(result.pages);
    find('#book-first').disabled = find('#book-prev').disabled = result.page === 1;
    find('#book-last').disabled = find('#book-next').disabled = result.page === result.pages;
    set('#book-status', isIn ? 'In, ' + date.value + ', page ' + result.page + ' of ' + result.pages + '. ' + result.total + ' records.' : 'Out, eight company dates. Selected total RM ' + money.format(summary.sen / 100) + '.');
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => { state.mode = index === 0 ? 'in' : 'out'; render(); animate(event); });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      state.mode = next === 0 ? 'in' : 'out'; render(); tabs[next].focus();
    });
  });
  date.addEventListener('change', () => { state.page = 1; render(); });
  find('#book-page-size').addEventListener('change', () => { state.size = Number(find('#book-page-size').value); state.page = 1; render(); });
  for (const [id, change] of [['first', () => 1], ['prev', () => state.page - 1], ['next', () => state.page + 1], ['last', () => data.query({ date: date.value, size: state.size }).pages]]) {
    find('#book-' + id).addEventListener('click', () => { state.page = change(); render(); });
  }
  find('#book-page-form').addEventListener('submit', event => { event.preventDefault(); state.page = Number(find('#book-page').value); render(); });
  find('#book-close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
  render();
})();
