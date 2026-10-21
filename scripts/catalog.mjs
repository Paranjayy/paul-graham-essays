import { readFile, writeFile, rename } from 'node:fs/promises';
import { fetchIndex } from '../lib/feed.mjs';
import { fetchMetadata } from '../lib/metadata.mjs';
const args=process.argv.slice(2);
const option=(name,fallback)=>{const n=args.indexOf(name);return n<0?fallback:Number(args[n+1]);};
const limit=option('--limit',250),workers=option('--workers',2),refresh=args.includes('--refresh');
if(!Number.isInteger(limit)||limit<1||limit>300||!Number.isInteger(workers)||workers<1||workers>4)throw Error('Use --limit 1..300 and --workers 1..4');
const file=new URL('../data/metadata.json',import.meta.url);
let metadata={};
try{metadata=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const source=await fetchIndex();
const pending=source.essays.filter(x=>refresh||!metadata[x.url]||metadata[x.url].extractorVersion!==2||metadata[x.url].error||Date.now()-Date.parse(metadata[x.url].checkedAt)>30*86400000).slice(0,limit);
let cursor=0,done=0,stopping=false;
process.on('SIGINT',()=>{stopping=true;console.log('Stopping after active requests. Metadata will be kept.');});
await Promise.all(Array.from({length:workers},async()=>{
 while(!stopping&&cursor<pending.length){
  const essay=pending[cursor++];
  try{metadata[essay.url]={...await fetchMetadata(essay.url),checkedAt:new Date().toISOString()};}
  catch(error){metadata[essay.url]={...metadata[essay.url],error:String(error.message),lastAttemptAt:new Date().toISOString()};}
  done++;if(done%20===0||done===pending.length)console.log(`Metadata ${done}/${pending.length}`);
  await new Promise(r=>setTimeout(r,350));
 }
}));
async function atomic(url,data){const tmp=new URL(url.href+'.tmp');await writeFile(tmp,JSON.stringify(data,null,2)+'\n');await rename(tmp,url);}
await atomic(file,metadata);
const essays=source.essays.map((essay,index)=>({order:index+1,...essay,published:null,datePrecision:null,dateLabel:null,wordCount:null,readingMinutes:null,format:new URL(essay.url).pathname.endsWith('.txt')?'text chapter':'essay',...metadata[essay.url]}));
const catalog={source:'https://www.paulgraham.com/articles.html',checkedAt:source.checkedAt,metadataPolicy:'Dates as supplied in essay headers. Approximate body word counts include footnotes. Reading time at 225 words/minute.',essays};
await atomic(new URL('../public/catalog.json',import.meta.url),catalog);
await atomic(new URL('../data/last-good.json',import.meta.url),source);
const errors=essays.filter(x=>x.error).length;
console.log(`Catalog: ${essays.length} entries, ${essays.filter(x=>x.wordCount!==null).length} counts, ${essays.filter(x=>x.published).length} dates, ${errors} fetch errors.`);
if(stopping)process.exitCode=130;
