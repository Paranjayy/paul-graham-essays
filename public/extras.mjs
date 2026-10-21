import{essayStats,selectQuotes}from'./collection-tools.mjs';
const $=id=>document.getElementById(id),number=new Intl.NumberFormat('en');
let quotes=[],resources=[];
function view(){const active=['essays','stats','quotes','resources'].includes(location.hash.slice(1))?location.hash.slice(1):'essays';document.querySelectorAll('[data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==active);document.querySelectorAll('[data-view]').forEach(link=>{if(link.dataset.view===active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});}
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
function renderQuotes(){
 const rows=selectQuotes(quotes,{query:$('quote-search').value,author:$('quote-author').value,reverse:$('quote-order').value==='reverse'});
 $('quote-count').textContent=`${rows.length} of ${quotes.length} entries · ${new Set(quotes.map(q=>q.author)).size} authors`;
 $('quote-rows').replaceChildren(...rows.map(quote=>{const tr=document.createElement('tr');const order=text('td',String(quote.order).padStart(3,'0'),'number'),author=text('td',quote.author),topics=document.createElement('td'),words=text('td',String(quote.wordCount),'numeric'),source=document.createElement('td');author.title=quote.attribution;for(const topic of quote.topics)topics.append(text('span',topic,'topic-word'));source.append(original(quote,'Open source'));tr.append(order,author,topics,words,source);return tr;}));
 $('quote-empty').hidden=rows.length>0;
 const params=new URLSearchParams(location.search);for(const key of ['quote','author','quoteOrder'])params.delete(key);if($('quote-search').value)params.set('quote',$('quote-search').value);if($('quote-author').value)params.set('author',$('quote-author').value);if($('quote-order').value==='reverse')params.set('quoteOrder','reverse');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);
}
function renderResources(){const query=$('resource-search').value.toLocaleLowerCase();const rows=resources.filter(r=>(r.title+' '+r.category+' '+r.url).toLocaleLowerCase().includes(query));$('resource-list').replaceChildren(...rows.map(resource=>{const card=document.createElement('article');card.append(text('span',resource.category,'eyebrow'),original(resource));if(resource.error)card.append(text('small','Last known link · metadata refresh unavailable'));return card;}));if(!rows.length)$('resource-list').append(text('p','No matching pages. Try another topic.'));}
$('quote-search').oninput=renderQuotes;$('quote-author').onchange=renderQuotes;$('quote-order').onchange=renderQuotes;$('resource-search').oninput=renderResources;
try{
 const [catalog,collections]=await Promise.all(['/catalog.json','/collections.json'].map(async path=>{const r=await fetch(path,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Index unavailable');return r.json();}));
 stats(catalog.essays);quotes=collections.quotes;resources=collections.resources;
 for(const author of [...new Set(quotes.map(q=>q.author))].sort((a,b)=>a.localeCompare(b))){const option=text('option',author);option.value=author;$('quote-author').append(option);}
 const params=new URLSearchParams(location.search);$('quote-search').value=(params.get('quote')||'').slice(0,200);$('quote-author').value=params.get('author')||'';$('quote-order').value=params.get('quoteOrder')==='reverse'?'reverse':'source';renderQuotes();renderResources();
}catch{$('collections-error').hidden=false;}
