(() => {
  'use strict';
  const data = globalThis.SocialBookData;
  const date = document.querySelector('#book-date');
  if (!data || !date) return;
  const find = selector => document.querySelector(selector);
  const coins = new Intl.NumberFormat('en-MY');
  const money = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dialog = find('#book-image-dialog');
  let returnFocus;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const time = value => {
    const element = node('time', value);
    element.dateTime = value;
    return element;
  };
  const drawEvidence = (container, images) => {
    container.replaceChildren();
    for (const image of images) {
      // Evidence must use a local asset or an HTTPS image URL.
      if (!/^\/(?!\/)|^https:\/\//.test(image.src)) continue;
      const figure = node('figure');
      const img = node('img');
      img.src = image.src;
      img.alt = image.alt;
      img.loading = 'lazy';
      img.addEventListener('error', () => figure.replaceChildren(node('p', 'Image unavailable', 'book-evidence-missing')));
      figure.append(img, node('figcaption', image.alt));
      container.append(figure);
    }
    return container.children.length;
  };
  const showEvidence = (value, trigger) => {
    returnFocus = trigger;
    find('#book-dialog-date').textContent = value;
    const content = find('#book-dialog-content');
    if (!drawEvidence(content, data.day(value).images)) {
      content.append(node('div', 'No image available', 'book-dialog-empty'));
    }
    dialog.showModal();
  };
  for (const value of data.dates) {
    const option = node('option', value);
    option.value = value;
    date.append(option);
  }
  date.value = data.dates[0] || '';

  const drawTrend = (selector, key, formatter) => {
    const container = find(selector);
    container.replaceChildren();
    const days = [...data.dates].reverse().map(value => data.day(value));
    const maximum = Math.max(1, ...days.map(day => day[key] ?? 0));
    for (const day of days) {
      const item = node('div', undefined, 'book-trend-day');
      const value = day[key];
      const valueText = value === null ? '—' : formatter(value);
      const meter = node('div', undefined, 'book-trend-track');
      meter.setAttribute('aria-hidden', 'true');
      const fill = node('span');
      fill.style.width = ((value ?? 0) / maximum * 100) + '%';
      meter.append(fill);
      item.append(time(day.date), meter, node('span', valueText, 'book-trend-value'));
      if (day.date === date.value) item.classList.add('is-selected');
      container.append(item);
    }
  };

  const update = () => {
    const selected = data.day(date.value);
    find('#book-total-coins').textContent = coins.format(selected.coins);
    find('#book-total-rm').textContent = selected.sen === null ? '—' : money.format(selected.sen / 100);
    const users = find('#book-in-rows');
    users.replaceChildren();
    for (const record of selected.users) {
      const row = node('tr');
      const id = node('th', record.characterId, 'book-id');
      id.scope = 'row';
      const day = node('td');
      day.append(time(record.date));
      row.append(id, day, node('td', coins.format(record.coins), 'book-amount book-coins'));
      users.append(row);
    }
    find('#book-in-empty').hidden = selected.users.length > 0;
    const company = find('#book-out-rows');
    company.replaceChildren();
    for (const record of [...data.outgoing].sort((a, b) => b.date.localeCompare(a.date))) {
      const row = node('tr');
      if (record.date === date.value) row.classList.add('is-selected');
      const day = node('th');
      day.scope = 'row';
      day.append(time(record.date));
      const evidence = node('td', undefined, 'book-amount');
      const button = node('button', 'View ↗', 'book-view-evidence');
      button.type = 'button';
      button.setAttribute('aria-label', 'View spending evidence for ' + record.date);
      button.addEventListener('click', () => showEvidence(record.date, button));
      evidence.append(button);
      row.append(day, node('td', money.format(record.sen / 100), 'book-amount'), evidence);
      company.append(row);
    }
    const evidenceDate = find('#book-evidence-date');
    evidenceDate.textContent = date.value;
    evidenceDate.dateTime = date.value;
    find('#book-evidence-empty').hidden = drawEvidence(find('#book-gallery'), selected.images) > 0;
    drawTrend('#book-in-trend', 'coins', value => coins.format(value));
    drawTrend('#book-out-trend', 'sen', value => money.format(value / 100));
    find('#book-status').textContent = 'Showing ' + date.value + ': ' + coins.format(selected.coins) + ' Total Coins; company spending ' + (selected.sen === null ? 'not recorded' : 'RM ' + money.format(selected.sen / 100)) + '.';
  };
  date.addEventListener('change', update);
  find('#book-close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  update();
})();
