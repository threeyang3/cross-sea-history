import type { Lang } from './content-types';
import { siteBase, sitePath } from './site-path';

export function cityAtlasPath(lang: Lang, route = '') {
  const language = lang === 'bi' ? 'dual' : lang;
  return sitePath(`/city-atlas${siteBase?'/':''}?lang=${language}${route ? '#' + route : ''}`);
}
