'use client';
let cache = null;

export async function t(lang, key) {
  if (!cache) {
    const res = await fetch('/translations.csv', { cache: 'no-store' });
    const text = await res.text();
    cache = parseCSV(text);
  }
  const row = cache[key];
  if (!row) return key;
  return row[lang] || row['en'] || key;
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',');
  const idxKey = header.indexOf('key');
  const idxHu = header.indexOf('hu');
  const idxEn = header.indexOf('en');
  const map = {};
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCSVLine(lines[i]);
    const key = parts[idxKey];
    map[key] = { hu: parts[idxHu], en: parts[idxEn] };
  }
  return map;
}

function splitCSVLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i=0;i<line.length;i++){
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { out.push(cur); cur=''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}
