import {load} from 'cheerio';
import {createHash} from 'node:crypto';
import {quoteTopics} from '../public/collection-tools.mjs';
export function parseQuotes(html, previous=[],checkedAt=new Date().toISOString()) {
 const $=load(html), prior=new Map(previous.map(x=>[x.id,x])), rows=[];
 $('td[width="421"]').each((_,cell)=>{
  const clone=$(cell).clone();clone.find('script,style').remove();clone.find('br').replaceWith('\n');
  const text=clone.text().replace(/\r/g,'').trim();
  const lines=text.split('\n').map(x=>x.trim()).filter(Boolean);
  const at=lines.findLastIndex(x=>/^[—–�]\s*/.test(x));
  if(at<1)throw new Error('Quote attribution layout changed');
  const quote=lines.slice(0,at).join(' '),attribution=lines.slice(at).join(' ').replace(/^[—–�]\s*/,'');
  const author=attribution.split(/,|\s+in\s+(?:an?|the)\s|\s+quoted\s+in\s/i)[0].trim();
  const id=createHash('sha256').update(quote+'\n'+attribution).digest('hex').slice(0,24);
  if(rows.some(x=>x.id===id))return;
  rows.push({id,order:rows.length+1,author,attribution,topics:quoteTopics(quote),wordCount:(quote.match(/[\p{L}\p{N}]+/gu)||[]).length,url:'https://www.paulgraham.com/quo.html#:~:text='+encodeURIComponent(author),firstIndexedAt:prior.has(id)?prior.get(id).firstIndexedAt:previous.length?checkedAt:null});
 });
 if(rows.length<20)throw new Error('Quote collection validation failed');
 return rows;
}
