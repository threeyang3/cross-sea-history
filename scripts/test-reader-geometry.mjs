import assert from 'node:assert/strict';
import test from 'node:test';
import { readingPosition, readingTarget } from '../app/reader-geometry.mjs';

const sections=[{id:'overview',top:90},{id:'visual',top:340},{id:'section-1',top:620},{id:'practice',top:1020}];
const position=(scrollTop,marker=100)=>readingPosition({scrollTop,scrollHeight:1600,clientHeight:600,marker,sections});
test('start of a long article',()=>assert.deepEqual(position(0),{activeId:'overview',progress:0}));
test('choose last heading before sticky toolbar marker',()=>assert.deepEqual(position(500,650),{activeId:'section-1',progress:50}));
test('bottom of reader reaches last section',()=>assert.deepEqual(position(999),{activeId:'practice',progress:100}));
test('rubber-band overscroll is clamped',()=>{assert.equal(position(-40).progress,0);assert.equal(position(1200).progress,100)});
test('short or loading article does not claim completion',()=>assert.deepEqual(readingPosition({scrollTop:0,scrollHeight:200,clientHeight:500,marker:100,sections:[]}),{activeId:'overview',progress:0}));
test('heading jump accounts for dialog and toolbar offsets',()=>assert.equal(readingTarget({scrollTop:200,targetTop:400,scrollerTop:20,toolbarHeight:70,scrollHeight:2000,clientHeight:600}),498));
test('jump to beginning and end remains inside scroll container',()=>{const common={scrollTop:100,scrollerTop:20,toolbarHeight:70,scrollHeight:1000,clientHeight:500};assert.equal(readingTarget({...common,targetTop:-200}),0);assert.equal(readingTarget({...common,targetTop:1500}),500)});
