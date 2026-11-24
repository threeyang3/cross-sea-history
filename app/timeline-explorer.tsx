"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Compass, Expand, Filter, History, List, MapPin, Minus, MoveHorizontal, NotebookPen, Plus, Search, Star, X } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import { pair as p } from './content-types';
import { getAsset, getLesson } from './content';
import { Bilingual, choose, Credit, Dialog, Photo } from './learning-ui';
import { categoryInfo, categoryOrder, coordinateYear, formatYear, historicalEvents, timelinePeriods, timelineSources, yearCoordinate } from './timeline-data';
import { EventArticleReader } from './event-article-reader';
import type { HistoricalEvent, TimelineCategory, TimelineTrack } from './timeline-types';
import { useHorizontalDrag } from '../hooks/use-horizontal-drag';

type WindowRange = [number,number];
type EventCluster = { events:HistoricalEvent[]; category:TimelineCategory; x:number };
const intersects=(event:HistoricalEvent,range:WindowRange)=>yearCoordinate(event.start)<=range[1]&&yearCoordinate(event.end??event.start)>=range[0];
const eventSearchText=(e:HistoricalEvent)=>[e.title.zh,e.title.ja,e.summary.zh,e.summary.ja,e.location.zh,e.location.ja,e.date.zh,e.date.ja].join(' ').toLocaleLowerCase();

function fitRange(center:number,span:number,bounds:WindowRange):WindowRange {
 const length=Math.min(Math.max(span,12),bounds[1]-bounds[0]);
 const start=Math.max(bounds[0],Math.min(center-length/2,bounds[1]-length));
 return [start,start+length];
}
function tickYears(range:WindowRange,width:number){
 const span=range[1]-range[0];
 const needed=span/Math.max(3,Math.floor(width/95));
 const step=[1,2,5,10,20,25,50,100,200,250,500,1000,2000].find(v=>v>=needed)??5000;
 const first=coordinateYear(range[0]);const last=coordinateYear(range[1]);
 const ticks:number[]=[];
 for(let year=Math.ceil(first/step)*step;year<=last;year+=step){if(year!==0)ticks.push(year);else if(first<=1&&last>=1)ticks.push(1);}
 return ticks;
}

function EventReferences({event,lang}:{event:HistoricalEvent;lang:Lang}){
 const t=(v:Pair)=>choose(v,lang);
 return <div className="event-references"><span className="eyebrow">{lang==='ja'?'出典を確かめる':'核对参考依据'}</span>{event.sourceIds.map((id,index)=>{
  const source=timelineSources.find(s=>s.id===id);if(!source)return null;
  return <a href={source.url} target="_blank" rel="noreferrer" key={id}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{t(source.title)}</strong><small>{t(source.kind)}</small></div><ArrowUpRight size={14}/></a>;
 })}</div>;
}

