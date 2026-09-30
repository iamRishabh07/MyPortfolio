import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {resolve,extname,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {securityHeaders} from '../security-policy.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||3001);
const allowedFiles=new Set(['index.html','styles.css','app.js','profile.js','terminal.js','security.js']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  for(const [key,value] of Object.entries(securityHeaders))res.setHeader(key,value);
  res.setHeader('Cache-Control','no-store');
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.writeHead(405).end('Method not allowed');return}
  if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host||'')){res.writeHead(403).end('Forbidden');return}
  try{
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';
    const parts=path.split('/');
    const asset=path.startsWith('assets/')&&parts.every(part=>part&&!part.startsWith('.')&&!part.includes('\\'))&&Object.hasOwn(types,extname(path));
    if(!allowedFiles.has(path)&&!asset){res.writeHead(404).end('Not found');return}
    const target=await realpath(resolve(root,path));
    if(!target.startsWith(root+sep)||!(await stat(target)).isFile()){res.writeHead(404).end('Not found');return}
    res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream'});
    res.end(req.method==='HEAD'?undefined:await readFile(target));
  }catch{res.writeHead(404).end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log(`Portfolio: http://localhost:${port}`));
