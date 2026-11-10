"use client";

import { useId, useMemo, type CSSProperties } from 'react';
import { Clock3, ArrowUpRight } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import { Bilingual, choose } from './learning-ui';
import { historicalEvents, yearCoordinate } from './timeline-data';
import type { HistoricalEvent, TimelineTrack } from './timeline-types';
import './event-era-context.css';

const trackLabels: Record<TimelineTrack, Pair> = {
  china: { zh: '中国史', ja: '中国史' },
  exchange: { zh: '中日交流', ja: '日中交流' },
};

// Interval distance selects chronological context; it makes no claim of a
// historical connection. The actual date labels retain each entry's precision.
function intervalGap(a: HistoricalEvent, b: HistoricalEvent) {
  return Math.max(
    0,
    yearCoordinate(a.start) - yearCoordinate(b.end ?? b.start),
    yearCoordinate(b.start) - yearCoordinate(a.end ?? a.start),
  );
}

function nearbyEntries(event: HistoricalEvent) {
  const maxGapYears = event.start < -1000 ? 500
    : event.start < 600 ? 150
    : event.start < 1368 ? 120
    : event.start < 1840 ? 100 : 40;
  const selected = new Map<string, HistoricalEvent>([[event.id, event]]);
  for (const track of ['china', 'exchange'] as const) {
    const candidates = historicalEvents
      .filter(item => item.track === track && item.id !== event.id && intervalGap(event, item) <= maxGapYears)
      .sort((a, b) => intervalGap(event, a) - intervalGap(event, b)
        || Math.abs(a.start - event.start) - Math.abs(b.start - event.start)
        || a.start - b.start || a.id.localeCompare(b.id));
    for (const item of candidates.slice(0, 2)) selected.set(item.id, item);
  }
  return [...selected.values()].sort((a, b) => a.start - b.start || a.id.localeCompare(b.id));
}

export function EventEraContext({ event, lang, onNavigate }: {
  event: HistoricalEvent;
  lang: Lang;
  onNavigate: (event: HistoricalEvent) => void;
}) {
  const titleId = useId();
  const noteId = useId();
  const nodes = useMemo(() => nearbyEntries(event), [event]);
  const pairText = (value: Pair) => lang === 'bi' ? `${value.zh} / ${value.ja}` : choose(value, lang);
  const tx = (zh: string, ja: string) => lang === 'ja' ? ja : zh;

  return <figure className="event-era-context" data-reading-section="era-context" aria-labelledby={titleId} aria-describedby={noteId}>
    <header className="era-context-heading">
      <div><Clock3 size={17} aria-hidden="true" /><h2 id={titleId} tabIndex={-1}><Bilingual value={{ zh: '把这一篇放回时代', ja: 'この記事を時代の中へ' }} lang={lang} /></h2></div>
      <span className="era-context-current-key"><i aria-hidden="true" />{tx('本篇', 'この記事')}</span>
    </header>
    <div className="era-context-scroll" role="group" aria-label={tx('可点选的双轨编年图', '選択できる二つの年表')}>
      <div className="era-context-chart" style={{ '--era-columns': nodes.length } as CSSProperties}>
        {(['china', 'exchange'] as const).map(track => {
          const hasEntries = nodes.some(item => item.track === track);
          return <div className={`era-context-track era-context-${track}`} key={track}>
            <div className="era-context-track-label"><i aria-hidden="true" /><Bilingual value={trackLabels[track]} lang={lang} /></div>
            <div className={`era-context-lane${hasEntries ? '' : ' is-empty'}`}>
              <span className="era-context-line" aria-hidden="true" />
              {hasEntries ? nodes.map(item => item.track === track ? <button
                type="button"
                key={item.id}
                className={`era-context-node${item.id === event.id ? ' is-current' : ''}`}
                aria-current={item.id === event.id ? 'page' : undefined}
                aria-label={`${pairText(trackLabels[track])} · ${pairText(item.date)} · ${pairText(item.title)}${item.id === event.id ? ` · ${tx('当前专题', '現在の記事')}` : ` · ${tx('打开专题与出处', '本文と出典を開く')}`}`}
                title={`${pairText(item.date)} · ${pairText(item.title)}`}
                onClick={() => onNavigate(item)}
              >
                <span className="era-context-marker" aria-hidden="true" />
                <span className="era-context-date"><Bilingual value={item.date} lang={lang} /></span>
                <strong className="era-context-title"><Bilingual value={item.title} lang={lang} /></strong>
                <span className="era-context-action">{item.id === event.id ? tx('正在阅读', '読んでいる記事') : <><span>{tx('展开', '読む')}</span><ArrowUpRight size={12} aria-hidden="true" /></>}</span>
              </button> : <span key={item.id} className="era-context-space" aria-hidden="true" />) : <p className="era-context-empty">{tx('这一年代附近暂无已收录条目', 'この年代の近くに収録済みの記事はありません')}</p>}
            </div>
          </div>;
        })}
      </div>
    </div>
    <figcaption id={noteId}>
      <Bilingual value={{ zh: '按前后年代选取；编年示意，间距不表示年数，并列不表示因果。', ja: '前後の年代から選択。間隔は年数を表さず、並置は因果関係を示しません。' }} lang={lang} />
      <span className="era-context-source-note"><Bilingual value={{ zh: '点击节点，查看各专题的正文与出处。', ja: '各項目から本文と出典を確認できます。' }} lang={lang} /></span>
    </figcaption>
  </figure>;
}
