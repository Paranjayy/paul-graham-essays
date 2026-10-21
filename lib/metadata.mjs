import { load } from 'cheerio';
const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const monthPattern = '(' + months.join('|') + ')';
export function publicationDate(text) {
  // Header lines only. Never infer a date from an event mentioned in the body.
  for (const line of text.slice(0,500).split('\n').map(x=>x.trim()).filter(Boolean).slice(0, 8)) {
    const dayFirst = line.match(new RegExp('^(\\d{1,2})\\s+'+monthPattern+'\\s+(19\\d{2}|20\\d{2})(?:\\b)', 'i'));
    const monthFirst = line.match(new RegExp('^'+monthPattern+'\\s+(?:(\\d{1,2}),?\\s+)?(19\\d{2}|20\\d{2})(?:\\b)', 'i'));
    const match = dayFirst || monthFirst;
    if (!match) continue;
    const rest = line.slice(match[0].length).trim();
    if (rest && !/^(?:[,.(\[]|rev\b|revised\b|updated\b)/i.test(rest)) continue;
    const month = months.indexOf((dayFirst ? match[2] : match[1]).toLowerCase())+1;
    const day = Number(dayFirst ? match[1] : match[2]) || null;
    const year = Number(match[3]);
    if (day && (day > new Date(Date.UTC(year,month,0)).getUTCDate() || day < 1)) continue;
    const date = `${year}-${String(month).padStart(2,'0')}${day ? '-'+String(day).padStart(2,'0') : ''}`;
    return { published: date, datePrecision: day ? 'day' : 'month', dateLabel: match[0], header: match[0] };
  }
  return { published: null, datePrecision: null, dateLabel: null, header: '' };
}
export function parseMetadata(body, url) {
  let text;
  const isText = new URL(url).pathname.endsWith('.txt');
  if (isText) text = body;
  else {
    const $ = load(body);
    $('script,style,form,nav,aside').remove();
    $('br').replaceWith('\n');
    $('p,div,li,blockquote,pre,h1,h2,h3').each((_,el)=>$(el).append('\n'));
    // Legacy pages can close font tags mid-essay. The content cell contains
    // the complete body, while the longest individual font can be only half.
    const cells = $('td[width="435"]').map((_,el)=>$(el).text()).get();
    const candidates = (cells.length ? cells : $('font[face]').map((_,el)=>$(el).text()).get()).sort((a,b)=>b.length-a.length);
    text = candidates[0];
    if (!text || text.trim().length < 100) throw new Error('Essay body not recognized');
  }
  text = text.replace(/\r/g,'').replace(/\u00a0/g,' ').trim();
  if (text.length < 100 || /^\s*</.test(text) && isText) throw new Error('Essay body not recognized');
  const date = publicationDate(text);
  // Count the body from its date header onward; this drops legacy YC banners.
  const headerStart = date.header ? text.indexOf(date.header) : -1;
  const lineEnd = headerStart >= 0 ? text.indexOf('\n',headerStart) : -1;
  const start = headerStart >= 0 ? (lineEnd >= 0 ? lineEnd : headerStart+date.header.length) : 0;
  const content = text.slice(start);
  const wordCount = (content.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length;
  const {header,...published}=date;
  return { extractorVersion: 2, ...published, wordCount, readingMinutes: Math.max(1, Math.ceil(wordCount/225)), format: isText ? 'text chapter' : 'essay' };
}
export function safeEssayUrl(raw) {
  const u = new URL(raw);
  if (u.protocol !== 'https:' || u.username || u.password) throw new Error('Unsupported essay URL');
  if (u.hostname === 'www.paulgraham.com' && /^\/[\w-]+\.html$/.test(u.pathname)) return u.href;
  if (u.hostname === 'sep.turbifycdn.com' && /^\/ty\/cdn\/paulgraham\/acl[12]\.txt$/.test(u.pathname)) return u.href;
  throw new Error('Unsupported essay URL');
}
export async function fetchMetadata(url, fetcher=fetch) {
  safeEssayUrl(url);
  const response = await fetcher(url,{signal:AbortSignal.timeout(15000),redirect:'error',headers:{'User-Agent':'PG-Essays-Index/1.0 (+https://pg-essays-feed.vercel.app/)'}});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body=await response.text();
  if(body.length>2_000_000) throw new Error('Essay exceeds size limit');
  return parseMetadata(body,url);
}
