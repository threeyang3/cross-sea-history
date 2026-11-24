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
const legacyVisuals = json('app/data/learning-visuals.json');
const newVisuals = json('app/data/learning-visuals-extra.json');
const sourceCatalog = new Map([...json('app/data/catalog.json').sources,...json('app/data/timeline.json').sources,...json('app/data/article-sources.json')].map(source=>[source.id,source]));
const visualIds = new Set();
const paired=(value)=>value && ['zh','ja'].every(lang=>typeof value[lang]==='string'&&value[lang].trim());
for(const visual of [...legacyVisuals,...newVisuals]){
 assert(visual.id && !visualIds.has(visual.id),'duplicate diagram '+visual.id);
 visualIds.add(visual.id);
 assert(visual.eventIds.length && visual.eventIds.every(id=>events.has(id)),'invalid diagram event '+visual.id);
 assert(['title','subtitle','caution'].every(field=>paired(visual[field])),'missing bilingual diagram metadata '+visual.id);
 assert(visual.nodes.length && new Set(visual.nodes.map(n=>n.id)).size===visual.nodes.length,'invalid diagram nodes '+visual.id);
 for(const node of visual.nodes){
  assert(paired(node.label)&&paired(node.detail)&&(!node.tag||paired(node.tag)),'missing node translation '+visual.id+'/'+node.id);
  assert(node.tone===undefined||Number.isInteger(node.tone)&&node.tone>=0&&node.tone<=3,'invalid node tone '+node.id);
 }
 for(const edge of visual.edges??[])assert(Number.isInteger(edge.from)&&Number.isInteger(edge.to)&&visual.nodes[edge.from]&&visual.nodes[edge.to]&&edge.from!==edge.to,'invalid diagram edge '+visual.id);
 assert(visual.sources.length && visual.sources.every(s=>paired(s.title)&&/^https?:\/\//.test(s.url)),'missing diagram sources '+visual.id);
}
for(const visual of newVisuals){
 assert(['network','process','matrix','geo-map','flow'].includes(visual.kind),'unknown new diagram kind '+visual.kind);
 assert(visual.sourceIds.length===visual.sources.length,'source mapping mismatch '+visual.id);
 visual.sourceIds.forEach((id,i)=>{assert(sourceCatalog.has(id),'unknown diagram source '+id);assert.equal(visual.sources[i].url,sourceCatalog.get(id).url)});
 const articleSourceIds = new Set();
 for(const id of visual.eventIds){
  const article=json('public/readings/'+id+'.json');
  for(const sourceId of [...article.sections.flatMap(s=>s.sourceIds),...article.evidence.flatMap(s=>s.sourceIds)])articleSourceIds.add(sourceId);
 }
 for(const sourceId of visual.sourceIds)assert(articleSourceIds.has(sourceId),'diagram source is not in linked readings: '+visual.id+'/'+sourceId);
 if(visual.kind==='geo-map'){
  assert(Array.isArray(visual.edges)&&visual.edges.every(edge=>edge.dashed===true),'geographic links must be dashed '+visual.id);
  assert(visual.nodes.every(n=>n.geo&&(!n.geo.anchor||['start','middle','end'].includes(n.geo.anchor))&&Number.isFinite(n.geo.lon)&&n.geo.lon>=116&&n.geo.lon<=143&&Number.isFinite(n.geo.lat)&&n.geo.lat>=23&&n.geo.lat<=40),'invalid map point '+visual.id);
 }
 if(visual.kind==='matrix'){
  const matrix=visual.matrix;
  assert(matrix?.columns.length===2&&matrix.columns.every(paired),'invalid comparison columns '+visual.id);
  assert(matrix.rows.length&&matrix.rows.every(row=>paired(row.label)&&row.cells.length===matrix.columns.length),'invalid matrix rows '+visual.id);
  const cells=matrix.rows.flatMap(row=>row.cells);
  assert(cells.length===visual.nodes.length&&new Set(cells).size===cells.length&&cells.every(index=>Number.isInteger(index)&&visual.nodes[index]),'invalid comparison cells '+visual.id);
 }
}
console.log('Diagram data checked: '+visualIds.size+' unique diagrams, '+new Set([...legacyVisuals,...newVisuals].flatMap(visual=>visual.eventIds)).size+' covered events.');
const scan=(folder)=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?scan(path.join(folder,entry.name)):[path.join(folder,entry.name)]);
let parsed=0;
for(const file of scan('app').filter(file=>/\.tsx?$/.test(file)&&!file.endsWith('.d.ts'))){
 const tree=ts.createSourceFile(file,read(file),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(tree.parseDiagnostics.length,0, file+': '+tree.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('; ')); parsed++;
}
console.log(`UI checks passed: ${records.length} museum records, ${Object.keys(links.poems).length} poems, ${Object.keys(links.events).length} events, ${Object.keys(cached).length} local museum assets, ${parsed} TypeScript files parsed.`);
const missingLocal=records.filter(record=>!cached[record.id]).map(record=>record.id);
if(missingLocal.length){
 console.warn('Remote-only museum artwork: '+missingLocal.join(', '));
 if(process.argv.includes('--require-local'))throw new Error('Release requires all registered museum images locally imported.');
}
