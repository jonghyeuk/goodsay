import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LETTERS,REFLECTIONS} from '../data.js';
import {koreaDay,dailyLetter,reflectionType,sanitizeState,readState,writeState,publicShareUrl,escapeHTML,toggleSaved} from '../core.js';
test('daily editorial changes at Korean midnight and is stable throughout one day',()=>{
 const before=new Date('2026-11-18T14:59:59Z'),after=new Date('2026-11-18T15:00:00Z');
 assert.equal(koreaDay(before),'2026-11-18');assert.equal(koreaDay(after),'2026-11-19');assert.notEqual(dailyLetter(LETTERS,before).id,dailyLetter(LETTERS,after).id);
 assert.equal(dailyLetter(LETTERS,after).id,dailyLetter(LETTERS,new Date('2026-11-19T14:00:00Z')).id);
});
test('all answer combinations produce one supported reflection without using birth details',()=>{
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++)for(let d=0;d<4;d++)assert.ok(REFLECTIONS[reflectionType([a,b,c,d])]);
 for(const invalid of [null,[],[0,1,2],[0,1,2,null],[0,1,2,4],[0,1,2,'1']])assert.throws(()=>reflectionType(invalid));
});
test('stored data is allowlisted and strips raw answers and personal identifiers',()=>{
 assert.deepEqual(sanitizeState({saved:['letter-1','letter-1','evil'],reflection:{type:'warm',name:'Private',phone:'01012345678',answers:[1,1,1,1]},token:'secret'},['letter-1']),{saved:['letter-1'],reflection:{type:'warm'}});
 assert.deepEqual(sanitizeState({saved:'bad',reflection:{type:'unknown'}},[]),{saved:[],reflection:null});
});
test('corrupt or unavailable storage does not break reading',()=>{
 assert.deepEqual(readState({getItem:()=>'{bad'},[]),{saved:[],reflection:null});
 assert.deepEqual(readState({getItem:()=>{throw Error('blocked')}},[]),{saved:[],reflection:null});
 assert.equal(writeState({setItem:()=>{throw Error('full')}},{saved:[]}),false);
});
test('shared URL strips personal query strings and only carries public letter IDs',()=>{
 assert.equal(publicShareUrl('https://example.com/goodsay/?phone=secret&token=secret#private','letter-2'),'https://example.com/goodsay/#read/letter-2');
 assert.equal(publicShareUrl('https://example.com/?token=secret','private-order-token'),'https://example.com/#home');
});
test('rendered user text is escaped and bookmarking is reversible',()=>{
 assert.equal(escapeHTML('<img onerror="alert(1)">'), '&lt;img onerror=&quot;alert(1)&quot;&gt;');
 assert.deepEqual(toggleSaved(toggleSaved([],'letter-1'),'letter-1'),[]);
});
