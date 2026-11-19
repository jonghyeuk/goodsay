import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.txt':'text/plain; charset=utf-8'};
const publicFiles=new Set(['/index.html','/styles.css','/app.js','/core.js','/data.js','/manifest.webmanifest','/robots.txt']);
export function createAppServer(){return createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/api/status'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({payments:false,contactVerification:false,personalReports:false,guestRecovery:false}));return;}
    if(pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({code:'SERVICE_NOT_CONFIGURED',message:'결제·인증·개인 해설 서비스가 연결되지 않았습니다.'}));req.resume();return;}
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
    const target=pathname==='/'?'/index.html':pathname;
    if(!publicFiles.has(target)&&!/^\/assets\/[a-z0-9-]+\.(jpg|svg)$/.test(target)){res.writeHead(404);res.end('Not found');return;}
    const full=path.join(root,target);const file=await stat(full);if(!file.isFile())throw new Error('not file');
    const data=await readFile(full);res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('Not found');}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||5173);createAppServer().listen(port,'0.0.0.0',()=>console.log(`Goodsay running on port ${port}`));
}
