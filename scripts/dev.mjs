import http from 'node:http';
import { readFile } from 'node:fs/promises';
import handler from '../api/feed.mjs';
http.createServer(async(req,res)=>{
  res.status = code => { res.statusCode=code; return res; };
  if (/^\/(feed.xml|rss.xml|feed.json|status.json|api\/feed)/.test(req.url)) {
    if(req.url.startsWith('/feed.json')) req.url='/api/feed?format=json';
    if(req.url.startsWith('/status.json')) req.url='/api/feed?format=status';
    return handler(req,res);
  }
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(await readFile(new URL('../public/index.html',import.meta.url)));
}).listen(3002,'0.0.0.0',()=>console.log('PG Essays Feed: http://localhost:3002'));
