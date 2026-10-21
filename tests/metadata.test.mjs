import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMetadata,publicationDate,fetchMetadata,safeEssayUrl}from'../lib/metadata.mjs';
import {selectEssays,readView}from'../public/catalog-tools.mjs';
const body='One two three four five six seven eight nine ten. '.repeat(10);
test('month precision stays month-only and the original date wins over a revision',()=>{
 assert.deepEqual(publicationDate('April 2001, rev. April 2003\n'+body),{published:'2001-04',datePrecision:'month',dateLabel:'April 2001',header:'April 2001'});
 assert.equal(publicationDate('Some introduction\nFebruary 29, 2024\n'+body).published,'2024-02-29');
 assert.equal(publicationDate('February 30, 2024\n'+body).published,null);
 assert.equal(publicationDate('February 0, 2024\n'+body).published,null);
 assert.equal(publicationDate('March 2005 was a busy month.\n'+body).published,null);
 assert.equal(publicationDate(body+'\n'.repeat(10)+'March 2005').published,null);
});
test('body count excludes old banners and the date but keeps notes',()=>{
 const html=`<body><nav>Ignore me</nav><font face="verdana">Want to start a startup?<br>April 2001, rev. April 2003<br>${body}<br>Notes: more words.</font></body>`;
 const data=parseMetadata(html,'https://www.paulgraham.com/avg.html');
 assert.equal(data.wordCount,103);assert.equal(data.published,'2001-04');assert.equal(data.readingMinutes,1);
 assert.throws(()=>parseMetadata('<html>Access denied</html>','https://www.paulgraham.com/avg.html'),/not recognized/);
});
test('metadata fetch is restricted and rejects failed responses',async()=>{
 assert.throws(()=>safeEssayUrl('https://evil.example/essay.html'));
 assert.throws(()=>safeEssayUrl('https://www.paulgraham.com.evil.example/essay.html'));
 assert.throws(()=>safeEssayUrl('http://www.paulgraham.com/essay.html'));
 await assert.rejects(()=>fetchMetadata('https://www.paulgraham.com/avg.html',async()=>new Response('blocked',{status:429})),/429/);
});
const essays=[{order:1,title:'New idea',url:'https://example.org/1',published:'2026-09',dateLabel:'September 2026',wordCount:4000},{order:2,title:'Older idea',url:'https://example.org/2',published:'2001-04',dateLabel:'April 2001',wordCount:1000},{order:3,title:'Unknown',url:'https://example.org/3',published:null,dateLabel:null,wordCount:null}];
test('table sorting keeps unavailable metadata last in either direction',()=>{
 assert.deepEqual(selectEssays(essays,{sort:'published',direction:'desc'}).map(x=>x.order),[1,2,3]);
 assert.deepEqual(selectEssays(essays,{sort:'wordCount',direction:'asc'}).map(x=>x.order),[2,1,3]);
 assert.equal(selectEssays(essays,{query:'idea',year:'2026',length:'long'})[0].order,1);
 assert.equal(selectEssays(essays,{length:'short'}).length,1);
 assert.equal(selectEssays(essays,{year:'unknown'})[0].order,3);
 assert.equal(selectEssays(essays,{query:'nonexistent'}).length,0);
});
test('shared view state accepts only supported sorting and filter values',()=>{
 const view=readView(new URLSearchParams('q=idea&year=2026&sort=wordCount&dir=desc'));
 assert.equal(view.sort,'wordCount');assert.equal(view.year,'2026');
 assert.equal(readView(new URLSearchParams('sort=__proto__&year=nope')).sort,'order');
});
test('legacy font boundaries do not truncate an essay or hide its date',()=>{
 const html=`<table width="435"><tr><td width="435"><font face="verdana">September 2012<br>${body}</font><font face="verdana">${body}${body}</font></td></tr></table>`;
 const value=parseMetadata(html,'https://www.paulgraham.com/growth.html');
 assert.equal(value.published,'2012-09');assert.equal(value.wordCount,300);
});
