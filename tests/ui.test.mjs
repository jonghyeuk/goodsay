import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';

test('client flows work without registration, payments, or disclosing private data',async t=>{
 const window=new Window({url:'https://goodsay.test/?phone=SECRET',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false}});
 window.document.write(await readFile(new URL('../index.html',import.meta.url),'utf8'));
 window.scrollTo=()=>{};
 if(!window.HTMLDialogElement.prototype.showModal)window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 if(!window.HTMLDialogElement.prototype.close)window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
 const drawText=[];
 window.HTMLCanvasElement.prototype.getContext=()=>({fillRect(){},strokeRect(){},save(){},restore(){},translate(){},rotate(){},beginPath(){},ellipse(){},stroke(){},arc(){},fill(){},moveTo(){},lineTo(){},fillText(text){drawText.push(text);},measureText(text){return{width:[...text].length*35};}});
 for(const [name,value]of Object.entries({window,document:window.document,location:window.location,navigator:window.navigator,localStorage:window.localStorage}))Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});
 await import('../app.js');
 const $=s=>document.querySelector(s);
 const click=s=>{const element=$(s);assert.ok(element,`Element exists: ${s}`);element.click();};
 const route=async hash=>{window.location.hash=hash;window.dispatchEvent(new window.HashChangeEvent('hashchange'));await new Promise(r=>setTimeout(r,10));};
 try{
  await t.test('home includes original content and a bookmark really persists',()=>{
   assert.match($('#main').textContent,/당신의 오늘에/);click('[data-action="save"]');assert.equal($('#save-count').textContent,'1');assert.ok(JSON.parse(localStorage.getItem('goodsay.v1')).saved.length===1);
  });
  await t.test('library filter and search update matching results',async()=>{
   await route('#letters');assert.equal(document.querySelectorAll('.letter-card').length,24);
   click('[data-filter="관계"]');assert.equal(document.querySelectorAll('.letter-card').length,6);
   $('#letter-search').value='고마움';$('#letter-search').dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(document.querySelectorAll('.letter-card').length,1);
   $('#letter-search').value='전혀없는검색어';$('#letter-search').dispatchEvent(new window.Event('input',{bubbles:true}));assert.match($('#library-grid').textContent,/찾지 못했나요/);
   click('[data-action="search-reset"]');assert.equal(document.querySelectorAll('.letter-card').length,24);
  });
  await t.test('quiz requires each answer and only saves a type after consent',async()=>{
   await route('#home');
   click('[data-action="quiz-start"]');click('[data-action="quiz-next"]');assert.match($('#quiz-error').textContent,/하나 골라주세요/);
   for(let step=0;step<4;step++){click('[data-action="answer"][data-value="0"]');if(step===3){$('#remember-result').checked=true;$('#remember-result').dispatchEvent(new window.Event('change',{bubbles:true}));}click('[data-action="quiz-next"]');}
   assert.match($('#dialog').textContent,/천천히, 깊이/);const stored=JSON.parse(localStorage.getItem('goodsay.v1'));assert.deepEqual(stored.reflection,{type:'quiet'});assert.ok(!JSON.stringify(stored).includes('answers'));
  });
  await t.test('share preview only contains public text',()=>{
   click('[data-action="share-result"]');assert.ok($('#share-canvas'));assert.ok(drawText.some(x=>x.includes('천천히')));assert.ok(!drawText.join(' ').includes('SECRET'));
  });
  await t.test('same-page sample link closes modal, and real checkout stays unavailable',async()=>{
   await route('#sample');click('[data-action="quiz-start"]');for(let i=0;i<4;i++){click('[data-action="answer"][data-value="1"]');click('[data-action="quiz-next"]');}
   assert.equal($('#dialog').open,true);click('#dialog a[href="#sample"]');assert.equal($('#dialog').open,false);
   await route('#report');click('[data-action="checkout"]');assert.match($('#dialog').textContent,/현재 실제 결제/);assert.ok($('#dialog button[disabled]'));
   await route('#orders');assert.ok($('#restore-phone').disabled);assert.match($('#main').textContent,/연락처를 수집하지 않습니다/);
  });
  await t.test('saved content can be reread and cleared without creating a purchase',async()=>{
   await route('#saved');assert.equal(document.querySelectorAll('.letter-card').length,1);click('[data-action="saved-result"]');assert.match($('#dialog').textContent,/천천히, 깊이/);click('[data-action="close"]');
   click('[data-action="clear-confirm"]');click('[data-action="clear-state"]');assert.equal($('#save-count').textContent,'0');assert.deepEqual(JSON.parse(localStorage.getItem('goodsay.v1')),{saved:[],reflection:null});
  });
  await t.test('unknown article IDs give a useful recovery page',async()=>{
   await route('#read/unknown');assert.match($('#main').textContent,/찾을 수 없어요/);assert.ok($('#main a[href="#home"]'));
  });
 }finally{await window.happyDOM.abort();window.close();}
});
