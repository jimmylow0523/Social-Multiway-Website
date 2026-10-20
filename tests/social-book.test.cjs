const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const dist = path.resolve(__dirname, '../dist');
const data = require('../dist/social-book-data.js').createDemoData(new Date('2026-10-14T04:00:00Z'));
const script = fs.readFileSync(path.join(dist, 'social-book.js'), 'utf8');
const html = fs.readFileSync(path.join(dist, 'social-book/index.html'), 'utf8');
function start(source = data, reduced = false) {
  const elements = new Map();
  let interval;
  const create = tag => ({ tag, children: [], dataset: {}, style: {}, attributes: {}, listeners: {}, value: '', hidden: false,
    classList: { values: new Set(), toggle(key, on) { if (on) this.values.add(key); else this.values.delete(key); } },
    append(...items) { this.children.push(...items); }, replaceChildren(...items) { this.children = items; },
    setAttribute(key, value) { this.attributes[key] = value; }, getAttribute(key) { return this.attributes[key]; },
    addEventListener(key, handler) { this.listeners[key] = handler; }, focus() { this.focused = true; },
    showModal() { this.open = true; }, close() { this.open = false; this.listeners.close?.(); },
    animate() { this.animations = (this.animations || 0) + 1; return { cancel() {} }; }
  });
  const get = key => { if (!elements.has(key)) elements.set(key, create('div')); return elements.get(key); };
  vm.runInNewContext(script, { SocialBookData: source, Intl, setInterval: handler => { interval = handler; }, matchMedia: () => ({ matches: reduced }), document: { querySelector: get, createElement: create, createElementNS: (namespace, tag) => create(tag) } });
  return { get, refresh: () => interval(), click(key, detail = 0) { get(key).listeners.click({ detail }); }, change(key, value) { get(key).value = value; get(key).listeners.change(); }, submit(page) { get('#book-page').value = page; get('#book-page-form').listeners.submit({ preventDefault() {} }); } };
}
test('8 dates have masked In records and independent, variable company submissions by type', () => {
  assert.equal(data.dates.length, 8); assert.equal(data.incoming.length, 2400);
  assert.equal(new Set(data.incoming.map(row => row.key)).size, 2400);
  assert.equal(new Set(data.outgoing.map(row => row.key)).size, data.outgoing.length);
  const counts = [];
  for (const date of data.dates) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(data.incoming.filter(row => row.date === date).length, 300);
    for (const type of data.types) counts.push(data.outgoing.filter(row => row.date === date && row.type === type).length);
  }
  for (const row of data.incoming) { assert.match(row.characterId, /^(KD|EL|PT)x{10}\d{2}$/); assert.ok(Number.isSafeInteger(row.coins)); assert.equal(row.sen, undefined); }
  assert.ok(counts.includes(0)); assert.ok(counts.some(count => count > 10)); assert.ok(new Set(counts).size > 1);
  for (const row of data.outgoing) { assert.ok(data.types.includes(row.type)); assert.ok(Number.isSafeInteger(row.sen)); assert.equal(row.characterId, undefined); assert.equal(row.coins, undefined); assert.deepEqual(row.images, []); }
});
test('Out summaries and pagination use only the selected company submissions, independent of In', () => {
  for (const type of data.types) for (const date of data.dates) {
    const expected = data.outgoing.filter(row => row.type === type && row.date === date);
    const summary = data.summary(date, type);
    assert.equal(summary.sen, expected.reduce((sum, row) => sum + row.sen, 0));
    assert.equal(summary.companyRecords, expected.length);
    const first = data.query({ mode: 'out', type, date });
    const rows = [];
    for (let page = 1; page <= first.pages; page++) rows.push(...data.query({ mode: 'out', type, date, page }).rows);
    assert.deepEqual(rows, expected);
  }
  const source = data.createDemoData(new Date('2026-10-14T04:00:00Z'));
  const before = source.summary(source.today, 'kid');
  const otherType = source.summary(source.today, 'pet');
  source.incoming.forEach(row => { row.coins = 0; });
  assert.equal(source.summary(source.today, 'kid').sen, before.sen);
  source.outgoing.push({ key: 'new-company-submission', type: 'kid', date: source.today, sen: 12345, images: [] });
  assert.equal(source.summary(source.today, 'kid').sen, before.sen + 12345);
  assert.equal(source.summary(source.today, 'kid').companyRecords, before.companyRecords + 1);
  assert.equal(source.summary(source.today, 'pet').sen, otherType.sen);
  assert.equal(source.query({ mode: 'out', type: 'unknown' }).total, 0);
});

