import{essayStats,selectQuotes,hashSearchTerms}from'./collection-tools.mjs';
const $=id=>document.getElementById(id),number=new Intl.NumberFormat('en');
let quotes=[],resources=[];
function view(){const active=['essays','stats','quotes','readers'].includes(location.hash.slice(1))?location.hash.slice(1):'essays';document.querySelectorAll('[data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==active);document.querySelectorAll('[data-view]').forEach(link=>{if(link.dataset.view===active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});}
window.addEventListener('hashchange',view);view();
function text(tag,value,cls){const node=document.createElement(tag);node.textContent=value;if(cls)node.className=cls;return node;}
function original(item,label=item.title){const a=text('a',label+' ↗');a.href=item.url;return a;}
function stats(essays){
 const data=essayStats(essays);
 const cards=[['HTML essays',number.format(data.essays)],['Words, approximately',number.format(data.words)],['Reading hours, approximately',data.readingHours.toFixed(1)],['Median essay length',number.format(data.medianWords)+' words']];
 $('stats-cards').replaceChildren(...cards.map(([label,value])=>{const card=document.createElement('div');card.append(text('span',label),text('strong',value));return card;}));
 const max=Math.max(...data.byYear.map(y=>y.count));
 $('year-chart').replaceChildren(...data.byYear.map(year=>{const button=document.createElement('button');button.setAttribute('aria-label',`${year.year}: ${year.count} essays. Browse year.`);button.append(text('span',year.year,'chart-year'));const track=text('span','','chart-track'),bar=text('span','','chart-fill');bar.style.width=100*year.count/max+'%';track.append(bar);button.append(track,text('span',String(year.count),'chart-number'));button.onclick=()=>{const select=$('year');select.value=year.year;select.dispatchEvent(new Event('change',{bubbles:true}));location.hash='essays';$('catalog').scrollIntoView({block:'start'});};return button;}));
 const highlights=$('stats-highlights');highlights.replaceChildren(text('h3','A little perspective'),text('p',`${data.dated} essays have source-header dates. ${data.undated} are undated. ${data.chapters} text chapters are outside these word totals.`),text('h4','Longest indexed essay'));
 if(data.longest)highlights.append(original(data.longest),text('p',number.format(data.longest.wordCount)+' words ≈'));
 highlights.append(text('h4','Shortest indexed page'));
 if(data.shortest)highlights.append(original(data.shortest),text('p',number.format(data.shortest.wordCount)+' words ≈'));
 highlights.append(text('p','Short entries can be pointers to other material. Length is a navigation aid, not a quality score.'));
}
let quoteRenderVersion=0;
async function renderQuotes(){
 const version=++quoteRenderVersion;
 const queryHashes=await hashSearchTerms($('quote-search').value);
 if(version!==quoteRenderVersion)return;
 const rows=selectQuotes(quotes,{queryHashes,query:$('quote-search').value,author:$('quote-author').value,reverse:$('quote-order').value==='reverse'});
 $('quote-count').textContent=`${rows.length} of ${quotes.length} entries · ${new Set(quotes.map(q=>q.author)).size} authors`;
 $('quote-rows').replaceChildren(...rows.map(quote=>{const tr=document.createElement('tr');const order=text('td',String(quote.order).padStart(3,'0'),'number'),author=text('td',quote.author),topics=document.createElement('td'),words=text('td',String(quote.wordCount),'numeric'),source=document.createElement('td');author.title=quote.attribution;for(const topic of quote.topics)topics.append(text('span',topic,'topic-word'));source.append(original(quote,'Open source'));tr.append(order,author,topics,words,source);return tr;}));
 $('quote-empty').hidden=rows.length>0;
 const params=new URLSearchParams(location.search);for(const key of ['quote','author','quoteOrder'])params.delete(key);if($('quote-search').value)params.set('quote',$('quote-search').value);if($('quote-author').value)params.set('author',$('quote-author').value);if($('quote-order').value==='reverse')params.set('quoteOrder','reverse');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);
}
let readerEssays=[];
function renderReaders(){
 const people=new Map();
 for(const essay of readerEssays)for(const name of essay.draftReaders||[]){if(!people.has(name))people.set(name,[]);people.get(name).push(essay);}
 const rows=[...people].filter(([name])=>name.toLowerCase().includes($('reader-search').value.toLowerCase()));
 const first=entries=>entries.map(e=>e.published).filter(Boolean).sort()[0]||'9999';
 rows.sort((a,b)=>$('reader-sort').value==='name'?a[0].localeCompare(b[0]):$('reader-sort').value==='first'?first(a[1]).localeCompare(first(b[1])):b[1].length-a[1].length||a[0].localeCompare(b[0]));
 $('reader-count').textContent=`${rows.length} readers · ${readerEssays.filter(e=>e.draftReaders?.length).length} essays with recognized draft credits`;
 $('reader-rows').replaceChildren(...rows.map(([name,entries])=>{const tr=document.createElement('tr'),links=document.createElement('td'),dates=entries.map(e=>e.published).filter(Boolean).sort();const details=document.createElement('details');details.append(text('summary','Browse '+entries.length+' essays'));for(const essay of entries){const p=document.createElement('p');p.append(original(essay,essay.title+(essay.supplementary?' (supplementary source)':''))); details.append(p);}links.append(details);tr.append(text('td',name),text('td',String(entries.length)),text('td',dates.length?dates[0]+' / '+dates.at(-1):'Date unavailable'),links);return tr;}));
}
$('reader-search').oninput=renderReaders;$('reader-sort').onchange=renderReaders;
$('quote-search').oninput=renderQuotes;$('quote-author').onchange=renderQuotes;$('quote-order').onchange=renderQuotes;
try{
 const [catalog,collections]=await Promise.all(['/catalog.json','/collections.json'].map(async path=>{const r=await fetch(path,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Index unavailable');return r.json();}));
 readerEssays=[...catalog.essays,...(catalog.acknowledgementExtras||[])];renderReaders();stats(catalog.essays);quotes=collections.quotes;resources=collections.resources;
 for(const author of [...new Set(quotes.map(q=>q.author))].sort((a,b)=>a.localeCompare(b))){const option=text('option',author);option.value=author;$('quote-author').append(option);}
 const params=new URLSearchParams(location.search);$('quote-search').value=(params.get('quote')||'').slice(0,200);$('quote-author').value=params.get('author')||'';$('quote-order').value=params.get('quoteOrder')==='reverse'?'reverse':'source';renderQuotes();
}catch{$('collections-error').hidden=false;}
