import type { Pair } from './content-types';

export type ArticleSection = {
  id: string;
  title: Pair;
  paragraphs: Pair[];
  sourceIds: string[];
};

export type EventArticle = {
  thesis: Pair;
  sections: ArticleSection[];
  evidence: { title: Pair; sourceIds: string[]; reading: Pair; limits: Pair }[];
  discussion: { title: Pair; body: Pair };
  terms: { term: Pair; definition: Pair }[];
};

export type ArticleMeta = {
  zhCharacters: number;
  jaCharacters: number;
  minutes: number;
  reviewedAt: string;
};
