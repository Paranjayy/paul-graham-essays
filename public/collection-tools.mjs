const common=new Set('about after again against almost also always another anybody anyone anything because been before being best both could does doing down each even every everything from going good great have here into just know like little made make many more most much must never only other over people really said same should some something than that their them then there these they thing things think this those through time very want well were what when where which while will with without would your you are and the for but not all can had has its our out too was who how new now off one two get way'.split(' '));
export function quoteTopics(text) {
 const counts=new Map();
 for(const word of text.toLowerCase().match(/[\p{L}][\p{L}'’-]*/gu)||[]){if(word.length<4||common.has(word))continue;counts.set(word,(counts.get(word)||0)+1);}
 return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,8).map(([word])=>word);
}
export function essayStats(essays) {
 const articles=essays.filter(x=>x.format!=='text chapter'),counted=articles.filter(x=>Number.isFinite(x.wordCount));
 const sorted=counted.toSorted((a,b)=>a.wordCount-b.wordCount),byYear=new Map();
 for(const item of articles)if(item.published){const year=item.published.slice(0,4),current=byYear.get(year)||{year,count:0,words:0};current.count++;current.words+=item.wordCount||0;byYear.set(year,current);}
 const words=counted.reduce((total,x)=>total+x.wordCount,0),n=sorted.length;
 return {essays:articles.length,chapters:essays.length-articles.length,dated:articles.filter(x=>x.published).length,undated:articles.filter(x=>!x.published).length,words,readingHours:words/225/60,averageWords:n?Math.round(words/n):0,medianWords:n?Math.round((sorted[Math.floor((n-1)/2)].wordCount+sorted[Math.floor(n/2)].wordCount)/2):0,shortest:sorted[0]||null,longest:sorted.at(-1)||null,byYear:[...byYear.values()].sort((a,b)=>a.year.localeCompare(b.year))};
}
export function selectQuotes(quotes,{query='',author='',reverse=false,queryHashes=[]}={}){
 const terms=searchWords(query);
 const filtered=quotes.filter(x=>(!author||x.author===author)&&terms.every((term,index)=>(x.author+' '+x.attribution+' '+x.topics.join(' ')).toLowerCase().includes(term)||(queryHashes[index]&&x.wordHashes?.includes(queryHashes[index]))));
 return filtered.toSorted((a,b)=>reverse?b.order-a.order:a.order-b.order);
}
export function searchWords(text) {
 return [...new Set((text.normalize('NFKC').toLowerCase().replaceAll('’',"'").match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu)||[]))];
}
export async function hashSearchTerms(text) {
 return Promise.all(searchWords(text).map(async word=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(word))),b=>b.toString(16).padStart(2,'0')).join('').slice(0,16)));
}
