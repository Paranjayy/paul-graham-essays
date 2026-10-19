import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
export const INDEX = 'https://www.paulgraham.com/articles.html';
export function parseIndex(html) {
  const $ = load(html), seen = new Set(), essays = [];
  // The essay list has one link per row. Intro recommendations have several.
  $('tr').each((_, row) => {
    const cell = $(row).children('td');
    if (cell.length !== 1) return;
    const links = cell.find('a[href]');
    if (links.length !== 1) return;
    const title = links.text().replace(/\s+/g, ' ').trim();
    const url = new URL(links.attr('href'), INDEX);
    if (!title || url.origin !== new URL(INDEX).origin || !/^\/[\w-]+\.html$/.test(url.pathname)) return;
    if (['articles.html','index.html','rss.html'].includes(url.pathname.slice(1))) return;
    url.hash = ''; url.search = '';
    if (seen.has(url.href)) return;
    seen.add(url.href); essays.push({ title, url: url.href });
  });
  if (essays.length < 20) throw new Error('Essay index validation failed. Refusing an incomplete feed.');
  return essays;
}
export async function fetchIndex(fetcher = fetch) {
  const response = await fetcher(INDEX, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'PG-Essays-Feed/1.0 (+https://pg-essays-feed.vercel.app/)', Accept: 'text/html' } });
  if (!response.ok) throw new Error(`Essay index returned HTTP ${response.status}`);
  const html = await response.text();
  if (html.length > 2_000_000) throw new Error('Essay index exceeds size limit');
  return { checkedAt: new Date().toISOString(), essays: parseIndex(html) };
}
let memory;
let inFlight;
export async function currentFeed() {
  if (memory && Date.now() - Date.parse(memory.checkedAt) < 3600000) return { ...memory, stale: false };
  if (!inFlight) inFlight = fetchIndex().then(value => { memory = value; return { ...value, stale: false }; }).catch(async () => {
    const fallback = memory || JSON.parse(await readFile(new URL('../data/last-good.json', import.meta.url), 'utf8'));
    if (!Array.isArray(fallback.essays) || fallback.essays.length < 20) throw new Error('No valid fallback');
    return { ...fallback, stale: true };
  }).finally(() => { inFlight = undefined; });
  return inFlight;
}
export const xml = value => String(value).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function rss(data, origin) {
  const items = data.essays.slice(0, 60).map(item => `<item><title>${xml(item.title)}</title><link>${xml(item.url)}</link><guid isPermaLink="true">${xml(item.url)}</guid><description>${xml('Read this essay on Paul Graham’s website.')}</description></item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Paul Graham — Essays</title><link>${INDEX}</link><description>Latest essays from Paul Graham’s essay index. Independent feed. Publication dates are omitted because the index does not provide them.</description><language>en</language><ttl>60</ttl><lastBuildDate>${new Date(data.checkedAt).toUTCString()}</lastBuildDate><atom:link href="${xml(origin)}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}
export function jsonFeed(data, origin) {
  return JSON.stringify({ version:'https://jsonfeed.org/version/1.1', title:'Paul Graham — Essays', home_page_url:INDEX, feed_url:`${origin}/feed.json`, description:'Independent link feed. Source order is preserved. Publication dates are unavailable from the index.', _status:{checked_at:data.checkedAt,stale:data.stale}, items:data.essays.slice(0,60).map(x=>({id:x.url,url:x.url,title:x.title,content_text:'Read this essay on Paul Graham’s website.'})) });
}
export const etag = body => '"' + createHash('sha256').update(body).digest('hex') + '"';
