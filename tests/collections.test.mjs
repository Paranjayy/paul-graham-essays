import test from 'node:test';
import assert from 'node:assert/strict';
import{parseQuotes}from'../lib/collections.mjs';
import{essayStats,selectQuotes}from'../public/collection-tools.mjs';
const cell=n=>`<tr><td width="421"><font>Generated sentence ${n} about durable systems and creative engineering.<br><br>— Author ${n}, source book<br></font></td></tr>`;
const page=n=>'<table>'+Array.from({length:n},(_,i)=>cell(i)).join('')+'</table>';
test('quotes keep attribution and source order with quotation text without inventing dates',()=>{
 const rows=parseQuotes(page(20),[],'2026-01-01T00:00:00Z');
 assert.equal(rows.length,20);assert.equal(rows[0].author,'Author 0');assert.equal(rows[0].order,1);
 assert.equal(rows[0].firstIndexedAt,null);assert.match(rows[0].text,/Generated sentence 0/);assert.equal(rows[0].quote,undefined);
 assert.ok(rows[0].topics.includes('engineering'));assert.ok(rows[0].url.startsWith('https://www.paulgraham.com/quo.html'));
 const later=parseQuotes(page(21),rows,'2026-02-01T00:00:00Z');
 assert.equal(later[0].id,rows[0].id);assert.equal(later[0].firstIndexedAt,null);
 assert.equal(later[20].firstIndexedAt,'2026-02-01T00:00:00Z');
 assert.throws(()=>parseQuotes('<html>blocked</html>'),/validation failed/);
});
test('quote search includes short author names and never treats source position as a date',()=>{
 const rows=[{id:'1',author:'Alan Kay',attribution:'Alan Kay',topics:['systems'],order:1},{id:'2',author:'Author',attribution:'Author',topics:['engineering'],order:2}];
 assert.equal(selectQuotes(rows,{query:'Kay'}).length,1);
 assert.equal(selectQuotes(rows,{query:'engineering'})[0].id,'2');
 assert.equal(selectQuotes(rows,{reverse:true})[0].id,'2');
});
test('essay statistics exclude text chapters, preserve undated coverage, and compute a numeric median',()=>{
 const stats=essayStats([{title:'A',wordCount:100,published:'2001-01',format:'essay'},{title:'B',wordCount:300,published:null,format:'essay'},{title:'Chapter',wordCount:900,format:'text chapter'}]);
 assert.equal(stats.words,400);assert.equal(stats.essays,2);assert.equal(stats.chapters,1);assert.equal(stats.medianWords,200);
 assert.equal(stats.dated,1);assert.equal(stats.undated,1);assert.equal(stats.byYear[0].count,1);
});
test('hashed word search finds source wording that is absent from displayed topic labels',async()=>{
 const {hashSearchTerms}=await import('../public/collection-tools.mjs');
 const rows=parseQuotes(page(20));rows[0].topics=[];
 const queryHashes=await hashSearchTerms('durable systems');
 const result=selectQuotes(rows.slice(0,1),{query:'durable systems',queryHashes});
 assert.equal(result.length,1);assert.match(result[0].text,/durable systems/);
 assert.equal(selectQuotes(rows,{query:'unmentioned',queryHashes:await hashSearchTerms('unmentioned')}).length,0);
});

test('quote table sorts text, author and numeric length in both directions',()=>{
 const rows=[{order:1,text:'Zulu',author:'Ada',attribution:'Ada',wordCount:10},{order:2,text:'Alpha',author:'Zed',attribution:'Zed',wordCount:2}];
 assert.equal(selectQuotes(rows,{sort:'text'})[0].text,'Alpha');
 assert.equal(selectQuotes(rows,{sort:'author',direction:'desc'})[0].author,'Zed');
 assert.equal(selectQuotes(rows,{sort:'wordCount'})[0].wordCount,2);
 assert.equal(selectQuotes(rows,{sort:'wordCount',direction:'desc'})[0].wordCount,10);
 assert.equal(selectQuotes(rows,{query:'Zulu'})[0].order,1);
});

test('quotation text preserves deliberate line breaks without HTML source wrapping',()=>{
 const html=page(20).replace('Generated sentence 0 about durable systems and creative engineering.','First line\n wrapped in HTML.<br>Second poetic line.');
 const row=parseQuotes(html)[0];
 assert.equal(row.text,'First line wrapped in HTML.\nSecond poetic line.');
});
