import type { Lang } from './content-types';

export function cityAtlasPath(lang: Lang, route = '') {
  const language = lang === 'bi' ? 'dual' : lang;
  return `/city-atlas?lang=${language}${route ? '#' + route : ''}`;
}
