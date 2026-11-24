import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import ts from 'typescript';

const read = (file) => readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const records = json('app/data/museum-images.json');
const links = json('app/data/museum-links.json');
const cached = json('app/data/museum-local.json');
const events = new Set(json('app/data/timeline.json').events.map(event => event.id));
const poems = new Set();
for (const file of readdirSync('app/poetry').filter(f=>f.endsWith('.ts') && f !== 'types.ts' && f !== 'data.ts')) {
 for (const match of read('app/poetry/'+file).matchAll(/\bid:\s*["']([^"']+)["']/g)) poems.add(match[1]);
}
const known = new Set();
for (const record of records) {
 assert(!known.has(record.id), 'duplicate asset '+record.id); known.add(record.id);
 assert(/^met-[a-z0-9-]+$/.test(record.id));
 for (const field of ['title','caption','alt']) for(const lang of ['zh','ja']) assert(record[field]?.[lang]?.trim(), record.id+' missing '+field+'.'+lang);
 assert(record.accession && record.objectId > 0 && record.width > 0 && record.height > 0);
 assert(record.sourcePage === 'https://www.metmuseum.org/art/collection/search/'+record.objectId);
 assert(record.originalFileURL.startsWith('https://collectionapi.metmuseum.org/api/collection/v1/iiif/'+record.objectId+'/'));
 assert(record.license === 'CC0 / Public Domain' && record.verifiedAt);
 assert(record.localFile === '/images/museum/'+record.id+'.webp');
}
for (const [group, mapping] of Object.entries(links)) for (const [id, assets] of Object.entries(mapping)) {
 assert(group==='poems'?poems.has(id):group==='events'?events.has(id):['tang','ming'].includes(id),'unknown '+group+' id: '+id);
 assert(new Set(assets).size===assets.length && assets.length>0,'empty or duplicate association '+id);
 for(const asset of assets) assert(known.has(asset),'unknown asset: '+asset);
}
for(const [id,entry] of Object.entries(cached)){
 assert(known.has(id) && entry.src === '/images/museum/'+id+'.webp');
 assert(entry.width>0&&entry.height>0);
 const file=path.join('public',entry.src.replace(/^\//,''));
 assert(existsSync(file),'missing local asset '+id);
 assert(createHash('sha256').update(readFileSync(file)).digest('hex')===entry.sha256,'checksum mismatch '+id);
}
for(const match of read('app/home-hub.tsx').matchAll(/image:\s*'(met-[^']+)'/g))assert(known.has(match[1]),'unknown gallery image '+match[1]);
for(const file of ['app/home-hub.css','app/timeline.css'])assert(!/\.(?:site-header|header-inner|brand-seal|header-tools|languages|nav-menu|nav-group)\b/.test(read(file)),file+' should not override global navigation');
const scan=(folder)=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?scan(path.join(folder,entry.name)):[path.join(folder,entry.name)]);
let parsed=0;
for(const file of scan('app').filter(file=>/\.tsx?$/.test(file)&&!file.endsWith('.d.ts'))){
 const tree=ts.createSourceFile(file,read(file),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(tree.parseDiagnostics.length,0, file+': '+tree.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('; ')); parsed++;
}
console.log(`UI checks passed: ${records.length} museum records, ${Object.keys(links.poems).length} poems, ${Object.keys(links.events).length} events, ${Object.keys(cached).length} local museum assets, ${parsed} TypeScript files parsed.`);
if(Object.keys(cached).length < records.length)console.warn('Some museum artwork is still remote-only; localize with scripts/import-museum-images.py before offline deployment.');
