export function selectEssays(essays, {query='',year='',length='',sort='order',direction='asc'}={}) {
 const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const filtered=essays.filter(item=>{
  const haystack=`${item.title} ${item.dateLabel||''} ${item.url}`.toLocaleLowerCase();
  if(!terms.every(term=>haystack.includes(term)))return false;
  if(year==='unknown'&&item.published)return false;
  if(year&&year!=='unknown'&&!item.published?.startsWith(year+'-'))return false;
  if(length==='short'&&!(item.wordCount!==null&&item.wordCount<1500))return false;
  if(length==='medium'&&!(item.wordCount>=1500&&item.wordCount<4000))return false;
  if(length==='long'&&!(item.wordCount>=4000))return false;
  return true;
 });
 return filtered.sort((a,b)=>{
  const av=a[sort],bv=b[sort];
  const missingA=av===null||av===undefined,missingB=bv===null||bv===undefined;
  if(missingA!==missingB)return missingA?1:-1;
  const comparison=typeof av==='string'?av.localeCompare(bv||'', 'en', {numeric:true,sensitivity:'base'}):(av??0)-(bv??0);
  return (direction==='desc'?-comparison:comparison)||a.order-b.order;
 });
}
export function readView(params) {
 return {query:(params.get('q')||'').slice(0,200),year:/^(19|20)\d{2}$|^unknown$/.test(params.get('year'))?params.get('year'):'',length:['short','medium','long'].includes(params.get('length'))?params.get('length'):'',sort:['order','title','published','wordCount','readingMinutes'].includes(params.get('sort'))?params.get('sort'):'order',direction:params.get('dir')==='desc'?'desc':'asc'};
}
