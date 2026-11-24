// Sites runs at the origin root. The separate static Pages build defines this
// constant at compile time, so both targets share the same UI and data files.
declare const __CROSS_SEA_PAGES_BASE__: string | undefined;
export const siteBase=typeof __CROSS_SEA_PAGES_BASE__==='string'?__CROSS_SEA_PAGES_BASE__.replace(/\/$/,''):'';
export function sitePath(path:string){
 return path.startsWith('/')&&!path.startsWith('//')?siteBase+path:path;
}