test('Out empty dates show zero records without fabricating a daily submission', () => {
  const page = start(); page.click('#book-tab-out');
  const type = data.types.find(type => data.dates.some(date => data.query({ mode: 'out', type, date }).total === 0));
  const date = data.dates.find(date => data.query({ mode: 'out', type, date }).total === 0);
  page.click('#book-type-' + type); page.change('#book-date', date);
  assert.equal(page.get('#book-out-rows').children.length, 0);
  assert.equal(page.get('#book-empty').hidden, false);
  assert.equal(page.get('#book-range').textContent, '0–0 of 0');
  assert.equal(page.get('#book-next').disabled, true);
  assert.equal(data.summary(date, type).sen, 0);
});

test('evidence belongs to an individual submission even for the same type and date', () => {
  const source = data.createDemoData(new Date('2026-10-14T04:00:00Z'));
  source.outgoing.splice(0, source.outgoing.length,
    { key: 'record-a', type: 'kid', date: source.today, sen: 10000, images: [{ src: '/assets/evidence/a.webp', alt: 'Receipt A' }] },
    { key: 'record-b', type: 'kid', date: source.today, sen: 25000, images: [{ src: '/assets/evidence/b.webp', alt: 'Receipt B' }] });
  const page = start(source); page.click('#book-tab-out');
  const rows = page.get('#book-out-rows').children;
  assert.equal(rows.length, 2);
  rows.forEach((row, index) => {
    row.children[2].children[0].listeners.click();
    const expected = source.outgoing[index];
    assert.equal(page.get('#book-dialog-content').children[0].children[0].src, expected.images[0].src);
    assert.ok(page.get('#book-dialog-date').textContent.endsWith('RM ' + (expected.sen / 100).toFixed(2)));
    page.click('#book-close-image');
  });
});

