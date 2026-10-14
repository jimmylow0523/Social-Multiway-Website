(() => {
  'use strict';

  const body = document.querySelector('#book-rows');
  const date = document.querySelector('#book-date');
  const order = document.querySelector('#book-order');
  if (!body || !date || !order) return;

  // This public page contains masked, fictional IDs only. Future data sources
  // must mask IDs on the server before sending records to the browser.
  const rows = Array.from(body.rows);
  const dates = [...new Set(rows.map(row => row.dataset.date))].sort().reverse();
  for (const value of dates) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    date.append(option);
  }
  if (dates.length) date.value = dates[0];

  const update = () => {
    const key = order.value === 'out' ? 'out' : 'in';
    const selected = rows.filter(row => row.dataset.date === date.value);
    selected.sort((a, b) => Number(b.dataset[key]) - Number(a.dataset[key]));
    for (const row of rows) row.hidden = true;
    for (const row of selected) {
      row.hidden = false;
      body.append(row);
    }
    const label = key === 'out' ? 'Out' : 'In';
    const count = selected.length;
    document.querySelector('#book-results').textContent = `${count} sample record${count === 1 ? '' : 's'} · ${date.value || 'No dates available'} · Highest ${label} first`;
    document.querySelector('#book-empty').hidden = count > 0;
    document.querySelector('#book-in-heading').setAttribute('aria-sort', key === 'in' ? 'descending' : 'none');
    document.querySelector('#book-out-heading').setAttribute('aria-sort', key === 'out' ? 'descending' : 'none');
  };

  date.addEventListener('change', update);
  order.addEventListener('change', update);
  update();
  document.querySelector('.book-controls').hidden = false;
})();
