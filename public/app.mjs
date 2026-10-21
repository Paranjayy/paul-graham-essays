import {selectEssays,readView} from './catalog-tools.mjs';
const $=id=>document.getElementById(id),format=new Intl.NumberFormat('en');
let essays=[],view=readView(new URLSearchParams(location.search));
function render({updateUrl=true}={}) {
 const items=selectEssays(essays,view);
 $('essays').replaceChildren(...items.map(item=>{
  const tr=document.createElement('tr');
  const cell=(text,cls='')=>{const td=document.createElement('td');td.textContent=text;td.className=cls;tr.append(td);return td;};
  cell(String(item.order).padStart(3,'0'),'number');
  const title=cell('');const link=document.createElement('a');link.href=item.url;link.textContent=item.title;
  const arrow=document.createElement('span');arrow.textContent='↗';arrow.className='external-arrow';arrow.setAttribute('aria-hidden','true');link.append(arrow);title.append(link);
  if(item.format==='text chapter'){const tag=document.createElement('span');tag.textContent='Text chapter';tag.className='tag';link.append(tag);}
  const date=cell(item.dateLabel||'Unavailable',item.published?'':'unknown');
  if(item.published){const time=document.createElement('time');time.dateTime=item.published;time.textContent=item.dateLabel;date.replaceChildren(time);}
  if(item.error)date.title='Metadata refresh failed. Previous values are kept.';
  cell(item.wordCount===null?'—':format.format(item.wordCount),'numeric'+(item.wordCount===null?' unknown':''));
  cell(item.readingMinutes===null?'—':`${item.readingMinutes} min`,'numeric');
  return tr;
 }));
 $('results').textContent=`${format.format(items.length)} of ${format.format(essays.length)} entries`;
 $('empty').hidden=items.length>0;
 document.querySelectorAll('[data-sort]').forEach(button=>{
  const active=button.dataset.sort===view.sort;
  button.closest('th').removeAttribute('aria-sort');
  if(active)button.closest('th').setAttribute('aria-sort',view.direction==='asc'?'ascending':'descending');
  button.querySelector('span').textContent=active?(view.direction==='asc'?'↑':'↓'):'↕';
 });
 if(updateUrl){const params=new URLSearchParams(location.search);for(const key of ['q','year','length','sort','dir'])params.delete(key);if(view.query)params.set('q',view.query);if(view.year)params.set('year',view.year);if(view.length)params.set('length',view.length);if(view.sort!=='order')params.set('sort',view.sort);if(view.direction!=='asc')params.set('dir',view.direction);history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);}
}
function controls(){ $('search').value=view.query;$('year').value=view.year;$('length').value=view.length; }
function reset(){view=readView(new URLSearchParams());controls();render();$('search').focus();}
$('reset').onclick=reset;$('clear-empty').onclick=reset;
$('search').oninput=()=>{view.query=$('search').value;render();};
$('year').onchange=()=>{view.year=$('year').value;render();};
$('length').onchange=()=>{view.length=$('length').value;render();};
document.querySelectorAll('[data-sort]').forEach(button=>button.onclick=()=>{const key=button.dataset.sort;view.direction=view.sort===key?(view.direction==='asc'?'desc':'asc'):['published','wordCount','readingMinutes'].includes(key)?'desc':'asc';view.sort=key;render();});
window.addEventListener('popstate',()=>{view=readView(new URLSearchParams(location.search));controls();render({updateUrl:false});});
$('copy-feed').onclick=async()=>{try{await navigator.clipboard.writeText(new URL('/feed.xml',location.href).href);$('copy-feed').textContent='Copied RSS link';}catch{$('results').textContent=new URL('/feed.xml',location.href).href;}};
async function load(){
 $('error').hidden=true;$('source-status').textContent='Loading index…';
 try{
  const response=await fetch('/catalog.json',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Unavailable');
  const data=await response.json();if(!Array.isArray(data.essays)||data.essays.length<20)throw Error('Invalid catalog');
  essays=data.essays;
  for(const year of [...new Set(essays.map(x=>x.published?.slice(0,4)).filter(Boolean))].sort().reverse()){const option=document.createElement('option');option.value=year;option.textContent=year;$('year').append(option);}
  $('total').textContent=format.format(essays.length);
  $('source-status').textContent='Index checked '+new Date(data.checkedAt).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'});
  controls();render({updateUrl:false});
 }catch{$('error').hidden=false;$('source-status').textContent='Index unavailable';$('results').textContent='Unable to load essays';}
}
$('retry').onclick=load;
void load();
