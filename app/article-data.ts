import manifest from './data/article-manifest.json';
import sourceData from './data/article-sources.json';
import type { Source } from './content-types';
import type { ArticleMeta, EventArticle } from './article-types';

export const articleManifest = manifest as Record<string, ArticleMeta>;
export const articleSources = sourceData as Source[];
const loadedArticles = new Map<string, EventArticle>();

export async function loadEventArticle(id: string): Promise<EventArticle> {
  const cached = loadedArticles.get(id);
  if (cached) return cached;
  if (!articleManifest[id]) throw new Error('Unknown reading');
  const response = await fetch(`/readings/${encodeURIComponent(id)}.json`, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Reading unavailable (${response.status})`);
  const article = await response.json() as EventArticle;
  loadedArticles.set(id, article);
  return article;
}
