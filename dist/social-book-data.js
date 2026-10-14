/* Deterministic fictional data. No full Character IDs are generated or delivered.
   Coins are not RM. Company totals are independent integer sen values.
   Production: replace this demo adapter with server-side filtering, ordering and
   pagination. Never download a million records to paginate them in the browser. */
(function (root) {
  'use strict';
  const dates = Array.from({ length: 30 }, (_, index) => new Date(Date.UTC(2026, 9, 14 - index)).toISOString().slice(0, 10));
  const incoming = dates.flatMap((date, day) => Array.from({ length: 100 }, (_, index) => ({
    key: 'demo-' + day + '-' + index,
    date,
    characterId: 'EMxxxxxxxxxx' + String((index * 37 + day * 11) % 100).padStart(2, '0'),
    coins: 100 + ((index * 7919 + day * 13721 + index * day * 313) % (165000 + day * 9000))
  })));
  const outgoing = dates.map((date, index) => ({ date, sen: 78000 + ((index * 73129 + 206500) % 280000), images: [] }));
  const sorted = [...incoming].sort((a, b) => b.coins - a.coins || a.key.localeCompare(b.key));
  const byDate = new Map(dates.map(date => [date, sorted.filter(row => row.date === date)]));
  function pagination(total, page = 1, size = 10) {
    size = [10, 25, 50].includes(Number(size)) ? Number(size) : 10;
    const pages = Math.max(1, Math.ceil(total / size));
    page = Math.min(pages, Math.max(1, Math.trunc(Number(page)) || 1));
    const offset = (page - 1) * size;
    return { total, page, size, pages, offset, start: total ? offset + 1 : 0, end: Math.min(offset + size, total) };
  }
  function query({ date = 'all', page = 1, size = 10 } = {}) {
    const rows = date === 'all' ? sorted : byDate.get(date) || [];
    const meta = pagination(rows.length, page, size);
    return { ...meta, rows: rows.slice(meta.offset, meta.end) };
  }
  function summary(date = 'all') {
    const users = date === 'all' ? sorted : byDate.get(date) || [];
    const company = date === 'all' ? outgoing : outgoing.filter(row => row.date === date);
    return { coins: users.reduce((sum, row) => sum + row.coins, 0), count: users.length, highest: users[0]?.coins ?? 0, sen: company.reduce((sum, row) => sum + row.sen, 0), companyDays: company.length };
  }
  const data = { dates, incoming, outgoing, pagination, query, summary };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.SocialBookData = data;
})(globalThis);
