import { fetchIndex } from '../lib/feed.mjs';
import { writeFile, rename } from 'node:fs/promises';
const data = await fetchIndex();
await writeFile(new URL('../data/last-good.tmp', import.meta.url),JSON.stringify(data,null,2)+'\n');
await rename(new URL('../data/last-good.tmp', import.meta.url),new URL('../data/last-good.json', import.meta.url));
console.log(`Validated ${data.essays.length} essays. Latest: ${data.essays[0].title}`);
