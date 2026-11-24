"use client";
import { ArrowUpRight, BookOpen } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import type { HistoricalEvent } from './timeline-types';
import { historicalEvents } from './timeline-data';
import { Bilingual, choose } from './learning-ui';

export function ReadingShelf({ ids, title, description, lang, onOpen }: {
  ids: string[];
  title: Pair;
  description: Pair;
  lang: Lang;
  onOpen: (event: HistoricalEvent) => void;
}) {
  const events = ids.map(id => historicalEvents.find(event => event.id === id)).filter((event): event is HistoricalEvent => !!event);
  if (!events.length) return null;
  return <section className="reading-shelf">
    <header><div><h2><Bilingual value={title} lang={lang} /></h2><p><Bilingual value={description} lang={lang} /></p></div><BookOpen size={25} /></header>
    <div className="reading-shelf-grid">{events.map(event => <button key={event.id} onClick={() => onOpen(event)}><span>{choose(event.date, lang)}</span><h3>{choose(event.title, lang)}</h3><p>{choose(event.question, lang)}</p><small>{lang === 'ja' ? '本文・史料の読み方・出典' : '专题正文 · 史料辨析 · 参考资料'}<ArrowUpRight size={15} /></small></button>)}</div>
  </section>;
}