export function TimelineExplorer({lang,track,initialEventId='',onTrackChange,onSelectEvent,onOpenLesson,onQuestion,onImageOpen,onLanguageChange}:{
 lang:Lang;track:TimelineTrack;initialEventId?:string;
 onTrackChange:(track:TimelineTrack,eventId?:string)=>void;
 onSelectEvent:(eventId:string)=>void;
 onOpenLesson:(id:string)=>void;onQuestion:(question:Pair)=>void;onImageOpen:(id:string)=>void;onLanguageChange:(lang:Lang)=>void;
}){
 const t=(v:Pair)=>choose(v,lang);const tx=(zh:string,ja:string)=>lang==='ja'?ja:zh;
 const periods=timelinePeriods[track];
 const bounds:WindowRange=[yearCoordinate(periods[0].start),yearCoordinate(periods[0].end)];
 const [range,setRange]=useState<WindowRange>(bounds);
 const [periodId,setPeriodId]=useState('all');
 const [category,setCategory]=useState<'all'|TimelineCategory>('all');
 const [query,setQuery]=useState('');const [featuredOnly,setFeaturedOnly]=useState(false);
 const [mode,setMode]=useState<'axis'|'cards'>('axis');
 const [selectedId,setSelectedId]=useState(initialEventId);
 const [detailOpen,setDetailOpen]=useState(false);
 const [clusterChoice,setClusterChoice]=useState<HistoricalEvent[]>([]);
 const [plotWidth,setPlotWidth]=useState(760);
 const plot=useRef<HTMLDivElement>(null);
 const inspector=useRef<HTMLElement>(null);
 const ribbonDrag=useHorizontalDrag<HTMLDivElement>(event=>{
  const element=event.currentTarget;
  if(event.pointerType==='touch'||element.scrollWidth<=element.clientWidth)return;
  const start=element.scrollLeft;
  return distance=>{element.scrollLeft=start-distance;};
 });
 const events=useMemo(()=>historicalEvents.filter(e=>e.track===track),[track]);

 useEffect(()=>{
  const nextBounds:WindowRange=[yearCoordinate(timelinePeriods[track][0].start),yearCoordinate(timelinePeriods[track][0].end)];
  setRange(nextBounds);setPeriodId('all');setCategory('all');setQuery('');setFeaturedOnly(false);setDetailOpen(false);setClusterChoice([]);
  setSelectedId(initialEventId||historicalEvents.find(e=>e.track===track&&e.featured)?.id||'');
 },[track]);
 useEffect(()=>{
  if(!initialEventId){setDetailOpen(false);return;}
  const event=historicalEvents.find(e=>e.id===initialEventId&&e.track===track);if(!event)return;
  setSelectedId(event.id);setDetailOpen(true);
  setRange(previous=>{
   if(intersects(event,previous))return previous;
   const target=timelinePeriods[track].slice(1).find(period=>event.start>=period.start&&event.start<=period.end);
   if(target){setPeriodId(target.id);return [yearCoordinate(target.start),yearCoordinate(target.end)];}
   setPeriodId('custom');return fitRange(yearCoordinate(event.start),200,[yearCoordinate(timelinePeriods[track][0].start),yearCoordinate(timelinePeriods[track][0].end)]);
  });
 },[initialEventId,track]);
 useEffect(()=>{
  const element=plot.current;if(!element)return;
  const observer=new ResizeObserver(()=>setPlotWidth(element.clientWidth));observer.observe(element);setPlotWidth(element.clientWidth);
  return()=>observer.disconnect();
 },[mode]);

 const filtered=useMemo(()=>events.filter(e=>(category==='all'||e.category===category)&&(!featuredOnly||e.featured)&&(!query.trim()||eventSearchText(e).includes(query.trim().toLocaleLowerCase()))),[events,category,featuredOnly,query]);
 const visible=useMemo(()=>filtered.filter(e=>intersects(e,range)),[filtered,range]);
 const selected=visible.find(e=>e.id===selectedId)||visible.find(e=>e.featured)||visible[0];
 const readingEvent=events.find(e=>e.id===selectedId)||selected;
 const readingIndex=readingEvent?events.findIndex(e=>e.id===readingEvent.id):-1;
 useEffect(()=>{if(inspector.current)inspector.current.scrollTop=0;},[selected?.id]);
 const rows=category==='all'?categoryOrder.filter(row=>visible.some(event=>event.category===row)):[category];
 const span=range[1]-range[0];const fullSpan=bounds[1]-bounds[0];const center=(range[0]+range[1])/2;
 const xPosition=(year:number)=>54+(yearCoordinate(year)-range[0])/span*(plotWidth-108);
 const ticks=tickYears(range,plotWidth);
 const rangeLabel=`${formatYear(coordinateYear(range[0]),lang==='ja')} — ${formatYear(coordinateYear(range[1]),lang==='ja')}`;
 const [helpOpen,setHelpOpen]=useState(false);
 const otherTrack:TimelineTrack=track==='china'?'exchange':'china';
 const contextEvent=detailOpen?readingEvent:selected;
 const related=contextEvent?historicalEvents.filter(e=>e.track===otherTrack&&Math.abs(e.start-contextEvent.start)<=(contextEvent.start>=1840?15:60)).sort((a,b)=>Math.abs(a.start-contextEvent.start)-Math.abs(b.start-contextEvent.start)).slice(0,3):[];
 const clusters:EventCluster[]=[];
 for(const row of rows){
  const laneEvents=visible.filter(e=>e.category===row);
  let cluster:EventCluster|undefined;
  for(const event of laneEvents){
   const x=Math.max(54,Math.min(plotWidth-54,xPosition(event.start)));
   if(cluster&&x-cluster.x<103){cluster.events.push(event);}
   else {cluster={events:[event],category:row,x};clusters.push(cluster);}
  }
 }

 function applyPeriod(id:string){
  const period=periods.find(v=>v.id===id);if(!period)return;
  setPeriodId(id);setRange([yearCoordinate(period.start),yearCoordinate(period.end)]);setDetailOpen(false);
 }
 function zoom(factor:number){
  const anchor=selected&&intersects(selected,range)?Math.max(range[0],Math.min(range[1],yearCoordinate(selected.start))):center;
  setPeriodId('custom');setRange(fitRange(anchor,span*factor,bounds));
 }
 function pan(direction:number){setPeriodId('custom');setRange(fitRange(center+span*.6*direction,span,bounds));}
 function openEvent(event:HistoricalEvent){
  setSelectedId(event.id);onSelectEvent(event.id);setDetailOpen(true);
 }
 function expandCluster(cluster:EventCluster){
  if(cluster.events.length===1){openEvent(cluster.events[0]);return;}
  const first=yearCoordinate(cluster.events[0].start),last=yearCoordinate(cluster.events[cluster.events.length-1].start);
  if(last===first||span<=19){setClusterChoice(cluster.events);return;}
  setPeriodId('custom');setRange(fitRange((first+last)/2,Math.max(18,(last-first)*1.65),bounds));setSelectedId(cluster.events.find(e=>e.featured)?.id||cluster.events[0].id);
 }
 const canPan=span<fullSpan-.01;
 const plotDrag=useHorizontalDrag<HTMLDivElement>(()=>{
  if(!canPan)return;
  const startRange:WindowRange=[...range];
  const startSpan=startRange[1]-startRange[0];
  const width=Math.max(1,plotWidth-108);
  return distance=>{
   const change=distance/width*startSpan;
   setPeriodId('custom');
   setRange(fitRange((startRange[0]+startRange[1])/2-change,startSpan,bounds));
  };
 });
 const minimapDrag=useHorizontalDrag<HTMLDivElement>(event=>{
  if(!canPan)return;
  const rect=event.currentTarget.getBoundingClientRect();
  const x=event.clientX-rect.left;
  const windowLeft=(range[0]-bounds[0])/fullSpan*rect.width;
  const windowRight=(range[1]-bounds[0])/fullSpan*rect.width;
  const anchor=x>=windowLeft&&x<=windowRight?center:bounds[0]+x/rect.width*fullSpan;
  return distance=>{
   setPeriodId('custom');
   setRange(fitRange(anchor+distance/rect.width*fullSpan,span,bounds));
  };
 });
 function resetFilters(){setQuery('');setCategory('all');setFeaturedOnly(false);}
 const questionWithContext=(event:HistoricalEvent)=>p(`【${event.date.zh} · ${event.title.zh}】\n${event.question.zh}`,`【${event.date.ja}・${event.title.ja}】\n${event.question.ja}`);

 function detail(event:HistoricalEvent){
  const info=categoryInfo[event.category];const asset=getAsset(event.imageId||'');const lesson=getLesson(event.lessonId||'');
  return <article className="event-detail-content" key={event.id}>
   <div className="event-detail-meta"><span style={{color:info.dark}}><i style={{background:info.dark}}/>{t(info.title)}</span>{event.featured&&<span><Star size={12} fill="currentColor"/>{tx('关键事件','重要な出来事')}</span>}</div>
   <div className="event-date-large"><Bilingual value={event.date} lang={lang}/></div>
   <h2><Bilingual value={event.title} lang={lang}/></h2>
   <p className="event-location"><MapPin size={14}/>{t(event.location)}</p>
   <p className="event-summary"><Bilingual value={event.summary} lang={lang}/></p>
   <button className="reader-open-button" onClick={()=>openEvent(event)}><BookOpen size={16}/>{tx('展开专题正文','詳しい記事を読む')}<ArrowRight size={15}/></button><p className="reader-open-hint">{tx('背景与过程 · 史料辨析 · 解释边界 · 注释与术语','背景と展開・史料の検討・解釈の限界・出典と用語')}</p>
   {asset&&<div className="event-illustration"><span className="eyebrow">{tx('相关实物与地点','関連する資料と場所')}</span><Photo asset={asset} lang={lang} onOpen={id=>{setDetailOpen(false);onImageOpen(id);}}/></div>}
   <section className="event-meaning"><h3>{tx('为什么值得记住','なぜ覚えておきたい？')}</h3><p><Bilingual value={event.significance} lang={lang}/></p></section>
   <section className="event-question"><span className="eyebrow">{tx('带着问题继续读','問いを持って読み進める')}</span><p><Bilingual value={event.question} lang={lang}/></p><button className="text-button" onClick={()=>onQuestion(questionWithContext(event))}><NotebookPen size={15}/>{tx('带到我的摘记','ノートへ')}</button></section>
   {lesson&&<button className="event-lesson-link" onClick={()=>onOpenLesson(lesson.id)}><BookOpen size={17}/><span><small>{tx('继续读一节短课','レッスンへ')}</small>{t(lesson.title)}</span><ArrowUpRight size={16}/></button>}
   <EventReferences event={event} lang={lang}/>
   {related.length>0&&<section className="event-contemporaries"><h3>{tx('放到另一条时间线看','もう一つの年表で見る')}</h3><p>{tx('相近年代的参照，帮助建立时代背景。','近い年代の出来事から、時代の背景をつかむ。')}</p>{related.map(item=><button key={item.id} onClick={()=>onTrackChange(otherTrack,item.id)}><span>{t(item.date)}</span><strong>{t(item.title)}</strong><ArrowRight size={14}/></button>)}</section>}
  </article>;
 }

 return <section className="timeline-page content-width">
  <header className="atlas-heading compact-atlas-heading"><h1>{tx('历史时间线','歴史年表')}</h1><span aria-live="polite">{visible.length} {tx('件','件')}</span></header>
  <div className="compact-atlas-toolbar">
   <div className="compact-track" aria-label={tx('选择历史时间线','年表を選ぶ')}><button aria-pressed={track==='exchange'} onClick={()=>onTrackChange('exchange')}><i className="track-dot exchange"/>{tx('中日交流','日中交流')}</button><button aria-pressed={track==='china'} onClick={()=>onTrackChange('china')}><i className="track-dot china"/>{tx('中国史','中国史')}</button></div>
   <select aria-label={tx('按时代跳转','時代を選ぶ')} value={periodId} onChange={e=>applyPeriod(e.target.value)}>{periodId==='custom'&&<option value="custom">{rangeLabel}</option>}{periods.map(period=><option key={period.id} value={period.id}>{t(period.title)} · {formatYear(period.start)}–{formatYear(period.end)}</option>)}</select>
   <label className="atlas-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tx('找事件、人物、地点或年份…','出来事・人物・場所・年代を検索…')} aria-label={tx('搜索时间线','年表を検索')}/>{query&&<button aria-label={tx('清空搜索','検索を消去')} onClick={()=>setQuery('')}><X size={15}/></button>}</label>
   <details className="compact-atlas-filter"><summary><Filter size={16}/>{tx('筛选','絞り込み')}{(category!=='all'||featuredOnly)&&<i className="filter-active"/>}</summary><div className="compact-filter-panel"><button className={'famous-filter '+(featuredOnly?'active':'')} aria-pressed={featuredOnly} onClick={()=>setFeaturedOnly(v=>!v)}><Star size={15}/>{tx('只看关键事件','重要な出来事')}</button><div className="atlas-mode" aria-label={tx('时间线呈现方式','年表の表示方法')}><button aria-pressed={mode==='axis'} onClick={()=>setMode('axis')}><MoveHorizontal size={16}/>{tx('时间图谱','時間軸')}</button><button aria-pressed={mode==='cards'} onClick={()=>setMode('cards')}><List size={16}/>{tx('编年卡片','年代順カード')}</button></div><div className="atlas-categories" aria-label={tx('按主题筛选','テーマで絞り込む')}><button aria-pressed={category==='all'} onClick={()=>setCategory('all')}><Filter size={13}/>{tx('全部主题','すべて')}</button>{categoryOrder.map(id=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}><i style={{background:categoryInfo[id].dark}}/>{t(categoryInfo[id].title)} · {events.filter(e=>e.category===id&&intersects(e,range)&&(!featuredOnly||e.featured)&&(!query.trim()||eventSearchText(e).includes(query.trim().toLocaleLowerCase()))).length}</button>)}</div>{(query||category!=='all'||featuredOnly)&&<button className="text-button" onClick={resetFilters}>{tx('清除筛选','絞り込みを解除')}</button>}</div></details>
   <button className="icon-button" aria-label={tx('时间线帮助','年表のヘルプ')} title={tx('时间线帮助','年表のヘルプ')} onClick={()=>setHelpOpen(true)}>?</button>
  </div>
  {mode==='axis'?<div className="atlas-workbench">
   <div className="atlas-chart-column">
    <div className="chronology-panel">
     <div className="chronology-topbar"><div><span>{tx('当前年代','表示年代')}</span><strong>{rangeLabel}</strong></div><div className="zoom-controls"><button aria-label={tx('向更早年代移动','前の年代へ')} onClick={()=>pan(-1)} disabled={range[0]<=bounds[0]+.01}><ChevronLeft size={17}/></button><button aria-label={tx('缩小时间线','年表を縮小')} onClick={()=>zoom(1.8)} disabled={span>=fullSpan-.01}><Minus size={17}/></button><button aria-label={tx('放大时间线','年表を拡大')} onClick={()=>zoom(1/1.8)} disabled={span<=12.01}><Plus size={17}/></button><button aria-label={tx('向更晚年代移动','次の年代へ')} onClick={()=>pan(1)} disabled={range[1]>=bounds[1]-.01}><ChevronRight size={17}/></button><button className="zoom-reset" onClick={()=>applyPeriod('all')}><Expand size={14}/>{tx('全景','全体')}</button></div></div>
     <div className="chronology-scroll"><div className="chronology-grid"><div className="lane-labels"><div className="lane-axis-label">{tx('年代','年代')}</div>{rows.map(row=><div key={row} style={{color:categoryInfo[row].color}}><i style={{background:categoryInfo[row].color}}/>{t(categoryInfo[row].title)}</div>)}</div><div className={"atlas-plot"+(canPan?" can-pan":"")+(plotDrag.isDragging?" is-dragging":"")} {...plotDrag.handlers} ref={plot} style={{height:rows.length*86+51}} tabIndex={0} role="group" aria-label={tx('历史事件图。左右方向键平移，加减键缩放。','出来事の時間軸。左右キーで移動、プラスとマイナスで拡大縮小。')} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowLeft'){e.preventDefault();pan(-1);}if(e.key==='ArrowRight'){e.preventDefault();pan(1);}if(e.key==='+')zoom(1/1.8);if(e.key==='-')zoom(1.8);}}>
      {ticks.map(year=><div className="atlas-tick" key={year} style={{left:xPosition(year)}}><span>{formatYear(year,lang==='ja')}</span></div>)}
      {rows.map((row,index)=><div className="atlas-lane" key={row} style={{top:51+index*86}}/>)}
      {clusters.map(cluster=>{
       const row=rows.indexOf(cluster.category);const info=categoryInfo[cluster.category];const featured=cluster.events.find(e=>e.featured)||cluster.events[0];const count=cluster.events.length;const first=cluster.events[0];const last=cluster.events[count-1];const isSelected=!!selected&&cluster.events.some(e=>e.id===selected.id);
       return <button key={first.id} className={'atlas-node '+(count>1?'cluster-node ':'')+(isSelected?'node-selected':'')} style={{left:cluster.x,top:row*86+62,'--event-color':info.color} as CSSProperties} onClick={()=>expandCluster(cluster)} aria-label={count>1?tx(`展开${first.date.zh}至${last.date.zh}的${count}个事件`,` ${first.date.ja}から${last.date.ja}の${count}件を展開`):t(first.date)+' '+t(first.title)} title={cluster.events.map(e=>t(e.date)+' · '+t(e.title)).join('\n')}><span className="node-symbol">{count>1?count:first.featured?<Star size={10} fill="currentColor"/>:null}</span><span className="node-year">{count>1?formatYear(first.start)+'–'+formatYear(last.start):t(first.date)}</span><strong>{t(featured.title)}</strong>{count>1&&<small>+{count-1} {tx('个事件','件')}</small>}</button>;
      })}
     </div></div></div>
     <div className="atlas-minimap"><div className="minimap-label"><span>{tx('全局定位','全体の中の位置')}</span><span>{formatYear(periods[0].start)} — {formatYear(periods[0].end)}</span></div><div className={"minimap-strip"+(canPan?" can-pan":"")+(minimapDrag.isDragging?" is-dragging":"")} {...minimapDrag.handlers} onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();setPeriodId('custom');setRange(fitRange(bounds[0]+(e.clientX-rect.left)/rect.width*fullSpan,span,bounds));}}>{events.map(event=><i key={event.id} style={{left:(yearCoordinate(event.start)-bounds[0])/fullSpan*100+'%',background:categoryInfo[event.category].color}}/>)}<span className="minimap-window" style={{left:(range[0]-bounds[0])/fullSpan*100+'%',width:span/fullSpan*100+'%'}}/></div><input type="range" min={bounds[0]+span/2} max={bounds[1]-span/2} step="any" value={center} disabled={span>=fullSpan-.01} onChange={e=>{setPeriodId('custom');setRange(fitRange(Number(e.target.value),span,bounds));}} aria-label={tx('定位时间范围','表示年代の位置')} aria-valuetext={rangeLabel}/></div>
    </div>
    {visible.length===0?<div className="atlas-empty"><Search size={28}/><h3>{tx('这一段还没有匹配的事件','この範囲には該当する出来事がありません')}</h3><p>{tx('试试全景，或清除主题与关键词筛选。','全体表示に戻すか、テーマや検索語を変えてみましょう。')}</p><button className="button secondary" onClick={()=>{resetFilters();applyPeriod('all');}}>{tx('显示全部事件','すべて表示')}</button></div>:<section className="atlas-reading-queue"><div><h2>{tx('沿着这一段，继续读','この時代を、順に読む')}</h2></div><div className={"event-ribbon drag-scroll"+(ribbonDrag.isDragging?" is-dragging":"")} {...ribbonDrag.handlers}>{visible.map(event=><button key={event.id} onClick={()=>openEvent(event)} aria-pressed={selected?.id===event.id}><span style={{color:categoryInfo[event.category].dark}}>{t(event.date)}</span><strong>{t(event.title)}</strong><p>{t(event.significance)}</p><small>{t(categoryInfo[event.category].title)}<ArrowUpRight size={14}/></small></button>)}</div></section>}
   </div>
   <aside ref={inspector} className="event-inspector" aria-label={tx('选中事件详情','選んだ出来事の詳細')}>{selected?detail(selected):<div className="inspector-empty"><Compass size={28}/><p>{tx('选择一个事件，查看它的故事与出处。','出来事を選ぶと、内容と出典を表示します。')}</p></div>}</aside>
  </div>:<div className="chronicle-card-grid">{visible.length?visible.map(event=>{
   const asset=getAsset(event.imageId||'');return <article key={event.id} className="chronicle-card"><div className="chronicle-card-top"><span style={{color:categoryInfo[event.category].dark}}>{t(event.date)}</span>{event.featured&&<Star size={14}/>}</div>{asset&&<div className="chronicle-image"><Photo asset={asset} lang={lang} onOpen={onImageOpen} caption={false}/><small>{tx('相关图像：','関連画像：')}{t(asset.title)}</small><Credit asset={asset} lang={lang}/></div>}<h2><Bilingual value={event.title} lang={lang}/></h2><span className="chronicle-category">{t(categoryInfo[event.category].title)}</span><p><Bilingual value={event.summary} lang={lang}/></p><button className="text-button" onClick={()=>openEvent(event)}>{tx('展开专题正文','詳しい記事を読む')}<ArrowUpRight size={15}/></button></article>;
  }):<div className="atlas-empty"><h3>{tx('没有匹配的事件','該当する出来事がありません')}</h3><button className="button secondary" onClick={()=>{resetFilters();applyPeriod('all');}}>{tx('显示全部事件','すべて表示')}</button></div>}</div>}
  {helpOpen&&<Dialog title={tx('如何阅读时间线','年表の読み方')} onClose={()=>setHelpOpen(false)}><section className="timeline-reading-guide"><div><h2>{tx('年代，是理解的起点。','年代は、理解の出発点。')}</h2></div><div><p>{tx('本版收录精选节点，最晚至2008年。它提供继续学习的线索；可以按主题或关键词寻找事件。','この版は2008年までの出来事を選んで収録しています。学びを広げる手がかりとして、テーマや言葉から探してみましょう。')}</p><p>{tx('朝代与时期是导航分段，存在重叠，也不等于固定疆域。图上事件按年份比例定位；相近节点会合并，放大即可展开。','時代区分は移動のための目安です。重なりがあり、固定した領域を示しません。時間軸は年数に比例し、近い項目はまとめて表示します。')}</p><p>{tx('“约”和时间范围保留材料的精度。条目之间的先后、接近，不直接代表因果。每一项都可以回到资料继续核对。','「頃」や期間の表示は資料の精度を保つためです。前後関係や時間的な近さだけで因果は決まりません。各項目の出典で確かめられます。')}</p><a href="https://www.allhistory.com/" target="_blank" rel="noreferrer">{tx('界面参考：全历史的时代导航与事件卡片','表示の参考：全歴史の時代ナビゲーションと出来事カード')}<ArrowUpRight size={13}/></a></div></section></Dialog>}
  {clusterChoice.length>0&&<Dialog title={tx('同一时段的事件','同じ時期の出来事')} onClose={()=>setClusterChoice([])} className="timeline-cluster-dialog"><p>{tx('选择一件事，读它的背景、影响与出处。','出来事を選んで、背景・意味・出典を読みましょう。')}</p><div className="cluster-choices">{clusterChoice.map(event=><button key={event.id} onClick={()=>{setClusterChoice([]);openEvent(event);}}><span>{t(event.date)}</span><strong>{t(event.title)}</strong><ArrowRight size={17}/></button>)}</div></Dialog>}
  {detailOpen&&readingEvent&&<Dialog title={t(readingEvent.title)} onClose={()=>setDetailOpen(false)} className="history-reader-dialog"><EventArticleReader key={readingEvent.id} event={readingEvent} lang={lang} related={related} previous={events[readingIndex-1]} next={events[readingIndex+1]} onClose={()=>setDetailOpen(false)} onLanguageChange={onLanguageChange} onNavigate={event=>event.track===track?openEvent(event):onTrackChange(event.track,event.id)} onOpenLesson={onOpenLesson} onQuestion={onQuestion}/></Dialog>}
 </section>;
}
