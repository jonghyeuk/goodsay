import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAppServer} from '../scripts/serve.mjs';
test('server serves the app and fails closed for unconfigured payment or recovery',async()=>{
 const app=createAppServer();await new Promise(r=>app.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.address().port}`;
 try{
  assert.equal((await fetch(base+'/')).status,200);
  const status=await(await fetch(base+'/api/status')).json();assert.equal(status.payments,false);assert.equal(status.guestRecovery,false);
  for(const endpoint of ['/api/checkout','/api/orders/restore']){const res=await fetch(base+endpoint,{method:'POST',body:'{"phone":"not-collected"}'});assert.equal(res.status,503);assert.equal((await res.json()).code,'SERVICE_NOT_CONFIGURED');}
  for(const url of ['/.git/config','/README.md','/package.json','/docs/production.md'])assert.equal((await fetch(base+url)).status,404);
  assert.equal((await fetch(base+'/app.js',{method:'POST'})).status,405);
  assert.match((await fetch(base+'/styles.css')).headers.get('content-type'),/text\/css/);
 }finally{await new Promise(r=>app.close(r));}
});
