const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'social-book/index.html'), 'utf8');
const script = fs.readFileSync(path.join(dist, 'social-book.js'), 'utf8');
const data = require('../dist/social-book-data.js');

function startPage(source = data) {
  const elements = new Map();
  function element(tag = 'div') {
    return {
      tag, children: [], attributes: {}, listeners: {}, style: {}, value: '', hidden: false,
      classList: { values: new Set(), add(value) { this.values.add(value); } },
      append(...items) { this.children.push(...items); },
      replaceChildren(...items) { this.children = items; },
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, handler) { this.listeners[name] = handler; },
      showModal() { this.open = true; },
      close() { this.open = false; this.listeners.close?.(); },
      focus() { this.focused = true; }
    };
  }
  const get = selector => {
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
  };
  vm.runInNewContext(script, { SocialBookData: source, Intl, document: { querySelector: get, createElement: element } });
  return { get, change(value) { get('#book-date').value = value; get('#book-date').listeners.change(); } };
}

test('In contains only masked user IDs and integer coins; Out contains company dates and RM sen only', () => {
  assert.equal(data.incoming.length, 18);
  for (const record of data.incoming) {
    assert.match(record.characterId, /^EMx{10}\d{2}$/);
    assert.ok(Number.isSafeInteger(record.coins) && record.coins >= 0);
    assert.deepEqual(Object.keys(record).sort(), ['characterId', 'coins', 'date']);
  }
  for (const record of data.outgoing) {
    assert.deepEqual(Object.keys(record).sort(), ['date', 'images', 'sen']);
    assert.ok(Number.isSafeInteger(record.sen) && record.sen >= 0);
    assert.deepEqual(record.images, []);
  }
  for (const date of data.dates) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(date + 'T00:00:00Z').toISOString().slice(0,10), date);
  }
  assert.equal(data.day('2026-10-13').coins, 456050);
  assert.equal(data.day('2026-10-13').sen, 180000);
  assert.equal(data.day('2026-10-12').coins, 355500);
  assert.equal(data.day('2026-10-11').coins, 257500);
});

test('date selection updates totals, coin ranking and independent company history', () => {
  const page = startPage();
  assert.equal(page.get('#book-date').value, '2026-10-13');
  assert.equal(page.get('#book-total-coins').textContent, '456,050');
  assert.equal(page.get('#book-total-rm').textContent, '1,800.00');
  for (const date of data.dates) {
    page.change(date);
    const rows = page.get('#book-in-rows').children;
    const expected = data.day(date).users;
    assert.equal(rows.length, expected.length);
    assert.deepEqual(rows.map(row => Number(row.children[2].textContent.replaceAll(',', ''))), expected.map(row => row.coins));
    assert.ok(rows.every(row => row.children[1].children[0].dateTime === date));
    assert.equal(page.get('#book-out-rows').children.length, 3);
    assert.equal(page.get('#book-evidence-date').dateTime, date);
    assert.equal(page.get('#book-in-trend').children.length, 3);
    assert.equal(page.get('#book-out-trend').children.length, 3);
    assert.equal(page.get('#book-in-trend').children.filter(row => row.classList.values.has('is-selected')).length, 1);
  }
  page.change('2026-10-01');
  assert.equal(page.get('#book-in-rows').children.length, 0);
  assert.equal(page.get('#book-in-empty').hidden, false);
  assert.equal(page.get('#book-total-rm').textContent, '—');
});

test('each View opens evidence for its own company date; close restores focus', () => {
  const page = startPage();
  for (const row of page.get('#book-out-rows').children) {
    const button = row.children[2].children[0];
    button.listeners.click();
    assert.equal(page.get('#book-image-dialog').open, true);
    assert.equal(page.get('#book-dialog-date').textContent, row.children[0].children[0].dateTime);
    assert.equal(page.get('#book-dialog-content').children[0].textContent, 'No image available');
    page.get('#book-close-image').listeners.click();
    assert.equal(page.get('#book-image-dialog').open, false);
    assert.equal(button.focused, true);
  }
});

test('future evidence renders real paths, rejects unsafe paths and handles missing files', () => {
  const source = { ...data, day(date) { return { ...data.day(date), images: [
    { src: '/assets/evidence/receipt.webp', alt: 'Expense receipt' },
    { src: 'javascript:alert(1)', alt: 'Rejected' }
  ] }; } };
  const page = startPage(source);
  const gallery = page.get('#book-gallery');
  assert.equal(gallery.children.length, 1);
  assert.equal(gallery.children[0].children[0].src, '/assets/evidence/receipt.webp');
  assert.equal(gallery.children[0].children[0].alt, 'Expense receipt');
  assert.equal(page.get('#book-evidence-empty').hidden, true);
  gallery.children[0].children[0].listeners.error();
  assert.equal(gallery.children[0].children[0].textContent, 'Image unavailable');
});

test('requested table explanations and upload controls are absent; neutral copy and shared navigation remain', () => {
  for (const removed of ['Sample records', 'Illustrative amounts only', 'Character IDs show only', 'YYYY-MM-DD', 'All amounts in MYR', 'Highest In first', 'sample records ·']) assert.ok(!html.includes(removed));
  assert.doesNotMatch(html, /type="file"|upload-form|donation|charity/i);
  assert.doesNotMatch(JSON.stringify(data), /EM\d{3,}/);
  assert.match(html, /Total Coins/);
  assert.match(html, /Total \(RM\)/);
  assert.match(html, /Demo data/);
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  for (const file of ['index.html','about/index.html','contact/index.html','privacy/index.html']) {
    const page = fs.readFileSync(path.join(dist, file), 'utf8');
    assert.ok(page.includes('href="/social-book/"'));
    assert.equal(page.match(/<footer[\s\S]*?<\/footer>/)[0], footer);
  }
});
