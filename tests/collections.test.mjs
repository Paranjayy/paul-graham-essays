import test from 'node:test';
import assert from 'node:assert/strict';
import{parseQuotes}from'../lib/collections.mjs';
import{essayStats,selectQuotes}from'../public/collection-tools.mjs';
const cell=n=>`<tr><td width="421"><font>Generated sentence ${n} about durable systems and creative engineering.<br><br>— Author ${n}, source book<br></font></td></tr>`;
const page=n=>'<table>'+Array.from({length:n},(_,i)=>cell(i)).join('')+'</table>';
test('quotes keep attribution and source order without storing original wording or inventing dates',()=>{
 const rows=parseQuotes(page(20),[],'2026-01-01T00:00:00Z');
 assert.equal(rows.length,20);assert.equal(rows[0].author,'Author 0');assert.equal(rows[0].order,1);
 assert.equal(rows[0].firstIndexedAt,null);assert.equal(rows[0].text,undefined);assert.equal(rows[0].quote,undefined);
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
