import { currentFeed, rss, jsonFeed, etag } from '../lib/feed.mjs';
export default async function handler(req, res) {
  if (!['GET','HEAD'].includes(req.method)) { res.setHeader('Allow','GET, HEAD'); return res.status(405).end(); }
  try {
    const data = await currentFeed();
    const origin = process.env.FEED_ORIGIN || 'https://pg-essays-feed.vercel.app';
    const format = new URL(req.url,origin).searchParams.get('format');
    const json = format === 'json';
    const body = format === 'status' ? JSON.stringify({source:'https://www.paulgraham.com/articles.html',checkedAt:data.checkedAt,stale:data.stale,essays:data.essays.length,latest:data.essays[0]}) : json ? jsonFeed(data,origin) : rss(data,origin);
    const tag = etag(body);
    res.setHeader('Content-Type', json ? 'application/feed+json; charset=utf-8' : format === 'status' ? 'application/json; charset=utf-8' : 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control',data.stale ? 'public, max-age=60, s-maxage=60' : 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Feed-Status', data.stale ? 'stale' : 'fresh');
    res.setHeader('X-Source-Checked-At', data.checkedAt);
    res.setHeader('ETag',tag);
    res.setHeader('Access-Control-Allow-Origin','*');
    if (req.headers['if-none-match'] === tag) return res.status(304).end();
    return res.status(200).end(req.method === 'HEAD' ? undefined : body);
  } catch { res.setHeader('Cache-Control','no-store'); return res.status(503).end('Feed temporarily unavailable'); }
}
