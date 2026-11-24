import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const base=process.env.PAGES_BASE_PATH??'/cross-sea-history/';
if(!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(base)||base.includes('..'))throw new Error('Invalid PAGES_BASE_PATH (use /repository/ or /)');
export default defineConfig({
 root:fileURLToPath(new URL('./pages/',import.meta.url)),
 base,
 publicDir:fileURLToPath(new URL('./public/',import.meta.url)),
 plugins:[react()],
 define:{__CROSS_SEA_PAGES_BASE__:JSON.stringify(base)},
 build:{outDir:fileURLToPath(new URL('./dist-pages/',import.meta.url)),emptyOutDir:true},
});