test('pagination visits every record once in descending order and handles bounds and empty dates', () => {
  for (const type of data.types) for (const date of ['all', ...data.dates]) for (const size of [10, 25, 50]) {
    const first = data.query({ date, size, type }); const rows = [];
    for (let page = 1; page <= first.pages; page++) rows.push(...data.query({ date, size, page, type }).rows);
    assert.ok(rows.every(row => row.type === type));
    assert.equal(rows.length, date === 'all' ? 800 : 100);
    assert.equal(new Set(rows.map(row => row.key)).size, rows.length);
    assert.ok(rows.every((row, i) => i === 0 || rows[i - 1].coins >= row.coins));
    assert.equal(data.summary(date, type).coins, rows.reduce((sum, row) => sum + row.coins, 0));
  }
  assert.equal(data.query({ page: -5 }).page, 1);
  assert.equal(data.query({ page: 999 }).page, 80);
  assert.equal(data.query({ date: 'unknown' }).total, 0);
  assert.equal(data.query({ date: 'unknown' }).start, 0);
  assert.equal(data.pagination(1000000, 100000, 10).end, 1000000);
});
test('date, page size and page jumps update only the visible In rows', () => {
  const page = start(); assert.equal(page.get('#book-in-rows').children.length, 10);
  assert.equal(page.get('#book-range').textContent, '1–10 of 100');
  page.click('#book-next'); assert.equal(page.get('#book-range').textContent, '11–20 of 100');
  page.click('#book-last'); assert.equal(page.get('#book-range').textContent, '91–100 of 100'); assert.equal(page.get('#book-next').disabled, true);
  page.change('#book-page-size', '25'); assert.equal(page.get('#book-in-rows').children.length, 25); assert.equal(page.get('#book-page').value, '1');
  assert.equal(page.get('#book-date').children.length, 8);
  assert.ok(page.get('#book-date').children.every(option => option.value !== 'all'));
  page.submit('4'); assert.equal(page.get('#book-range').textContent, '76–100 of 100');
  page.change('#book-date', data.dates[3]); assert.equal(page.get('#book-page').value, '1');
  assert.ok(page.get('#book-in-rows').children.every(row => row.children[1].children[0].dateTime === data.dates[3]));
});
test('Out paginates individual submissions and respects type and the independent table date', () => {
  const page = start(); page.click('#book-next'); page.click('#book-tab-out');
  assert.equal(page.get('#book-pagination').hidden, false); assert.equal(page.get('#book-page-size-control').hidden, false);
  assert.equal(page.get('#book-in-table').hidden, true); assert.equal(page.get('#book-out-table').hidden, false);
  const selectedDate = data.dates.find(date => data.query({ mode: 'out', type: 'kid', date }).total > 10);
  page.change('#book-date', selectedDate);
  const expected = data.query({ mode: 'out', type: 'kid', date: selectedDate });
  assert.equal(page.get('#book-out-rows').children.length, 10);
  assert.ok(page.get('#book-out-rows').children.every(row => row.dataset.date === selectedDate && row.dataset.type === 'kid'));
  const graph = page.get('#book-chart').children[0];
  page.click('#book-last');
  assert.equal(page.get('#book-out-rows').children.length, expected.total - 10);
  assert.equal(page.get('#book-page').value, '2');
  assert.equal(page.get('#book-chart').children[0], graph);
  page.change('#book-page-size', '25');
  assert.equal(page.get('#book-out-rows').children.length, expected.total);
  assert.equal(page.get('#book-total').textContent, new Intl.NumberFormat('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2}).format(data.summary().sen / 100));
  assert.equal(page.get('#book-tab-out').attributes['aria-selected'], 'true');
  page.click('#book-tab-in'); assert.equal(page.get('#book-page').value, '1'); assert.equal(page.get('#book-pagination').hidden, false);
});
test('line graph has 8 points, exact daily values and keyboard exploration', () => {
  const page = start(); const svg = page.get('#book-chart').children[0];
  assert.equal(svg.tag, 'svg');
  const markers = svg.children.filter(item => item.attributes.role === 'button');
  assert.equal(markers.length, 8);
  assert.ok(svg.children.some(item => item.tag === 'polyline'));
  assert.ok(markers[0].attributes['aria-label'].startsWith('2026-10-07:'));
  markers[0].listeners.click();
  assert.ok(page.get('#book-chart-readout').textContent.startsWith('2026-10-07'));
  assert.equal(page.get('#book-date').value, '2026-10-14');
  markers[0].listeners.keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(markers[1].focused, true);
  assert.equal(markers[1].attributes.tabindex, '0');
  page.click('#book-tab-out', 1); assert.equal(page.get('.book-chart-area').animations, 1);
  page.get('#book-tab-out').listeners.keydown({ key: 'ArrowLeft', preventDefault() {} });
  assert.equal(page.get('#book-tab-in').focused, true); assert.equal(page.get('.book-chart-area').animations, 1);
  const reduced = start(data, true); reduced.click('#book-tab-out', 1); assert.equal(reduced.get('.book-chart-area').animations, undefined);
});
test('character selection isolates In data and keeps the 8-day graph independent of table filters', () => {
  const page = start();
  const initialGraph = page.get('#book-chart').children[0];
  page.change('#book-date', data.dates[3]);
  assert.equal(page.get('#book-chart').children[0], initialGraph);
  page.click('#book-next');
  page.click('#book-type-elder');
  assert.equal(page.get('#book-page').value, '1');
  assert.equal(page.get('#book-date').value, data.dates[3]);
  assert.equal(page.get('#book-analysis-title').textContent, 'Elder · Coins spent');
  assert.equal(page.get('#book-type-elder').attributes['aria-checked'], 'true');
  assert.ok(page.get('#book-in-rows').children.every(row => row.children[0].textContent.startsWith('EL')));
  assert.equal(page.get('#book-total').textContent, new Intl.NumberFormat('en-MY').format(data.summary('all', 'elder').coins));
  assert.equal(page.get('#book-chart').children[0].children.filter(item => item.attributes.role === 'button').length, 8);
  page.click('#book-type-pet');
  assert.ok(page.get('#book-in-rows').children.every(row => row.children[0].textContent.startsWith('PT')));
  page.click('#book-tab-out');
  const format = value => new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
  assert.equal(page.get('#book-type-control').hidden, false);
  assert.equal(page.get('#book-total').textContent, format(data.summary('all', 'pet').sen));
  const outGraph = page.get('#book-chart').children[0];
  page.click('#book-type-elder');
  assert.notEqual(page.get('#book-chart').children[0], outGraph);
  assert.equal(page.get('#book-total').textContent, format(data.summary('all', 'elder').sen));
  assert.equal(page.get('#book-analysis-title').textContent, 'Elder · RM spent');
  assert.equal(page.get('#book-section-label').textContent, 'Out / Elder');
  assert.ok(page.get('#book-out-rows').children.every(row => row.dataset.type === 'elder' && row.dataset.date === data.dates[3]));
  const outMarkers = page.get('#book-chart').children[0].children.filter(item => item.attributes.role === 'button');
  assert.equal(outMarkers.length, 8);
  [...data.dates].reverse().forEach((date, index) => assert.ok(outMarkers[index].attributes['aria-label'].endsWith('RM ' + format(data.summary(date, 'elder').sen))));
  page.click('#book-type-pet');
  page.click('#book-tab-in');
  assert.equal(page.get('#book-type-pet').attributes['aria-checked'], 'true');
  assert.equal(page.get('#book-type-control').hidden, false);
  page.click('#book-type-kid'); page.click('#book-tab-out');
  assert.equal(page.get('#book-total').textContent, format(data.summary('all', 'kid').sen));
});

test('character radio group supports arrow keys without animation', () => {
  const page = start();
  page.get('#book-type-kid').listeners.keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(page.get('#book-type-elder').focused, true);
  assert.equal(page.get('#book-type-elder').attributes['aria-checked'], 'true');
  assert.equal(page.get('#book-dashboard').animations, undefined);
  page.get('#book-type-elder').listeners.keydown({ key: 'End', preventDefault() {} });
  assert.equal(page.get('#book-type-pet').attributes['aria-checked'], 'true');
  page.get('#book-type-pet').listeners.keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(page.get('#book-type-kid').attributes['aria-checked'], 'true');
});

test('Malaysia midnight rolls the window and preserves overlapping historical demo records', () => {
  const before = data.createDemoData(new Date('2026-10-14T15:59:59Z'));
  const after = data.createDemoData(new Date('2026-10-14T16:00:00Z'));
  assert.equal(before.today, '2026-10-14'); assert.equal(after.today, '2026-10-15');
  assert.deepEqual(after.dates, ['2026-10-15','2026-10-14','2026-10-13','2026-10-12','2026-10-11','2026-10-10','2026-10-09','2026-10-08']);
  for (const type of data.types) {
    assert.deepEqual(before.query({type,date:'2026-10-14'}).rows, after.query({type,date:'2026-10-14'}).rows);
    assert.deepEqual(before.query({mode:'out',type,date:'2026-10-14',size:50}).rows, after.query({mode:'out',type,date:'2026-10-14',size:50}).rows);
  }
  assert.equal(after.query({date:'2026-10-07'}).total, 0);
  assert.equal(after.query({type:'unknown'}).total, 0);
  assert.equal(after.summary('2026-10-07').sen, 0);
  const year = data.createDemoData(new Date('2026-12-31T16:00:00Z'));
  assert.equal(year.today, '2027-01-01'); assert.equal(year.dates.at(-1), '2026-12-25');
});

test('each company View opens an honest empty evidence dialog and restores focus', () => {
  const page = start();
  page.click('#book-tab-out');
  page.change('#book-date', data.dates.find(date => data.query({ mode: 'out', date }).total > 1));
  assert.ok(page.get('#book-out-rows').children.length > 1);
  for (const row of page.get('#book-out-rows').children) {
    const button = row.children[2].children[0]; button.listeners.click();
    assert.ok(page.get('#book-dialog-date').textContent.startsWith(row.dataset.date));
    assert.ok(page.get('#book-dialog-date').textContent.endsWith('RM ' + row.children[1].textContent));
    assert.equal(page.get('#book-dialog-content').children[0].textContent, 'No image available');
    assert.equal(page.get('#book-image-dialog').open, true);
    page.click('#book-close-image'); assert.equal(button.focused, true);
  }
});
test('million-record response metadata keeps rendering bounded to one page', () => {
  const source = { ...data, query(args) { const meta = data.pagination(1000000, args.page, args.size); return { ...meta, rows: data.query({ date: args.date, size: meta.size }).rows }; } };
  const page = start(source); assert.equal(page.get('#book-in-rows').children.length, 10);
  assert.equal(page.get('#book-page-count').textContent, 'of 100,000');
  page.click('#book-last'); assert.equal(page.get('#book-range').textContent, '999,991–1,000,000 of 1,000,000');
  assert.equal(page.get('#book-in-rows').children.length, 10);
});
test('shared navigation and neutral copy remain; no upload form or removed explanations', () => {
  for (const value of ['Illustrative amounts only', 'Character IDs show only', 'YYYY-MM-DD', 'All amounts in MYR', 'type="file"', 'book-period']) assert.ok(!html.includes(value));
  assert.doesNotMatch(html, /donation|charity/i); assert.doesNotMatch(JSON.stringify(data), /EM\d{3,}/);
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'privacy/index.html']) assert.equal(fs.readFileSync(path.join(dist, file), 'utf8').match(/<footer[\s\S]*?<\/footer>/)[0], footer);
});


