import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, '..', 'osint4all-archive', 'README.md');
const markdown = await readFile(source, 'utf8');

const restrictedCategories = new Set([
  'ID GENERATOR', 'HASH RECOVERY', 'DATA DUMP', 'VOTER DATABASES',
  'INFORMANT', 'SEX OFFENDER', 'RESIDENT DATABASE', 'DARKNET',
]);
const restrictedTerms = /(?:fake|generator|dump|breach|leak|credit card|ssn|driver.?s license|passport|credential|password|dox|exploit)/i;

let category = 'UNSORTED';
let ordinal = 0;
const full = [];

for (const rawLine of markdown.split(/\r?\n/)) {
  const heading = rawLine.match(/^##\s+(.+)$/);
  if (heading) {
    category = heading[1].replace(/\\/g, '').trim();
    continue;
  }

  const link = rawLine.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
  if (!link) continue;

  const [, title, url] = link;
  const restricted = restrictedCategories.has(category) || restrictedTerms.test(title);
  full.push({
    id: `osint4all-${String(++ordinal).padStart(4, '0')}`,
    title: title.trim(),
    url,
    category,
    access: restricted ? 'review' : 'catalog',
    source: 'OSINT4ALL public CC0 archive',
  });
}

const catalog = full.filter((entry) => entry.access === 'catalog');
const categoryCounts = Object.entries(
  catalog.reduce((counts, entry) => ({ ...counts, [entry.category]: (counts[entry.category] ?? 0) + 1 }), {}),
).sort(([a], [b]) => a.localeCompare(b));

const manifest = {
  schema: 'cyberdek.atlas/archive-manifest/v1',
  generatedAt: new Date().toISOString(),
  source: {
    startMe: 'https://start.me/p/L1rEYQ/osint4all',
    mirror: 'https://github.com/osint4all/osint4all.github.io',
    license: 'CC0-1.0',
    sourceRevision: '02877d90e42fc75e922393d4b231bb9c5f64f5a6',
  },
  inventory: {
    totalCollected: full.length,
    publicCatalog: catalog.length,
    reviewRequired: full.length - catalog.length,
    headings: [...new Set(full.map((entry) => entry.category))].length,
  },
  categories: Object.fromEntries(categoryCounts),
  policy: 'The public directory excludes links that materially enable fraud, credential abuse, identity forgery or privacy invasion. The complete locally preserved inventory is not published.',
};

await mkdir(resolve(root, 'public'), { recursive: true });
await mkdir(resolve(root, 'private'), { recursive: true });
await writeFile(resolve(root, 'public', 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(resolve(root, 'public', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(resolve(root, 'private', 'osint4all-full-archive.json'), `${JSON.stringify(full, null, 2)}\n`);

console.log(`Collected ${full.length} entries; published ${catalog.length}; marked ${full.length - catalog.length} for review.`);
