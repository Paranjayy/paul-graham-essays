import{readFile,writeFile,rename}from'node:fs/promises';
import{load}from'cheerio';
import{parseQuotes}from'../lib/collections.mjs';
import{xml}from'../lib/feed.mjs';
const output=new URL('../public/collections.json',import.meta.url);
let previous;try{previous=JSON.parse(await readFile(output,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
async function html(url){const response=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'Paul-Graham-RSS/1.0 (+https://pg-essays-feed.vercel.app/)'}});if(!response.ok)throw Error(`Source HTTP ${response.status}`);const bytes=await response.arrayBuffer();if(bytes.byteLength>2_000_000)throw Error('Source exceeds size limit');try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{return new TextDecoder('windows-1252').decode(bytes);}}
const checkedAt=new Date().toISOString();
const quotes=parseQuotes(await html('https://www.paulgraham.com/quo.html'),previous?.quotes||[],checkedAt);
// Original navigation pages. Their content stays on the author's site.
const paths=[['arc.html','Languages'],['bel.html','Languages'],['lisp.html','Languages'],['onlisp.html','Books'],['acl.html','Books'],['antispam.html','Spam'],['spam.html','Spam'],['kedrosky.html','Responses'],['faq.html','Questions'],['raq.html','Questions'],['bio.html','About']];
const resources=[];
for(const [path,category]of paths){
 const url='https://www.paulgraham.com/'+path;
 try{const $=load(await html(url));const title=$('title').first().text().trim();if(!title)throw Error('Page title unavailable');resources.push({title,url,category,checkedAt});}
 catch(error){const old=previous?.resources?.find(x=>x.url===url);resources.push(old?{...old,error:error.message}:{title:path.replace('.html',''),url,category,error:error.message});}
}
const data={checkedAt,source:'https://www.paulgraham.com/quo.html',quotePolicy:'Quotations and source attributions, displayed in the quote table. Source position is not a publication date.',quotes,resources};
await writeFile(new URL(output.href+'.tmp'),JSON.stringify(data,null,2)+'\n');await rename(new URL(output.href+'.tmp'),output);
const recent=quotes.toSorted((a,b)=>(b.firstIndexedAt||'').localeCompare(a.firstIndexedAt||'')||b.order-a.order).slice(0,60);
const feed=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Paul Graham RSS — Quote collection index</title><link>https://www.paulgraham.com/quo.html</link><description>Author and topic links for Paul Graham's quote collection. Dates, when present, mean first indexed here, not quote publication. Initial entries have no date.</description><atom:link href="https://pg-essays-feed.vercel.app/quotes.xml" rel="self" type="application/rss+xml"/><lastBuildDate>${new Date(checkedAt).toUTCString()}</lastBuildDate>${recent.map(q=>`<item><guid isPermaLink="false">pg-quote-${q.id}</guid><title>${xml(q.author+' — '+q.topics.slice(0,4).join(' · '))}</title><link>${xml(q.url)}</link><description>Open the original quote collection for the quotation. Source position: ${q.order}.</description>${q.firstIndexedAt?'<pubDate>'+new Date(q.firstIndexedAt).toUTCString()+'</pubDate>':''}</item>`).join('')}</channel></rss>`;
await writeFile(new URL('../public/quotes.xml',import.meta.url),feed+'\n');
console.log(`Collections: ${quotes.length} quote records, ${new Set(quotes.map(q=>q.author)).size} authors, ${resources.length} resources (${resources.filter(x=>x.error).length} refresh errors).`);
