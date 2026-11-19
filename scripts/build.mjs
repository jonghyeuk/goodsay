import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of ['index.html','styles.css','app.js','core.js','data.js','manifest.webmanifest','assets','robots.txt'])await cp(path.join(root,name),path.join(out,name),{recursive:true});
const html=await readFile(path.join(out,'index.html'),'utf8');
if(process.env.SITE_URL){const url=new URL(process.env.SITE_URL);if(!['http:','https:'].includes(url.protocol))throw new Error('SITE_URL must use http or https');url.search='';url.hash='';const safe=url.href.replaceAll('&','&amp;').replaceAll('"','&quot;');await writeFile(path.join(out,'index.html'),html.replace('</head>',`<link rel="canonical" href="${safe}"><meta property="og:url" content="${safe}"></head>`));}
await writeFile(path.join(out,'.nojekyll'),'');
console.log('Built dist/: static assets, local photographs, and browser modules.');
