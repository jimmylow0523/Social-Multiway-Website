/* Fictional demo data; never a live feed. Character IDs are masked at source.
   Coins and company RM are independent. Replace this adapter with server-side
   filtering, summaries and pagination when a real data source is available. */
(function (root) {
  'use strict';
  const timeZone = 'Asia/Kuala_Lumpur';
  const types = ['kid', 'elder', 'pet'];
  function currentDate(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
  }
  function pagination(total, page = 1, size = 10) {
    size = [10, 25, 50].includes(Number(size)) ? Number(size) : 10;
    const pages = Math.max(1, Math.ceil(total / size));
    page = Math.min(pages, Math.max(1, Math.trunc(Number(page)) || 1));
    const offset = (page - 1) * size;
    return { total, page, size, pages, offset, start: total ? offset + 1 : 0, end: Math.min(offset + size, total) };
  }
  function createDemoData(now = new Date()) {
    const today = currentDate(now);
    const anchor = Date.parse(today + 'T00:00:00Z');
    const dates = Array.from({ length: 8 }, (_, index) => new Date(anchor - index * 86400000).toISOString().slice(0, 10));
    const incoming = types.flatMap((type, kind) => dates.flatMap(date => {
      const day = Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
      return Array.from({ length: 100 }, (_, index) => ({
        key: 'demo-' + type + '-' + date + '-' + index,
        type, date,
        characterId: ['KD', 'EL', 'PT'][kind] + 'xxxxxxxxxx' + String((index * 37 + day * 11) % 100).padStart(2, '0'),
        coins: 100 + ((index * 7919 + day * 13721 + kind * 56333 + index * day * 313) % (165000 + kind * 27000))
      }));
    }));
    // Standalone company submissions, tagged by supported character type.
    // Counts vary (including empty dates); no record is derived from user coins.
    const outgoing = types.flatMap((type, kind) => dates.flatMap(date => {
      const day = Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
      return Array.from({ length: (day * 7 + kind * 11) % 15 }, (_, index) => ({
        key: 'company-' + type + '-' + date + '-' + String(index + 1).padStart(2, '0'),
        type, date,
        sen: 12500 + ((day * 73129 + kind * 47237 + index * 19391) % 180000),
        images: []
      }));
    }));
    const byType = new Map(types.map(type => [type, incoming.filter(row => row.type === type).sort((a, b) => b.coins - a.coins || a.key.localeCompare(b.key))]));
    const rowsFor = (date, type) => {
      const rows = byType.get(type) || [];
      return date === 'all' ? rows : rows.filter(row => row.date === date);
    };
    const companyRowsFor = (date, type) => outgoing.filter(row => row.type === type && (date === 'all' || row.date === date));
    function query({ mode = 'in', date = 'all', type = 'kid', page = 1, size = 10 } = {}) {
      const rows = mode === 'out' ? companyRowsFor(date, type) : rowsFor(date, type);
      const meta = pagination(rows.length, page, size);
      return { ...meta, rows: rows.slice(meta.offset, meta.end) };
    }
    function summary(date = 'all', type = 'kid') {
      const users = rowsFor(date, type);
      const company = companyRowsFor(date, type);
      return { coins: users.reduce((sum, row) => sum + row.coins, 0), count: users.length, highest: users[0]?.coins ?? 0, sen: company.reduce((sum, row) => sum + row.sen, 0), companyRecords: company.length };
    }
    return { dates, types, today, timeZone, incoming, outgoing, pagination, query, summary, currentDate, createDemoData };
  }
  const data = createDemoData();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.SocialBookData = data;
})(globalThis);
