'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'public');
const allowed=new Map([['/','index.html'],['/index.html','index.html'],['/active.html','active.html'],['/relaxed.html','relaxed.html']]);
http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const file=allowed.get(pathname);if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}if(!file){res.writeHead(404,{'Content-Type':'text/plain;charset=utf-8'});res.end('Not found');return;}const body=fs.readFileSync(path.join(root,file));res.writeHead(200,{'Content-Type':'text/html;charset=utf-8','Content-Length':body.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:body);}).listen(8787,'127.0.0.1',()=>console.log('Travel pages served at http://127.0.0.1:8787 — only three allowlisted HTML pages are public.'));
