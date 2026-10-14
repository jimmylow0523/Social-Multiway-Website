/* Fictional preview data. Publish masked IDs only; never send full IDs to a browser.
   Company spending is independent of user coin spending. RM values are in sen.
   Evidence entries: { src: '/assets/evidence/file.webp', alt: 'Accurate description' }. */
(function (root) {
  'use strict';
  const incoming = [
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx12",
    "coins": 128000
  },
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx47",
    "coins": 96550
  },
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx83",
    "coins": 72000
  },
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx26",
    "coins": 58000
  },
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx59",
    "coins": 42500
  },
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx04",
    "coins": 31000
  },
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx71",
    "coins": 18500
  },
  {
    "date": "2026-10-13",
    "characterId": "EMxxxxxxxxxx38",
    "coins": 9500
  },
  {
    "date": "2026-10-12",
    "characterId": "EMxxxxxxxxxx47",
    "coins": 112000
  },
  {
    "date": "2026-10-12",
    "characterId": "EMxxxxxxxxxx12",
    "coins": 89000
  },
  {
    "date": "2026-10-12",
    "characterId": "EMxxxxxxxxxx59",
    "coins": 64000
  },
  {
    "date": "2026-10-12",
    "characterId": "EMxxxxxxxxxx83",
    "coins": 48000
  },
  {
    "date": "2026-10-12",
    "characterId": "EMxxxxxxxxxx04",
    "coins": 27500
  },
  {
    "date": "2026-10-12",
    "characterId": "EMxxxxxxxxxx26",
    "coins": 15000
  },
  {
    "date": "2026-10-11",
    "characterId": "EMxxxxxxxxxx83",
    "coins": 105000
  },
  {
    "date": "2026-10-11",
    "characterId": "EMxxxxxxxxxx26",
    "coins": 76500
  },
  {
    "date": "2026-10-11",
    "characterId": "EMxxxxxxxxxx71",
    "coins": 52000
  },
  {
    "date": "2026-10-11",
    "characterId": "EMxxxxxxxxxx38",
    "coins": 24000
  }
];
  const outgoing = [
    { date: '2026-10-13', sen: 180000, images: [] },
    { date: '2026-10-12', sen: 96500, images: [] },
    { date: '2026-10-11', sen: 142000, images: [] }
  ];
  const dates = [...new Set([...incoming, ...outgoing].map(record => record.date))].sort().reverse();
  function day(date) {
    const users = incoming.filter(record => record.date === date).sort((a, b) => b.coins - a.coins);
    const company = outgoing.find(record => record.date === date);
    return { date, users, coins: users.reduce((sum, record) => sum + record.coins, 0), sen: company?.sen ?? null, images: company?.images ?? [] };
  }
  const data = { incoming, outgoing, dates, day };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.SocialBookData = data;
})(globalThis);
