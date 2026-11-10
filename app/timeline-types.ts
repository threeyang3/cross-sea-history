import type { Pair, Source } from './content-types';

export type TimelineTrack = 'exchange' | 'china';
export type TimelineCategory = 'politics' | 'culture' | 'religion' | 'technology' | 'economy' | 'conflict';
export type HistoricalEvent = {
  id: string;
  track: TimelineTrack;
  start: number;
  end?: number;
  date: Pair;
  title: Pair;
  summary: Pair;
  significance: Pair;
  question: Pair;
  category: TimelineCategory;
  location: Pair;
  featured: boolean;
  sourceIds: string[];
  precision: 'year' | 'range' | 'approx';
  imageId?: string;
  lessonId?: string;
};
export type TimelineData = { events: HistoricalEvent[]; sources: Source[]; reviewedAt: string };
export type TimelinePeriod = { id: string; title: Pair; start: number; end: number; note: Pair };

