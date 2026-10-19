import test from 'node:test';
import assert from 'node:assert/strict';
import { XMLValidator, XMLParser } from 'fast-xml-parser';
import { parseIndex, rss, jsonFeed, fetchIndex, etag } from '../lib/feed.mjs';
const rows = Array.from({length:25},(_,i)=>`<tr><td><font><a href="essay-${i}.html">Essay ${i} &amp; more</a></font></td></tr>`).join('');
const fixture = `<table><tr><td><a href="recommended.html">Recommended</a><a href="other.html">Other</a></td></tr>${rows}<tr><td><a href="essay-0.html">duplicate</a></td></tr><tr><td><a href="https://evil.example/article.html">External</a></td></tr></table>`;
test('index preserves essay order and excludes intro links, duplicates and external URLs',()=>{
 const items=parseIndex(fixture);assert.equal(items.length,25);assert.equal(items[0].title,'Essay 0 & more');assert.equal(items[24].url,'https://www.paulgraham.com/essay-24.html');
});
test('source failures cannot silently produce an empty feed',async()=>{
 assert.throws(()=>parseIndex('<html>blocked</html>'),/validation failed/);
 await assert.rejects(()=>fetchIndex(async()=>new Response('blocked',{status:429})),/HTTP 429/);
});
test('feeds escape titles, use stable IDs and omit invented publication dates',()=>{
 const data={essays:parseIndex(fixture),checkedAt:'2026-10-19T00:00:00Z',stale:false};
 const body=rss(data,'https://example.org');assert.equal(XMLValidator.validate(body),true);
 const parsed=new XMLParser().parse(body);assert.equal(parsed.rss.channel.item.length,25);assert.equal(parsed.rss.channel.item[0].title,'Essay 0 & more');assert.equal(parsed.rss.channel.item[0].pubDate,undefined);
 const json=JSON.parse(jsonFeed(data,'https://example.org'));assert.equal(json.items[0].id,data.essays[0].url);assert.equal(json.items[0].date_published,undefined);assert.equal(etag(body),etag(body));
});
test('upstream outage serves the durable fallback and labels its original timestamp',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>{throw new Error('offline')};
 try {
  const {currentFeed}=await import('../lib/feed.mjs');
  const data=await currentFeed();
  assert.equal(data.stale,true);assert.ok(data.essays.length>=20);assert.ok(Date.parse(data.checkedAt));
 } finally {globalThis.fetch=original}
});
