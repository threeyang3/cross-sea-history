import { build } from 'vite';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { renderCityAtlas } from '../app/city-atlas/html.mjs';
const root=new URL('../',import.meta.url);
const base=process.env.PAGES_BASE_PATH??'/cross-sea-history/';
if(!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(base)||base.includes('..'))throw new Error('Invalid PAGES_BASE_PATH');
const read=path=>readFile(new URL(path,root),'utf8');
const json=async path=>JSON.parse(await read(path));
await build({configFile:fileURLToPath(new URL('vite.pages.config.ts',root))});
const [atlasData,siteLinks,timeline,atlasScript,atlasStyles]=await Promise.all([
 json('app/city-atlas/data.json'),json('app/city-atlas-links.json'),json('app/data/timeline.json'),
 read('app/city-atlas/atlas.js'),read('app/city-atlas/atlas.css'),
]);
await mkdir(new URL('dist-pages/city-atlas/',root),{recursive:true});
await writeFile(new URL('dist-pages/city-atlas/index.html',root),renderCityAtlas({atlasData,siteLinks,timeline,atlasScript,atlasStyles,base}));
await writeFile(new URL('dist-pages/.nojekyll',root),'');
const manifest=await json('app/data/article-manifest.json');
await Promise.all(Object.keys(manifest).map(id=>access(new URL('dist-pages/readings/'+encodeURIComponent(id)+'.json',root))));
const catalog=await json('app/data/catalog.json');
const local=await json('app/data/museum-local.json');
await Promise.all([...catalog.assets.map(asset=>asset.src),...Object.values(local).map(asset=>asset.src)].map(src=>access(new URL('dist-pages'+src,root))));
console.log('Static Pages build ready:',base,Object.keys(manifest).length,'readings,',catalog.assets.length+Object.keys(local).length,'local images.');