test('open dashboard rolls to the next day while retaining the selected type and view', () => {
  let today = data.today;
  const after = data.createDemoData(new Date('2026-10-14T16:00:00Z'));
  const page = start({ ...data, currentDate: () => today, createDemoData: () => after });
  page.click('#book-type-pet'); page.click('#book-next'); page.click('#book-tab-out');
  today = after.today; page.refresh();
  assert.equal(page.get('#book-date').value, after.today);
  assert.equal(page.get('#book-date').children.length, 8);
  assert.equal(page.get('#book-date').children.some(option => option.value === '2026-10-07'), false);
  assert.ok(page.get('#book-out-rows').children.every(row => row.dataset.date === after.today && row.dataset.type === 'pet'));
  assert.equal(page.get('#book-out-rows').children.length, after.query({ mode: 'out', type: 'pet', date: after.today }).rows.length);
  assert.equal(page.get('#book-chart').children[0].children.filter(item => item.attributes.role === 'button').length, 8);
  assert.equal(page.get('#book-tab-out').attributes['aria-selected'], 'true');
  page.click('#book-tab-in');
  assert.equal(page.get('#book-type-pet').attributes['aria-checked'], 'true');
  assert.equal(page.get('#book-page').value, '1');
  assert.ok(page.get('#book-in-rows').children.every(row => row.children[1].children[0].dateTime === after.today));
});
