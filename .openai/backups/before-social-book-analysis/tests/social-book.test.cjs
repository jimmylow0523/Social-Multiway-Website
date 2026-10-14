const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'social-book/index.html'), 'utf8');
const script = fs.readFileSync(path.join(dist, 'social-book.js'), 'utf8');
const records = [...html.matchAll(/<tr data-date="([^"]+)" data-in="(\d+)" data-out="(\d+)">([\s\S]*?)<\/tr>/g)];

// A small DOM adapter exercises the shipped event handlers without a browser.
function startPage(source = records) {
  const elements = new Map();
  const get = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      value: selector === '#book-order' ? 'in' : '',
      hidden: false,
      children: [],
      attributes: {},
      listeners: {},
      append(child) {
        this.children = this.children.filter(item => item !== child);
        this.children.push(child);
      },
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, handler) { this.listeners[name] = handler; }
    });
    return elements.get(selector);
  };
  const body = get('#book-rows');
  body.rows = source.map(([, date, incoming, outgoing, markup]) => ({
    dataset: { date, in: incoming, out: outgoing }, hidden: false, markup
  }));
  body.children = [...body.rows];
  vm.runInNewContext(script, { document: { querySelector: get, createElement: () => ({}) } });
  return {
    get,
    visible: () => body.children.filter(row => !row.hidden),
    change(selector, value) {
      get(selector).value = value;
      get(selector).listeners.change();
    }
  };
}

test('public records use four columns, masked IDs, ISO dates and exact MYR values', () => {
  assert.equal(records.length, 18);
  const columns = [...html.match(/<thead>([\s\S]*?)<\/thead>/)[1].matchAll(/<th\b[^>]*>(.*?)<\/th>/g)].map(match => match[1]);
  assert.deepEqual(columns, ['Character ID', 'Date', 'In', 'Out']);
  assert.doesNotMatch(html + script, /EM\d{3,}/);
  assert.doesNotMatch(html, /donat(?:e|ion|ions|or)|charit(?:y|able)|tax.deductible/i);
  assert.match(html, /Sample records/);
  assert.match(html, /not live company records/);
  assert.match(html, /MYR \(Malaysian ringgit\)/);
  for (const [, date, incoming, outgoing, markup] of records) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10), date);
    assert.match(markup, /class="book-id">EMx{10}\d{2}<\/th>/);
    assert.ok(markup.includes(`<time datetime="${date}">${date}</time>`));
    const amounts = [...markup.matchAll(/class="book-amount[^"]*">([\d,.]+)</g)];
    assert.deepEqual(amounts.map(match => Math.round(Number(match[1].replaceAll(',', '')) * 100)), [Number(incoming), Number(outgoing)]);
  }
});

test('defaults to latest day and ranks by In; date and Out controls update rows and status', () => {
  const page = startPage();
  assert.equal(page.get('#book-date').value, '2026-10-13');
  assert.equal(page.visible().length, 8);
  assert.equal(page.get('.book-controls').hidden, false);
  assert.equal(page.get('#book-in-heading').attributes['aria-sort'], 'descending');
  for (const date of ['2026-10-13', '2026-10-12', '2026-10-11']) {
    page.change('#book-date', date);
    for (const key of ['out', 'in']) {
      page.change('#book-order', key);
      const visible = page.visible();
      const expected = records.filter(record => record[1] === date).map(record => Number(record[key === 'in' ? 2 : 3])).sort((a, b) => b - a);
      assert.deepEqual(visible.map(row => Number(row.dataset[key])), expected);
      assert.ok(visible.every(row => row.dataset.date === date));
      assert.match(page.get('#book-results').textContent, new RegExp(`${expected.length} sample records · ${date}`));
      assert.equal(page.get(`#book-${key}-heading`).attributes['aria-sort'], 'descending');
    }
  }
  page.change('#book-date', '2026-01-01');
  assert.equal(page.visible().length, 0);
  assert.equal(page.get('#book-empty').hidden, false);
  page.change('#book-date', '2026-10-13');
  assert.equal(page.visible().length, 8);
  assert.equal(page.get('#book-empty').hidden, true);
});

test('empty data shows an honest empty state', () => {
  const page = startPage([]);
  assert.equal(page.visible().length, 0);
  assert.equal(page.get('#book-empty').hidden, false);
  assert.match(page.get('#book-results').textContent, /0 sample records · No dates available/);
});

test('every page links to Social Book and keeps the shared footer and navigation assets', () => {
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'privacy/index.html']) {
    const page = fs.readFileSync(path.join(dist, file), 'utf8');
    assert.match(page, /href="\/social-book\/">Social Book<\/a>/);
    assert.doesNotMatch(page, /href="\/#social-book"/);
    assert.equal(page.match(/<footer[\s\S]*?<\/footer>/)[0], footer);
    assert.match(page, /\/site.css\?v=20261013-scroll-shadow/);
    assert.match(page, /\/site.js\?v=20261013-scroll-shadow/);
  }
});
