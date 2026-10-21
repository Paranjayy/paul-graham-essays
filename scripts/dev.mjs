import http from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from '../api/feed.mjs';
const assets=new Map([['/','index.html'],['/index.html','index.html'],['/style.css','style.css'],['/app.mjs','app.mjs'],['/catalog-tools.mjs','catalog-tools.mjs'],['/catalog.json','catalog.json'],['/extras.mjs','extras.mjs'],['/collection-tools.mjs','collection-tools.mjs'],['/collections.json','collections.json'],['/quotes.xml','quotes.xml']]);
const feeds=new Map([['/feed.xml','/api/feed'],['/rss.xml','/api/feed'],['/feed.json','/api/feed?format=json'],['/status.json','/api/feed?format=status']]);
http.createServer(async(req,res)=>{
 res.status=code=>{res.statusCode=code;return res;};
 try{
  const pathname=new URL(req.url,'http://localhost:3002').pathname;
  if(feeds.has(pathname)){req.url=feeds.get(pathname);return handler(req,res);}
  if(pathname==='/api/feed')return handler(req,res);
  const name=assets.get(pathname);
  if(!name){res.statusCode=404;return res.end('Not found');}
  res.setHeader('Content-Type',name.endsWith('.mjs')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':name.endsWith('.json')?'application/json; charset=utf-8':name.endsWith('.xml')?'application/rss+xml; charset=utf-8':'text/html; charset=utf-8');
  res.end(await readFile(new URL('../public/'+name,import.meta.url)));
 }catch{res.statusCode=500;res.end('Temporarily unavailable');}
}).listen(3002,'0.0.0.0',()=>console.log('Paul Graham Essays: http://localhost:3002'));
