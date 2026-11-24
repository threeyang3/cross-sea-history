"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Clock3, FileText, Languages, List, MapPin, Maximize2, Minimize2, NotebookPen } from 'lucide-react';
import type { Lang, Pair, Source } from './content-types';
import { pair as p } from './content-types';
import { getAsset, getLesson, sources } from './content';
import { Bilingual, choose, Credit } from './learning-ui';
import { eventMuseumAssets, MuseumFigure } from './museum-images';
import { categoryInfo, timelineSources } from './timeline-data';
import type { HistoricalEvent } from './timeline-types';
import { articleManifest, articleSources, loadEventArticle } from './article-data';
import type { EventArticle } from './article-types';
import { EventLearningVisual, getLearningVisualSections } from './learning-visuals';
import { EventEraContext } from './event-era-context';
import { cityAtlasPath } from './city-atlas-path';
import cityAtlasLinks from './city-atlas-links.json';
import { farewellPoem } from './poetry/data';
import { readingPosition, readingTarget } from './reader-geometry.mjs';

const sourceIndex = new Map<string, Source>([...sources, ...timelineSources, ...articleSources].map(source => [source.id, source]));

function ReaderTocEntries({sections,activeId,lang,onJump}:{sections:{id:string;title:Pair}[];activeId:string;lang:Lang;onJump:(id:string)=>void}){
  return <>{sections.map((section,index)=><button key={section.id} type="button" aria-current={activeId===section.id?'location':undefined} onClick={()=>onJump(section.id)}><small>{String(index+1).padStart(2,'0')}</small><span>{choose(section.title,lang)}</span></button>)}</>;
}

export function EventArticleReader({ event, lang, related, previous, next, onClose, onLanguageChange, onNavigate, onOpenLesson, onQuestion }: {
  event: HistoricalEvent;
  lang: Lang;
  related: HistoricalEvent[];
  previous?: HistoricalEvent;
  next?: HistoricalEvent;
  onClose: () => void;
  onLanguageChange: (lang: Lang) => void;
  onNavigate: (event: HistoricalEvent) => void;
  onOpenLesson: (id: string) => void;
  onQuestion: (question: Pair) => void;
}) {
  const tx = (zh: string, ja: string) => lang === 'ja' ? ja : zh;
  const t = (value: Pair) => choose(value, lang);
  const [article, setArticle] = useState<EventArticle | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [imageExpanded, setImageExpanded] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const tocToggle = useRef<HTMLButtonElement>(null);
  const mobileToc = useRef<HTMLElement>(null);
  const citationOrigin = useRef<HTMLElement|null>(null);
  const [tocOpen,setTocOpen]=useState(false);
  const [position,setPosition]=useState({activeId:'overview',progress:0});
  const [returnCitation,setReturnCitation]=useState(false);
  const meta = articleManifest[event.id];
  const asset = getAsset(event.imageId || '');
  const illustrations = eventMuseumAssets(event.id);
  const lesson = getLesson(event.lessonId || '');
  const isFarewellPoem = event.id === 'cn-tang-poetry-farewell';
  const atlasEntry = cityAtlasLinks[event.id as keyof typeof cityAtlasLinks];

  useEffect(() => {
    let active = true;
    // The parent keys this reader by event ID. Retrying resets load state in the button handler.
    root.current?.closest('.dialog')?.scrollTo({ top: 0,behavior:'instant' });
    loadEventArticle(event.id).then(value => { if (active) setArticle(value); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [event.id, attempt]);

  const usedIds = Array.from(new Set([
    ...event.sourceIds,
    ...(article?.sections.flatMap(section => section.sourceIds) || []),
    ...(article?.evidence.flatMap(evidence => evidence.sourceIds) || [])
  ])).filter(id => sourceIndex.has(id));
  const bibliography = usedIds.map(id => sourceIndex.get(id)!);
  // Work in the dialog's own coordinate system. A jump must not scroll the page behind it.
  function scrollToTarget(target:HTMLElement,focus?:HTMLElement){
    const scroller=root.current?.closest<HTMLElement>('.dialog');
    if(!scroller)return;
    const top=readingTarget({scrollTop:scroller.scrollTop,targetTop:target.getBoundingClientRect().top,scrollerTop:scroller.getBoundingClientRect().top,toolbarHeight:toolbar.current?.offsetHeight??70,scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight});
    scroller.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    focus?.focus({preventScroll:true});
  }
  function jump(id:string){
    const target=Array.from(root.current?.querySelectorAll<HTMLElement>('[data-reading-section]')??[]).find(node=>node.dataset.readingSection===id);
    if(!target)return;
    setTocOpen(false);
    scrollToTarget(target,target.querySelector<HTMLElement>('h1,h2,h3')??undefined);
  }
  function returnFromCitation(){
    const origin=citationOrigin.current;
    setReturnCitation(false);citationOrigin.current=null;
    if(origin?.isConnected)scrollToTarget(origin,origin);
  }
  const citations = (ids: string[]) => <span className="reading-citations" aria-label={tx('本节参考资料', 'この節の出典')}>{Array.from(new Set(ids)).map(id => {
    const index = usedIds.indexOf(id); const source = sourceIndex.get(id);
    return index < 0 || !source ? null : <button key={id} onClick={e=>{citationOrigin.current=e.currentTarget;setReturnCitation(true);jump(`source-${index}`);}} title={t(source.title)} aria-label={`${tx('参考资料', '出典')} ${index + 1}: ${t(source.title)}`}>[{index + 1}]</button>;
  })}</span>;
  const sections = article ? [
    { id: 'overview', title: p('问题与背景', '問いと見取り図') },
    ...getLearningVisualSections(event.id),
    ...article.sections.map(section => ({ id: section.id, title: section.title })),
    { id: 'evidence', title: p('读材料，辨证据', '史料と証拠を読む') },
    { id: 'discussion', title: p('解释与边界', '解釈とその限界') },
    { id: 'terms', title: p('概念与术语', '概念と用語') },
    { id: 'era-context', title: p('放回时代坐标', '時代の中に置く') },
    { id: 'references', title: p('参考资料', '参考資料') },
    { id: 'practice', title: p('带着问题继续', '問いを次の学びへ') }
  ] : [];

  useEffect(()=>{
    const scroller=root.current?.closest<HTMLElement>('.dialog');
    const body=root.current?.querySelector<HTMLElement>('.reader-body');
    if(!scroller||!body)return;
    const headings=Array.from(body.children).filter((child):child is HTMLElement=>child instanceof HTMLElement&&!!child.dataset.readingSection);
    let frame=0;
    const update=()=>{
      frame=0;
      const marker=scroller.getBoundingClientRect().top+(toolbar.current?.offsetHeight??70)+24;
      const next=readingPosition({scrollTop:scroller.scrollTop,scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight,marker,sections:headings.map(node=>({id:node.dataset.readingSection!,top:node.getBoundingClientRect().top}))});
      setPosition(old=>old.activeId===next.activeId&&old.progress===next.progress?old:next);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const observer=new ResizeObserver(schedule);
    observer.observe(body);observer.observe(scroller);
    if(toolbar.current)observer.observe(toolbar.current);
    scroller.addEventListener('scroll',schedule,{passive:true});schedule();
    return()=>{observer.disconnect();scroller.removeEventListener('scroll',schedule);cancelAnimationFrame(frame);};
  },[article,event.id,lang]);

  useEffect(()=>{
    if(!tocOpen)return;
    const active=mobileToc.current?.querySelector<HTMLElement>('[aria-current="location"]')??mobileToc.current?.querySelector<HTMLElement>('button');
    active?.focus({preventScroll:true});
    if(active&&mobileToc.current){
      const menu=mobileToc.current;
      menu.scrollTop=Math.max(0,active.offsetTop-menu.clientHeight/2+active.offsetHeight/2);
    }
    const wide=window.matchMedia('(min-width:901px)');
    const closeOnWide=()=>{if(wide.matches)setTocOpen(false);};
    const dismiss=(e:PointerEvent)=>{
      if(e.target instanceof Node&&!mobileToc.current?.contains(e.target)&&!tocToggle.current?.contains(e.target))setTocOpen(false);
    };
    wide.addEventListener('change',closeOnWide);
    document.addEventListener('pointerdown',dismiss);
    return()=>{wide.removeEventListener('change',closeOnWide);document.removeEventListener('pointerdown',dismiss);};
  },[tocOpen]);
  function retryArticle(){
    setArticle(null);setError(false);setAttempt(value=>value+1);
  }

  function takeQuestion() {
    const references = bibliography.slice(0, 3).map((source, index) => `${index + 1}. ${t(source.title)}\n${source.url}`).join('\n');
    onQuestion(p(
      `【${event.date.zh} · ${event.title.zh}】\n${event.question.zh}\n\n材料 → 判断 → 尚不能确定的部分：\n\n参考资料：\n${references}`,
      `【${event.date.ja}・${event.title.ja}】\n${event.question.ja}\n\n史料 → 判断 → まだ確かめられない点：\n\n参考資料：\n${references}`
    ));
  }

  return <article ref={root} className={'history-reader ' + (lang === 'bi' ? 'reading-bilingual' : '')}>
    <div className="reader-toolbar" ref={toolbar} onKeyDown={e=>{if(tocOpen&&e.key==='Escape'){e.preventDefault();e.stopPropagation();setTocOpen(false);tocToggle.current?.focus();}}}>
      <button className="reader-back" onClick={onClose}><ArrowLeft size={16} />{tx('返回时间线', '年表に戻る')}</button>
      <span className="reader-mode"><BookOpen size={14} />{tx('专题阅读', 'テーマを読む')}</span>
      <button className="reader-toc-toggle" type="button" ref={tocToggle} aria-controls="reader-mobile-toc" aria-expanded={tocOpen} disabled={!sections.length} onClick={()=>setTocOpen(open=>!open)}><List size={17}/>{tx('目录','目次')}</button>
      <div className="reader-languages" aria-label={tx('阅读语言', '表示言語')}><Languages size={15} />{(['zh', 'ja', 'bi'] as const).map(value => <button key={value} aria-pressed={lang === value} onClick={() => onLanguageChange(value)}>{value === 'zh' ? '中文' : value === 'ja' ? '日本語' : tx('对照','対照')}</button>)}</div>
      {returnCitation&&<button type="button" className="reader-citation-return" onClick={returnFromCitation} title={tx('返回引用处','引用箇所に戻る')} aria-label={tx('返回引用处','引用箇所に戻る')}><ArrowLeft size={15}/><span>{tx('引用','引用')}</span></button>}
      <div className="reader-progress" role="progressbar" aria-label={tx('正文滚动位置','本文のスクロール位置')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={position.progress}><span style={{width:position.progress+'%'}}/></div>
      <nav id="reader-mobile-toc" ref={mobileToc} hidden={!tocOpen} className="reader-mobile-toc" aria-label={tx('本文目录','目次')}>{tocOpen&&<ReaderTocEntries sections={sections} activeId={position.activeId} lang={lang} onJump={jump}/>}</nav>
    </div>
    <div className="reader-layout">
      <aside className="reader-toc" aria-label={tx('本文目录', '目次')}>

        <strong>{tx('在这一篇里', 'この記事の中で')}</strong>
        <nav aria-label={tx('本文目录','目次')}><ReaderTocEntries sections={sections} activeId={position.activeId} lang={lang} onJump={jump}/></nav>

      </aside>
      <div className="reader-body" aria-busy={!article && !error}>
        <header className="reading-header" data-reading-section="overview">
          <div className="reading-kicker"><span>{t(categoryInfo[event.category].title)}</span><i />{t(event.date)}</div>
          <h1 tabIndex={-1}><Bilingual value={event.title} lang={lang} /></h1>
          <div className="reading-meta"><span><MapPin size={13} />{t(event.location)}</span>{meta && <span><Clock3 size={13} />{tx(`阅读与思考约 ${meta.minutes} 分钟`, `読む・考える目安 ${meta.minutes} 分`)}</span>}<span><FileText size={13} />{bibliography.length}{tx(' 项参考资料', ' 件の参考資料')}</span></div>
          <p className="reading-lead"><Bilingual value={event.summary} lang={lang} /></p>
        </header>
        {!article && <div className="reading-load" role="status">{error ? <><h2>{tx('正文暂时未能载入', '本文を読み込めませんでした')}</h2><p>{tx('请重试，或通过下面的资料入口继续阅读。', 'もう一度お試しください。出典から読み進めることもできます。')}</p><button className="button primary" onClick={retryArticle}>{tx('重新载入正文', '本文を再読み込み')}</button>{bibliography.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{t(source.title)}<ArrowUpRight size={13} /></a>)}</> : <><span className="reading-load-dot" />{tx('正在展开这段历史…', '歴史の背景を開いています…')}</>}</div>}
        {article && <>
          <div className="reading-thesis"><span>{tx('这一篇要理解', 'この記事で考えること')}</span><p><Bilingual value={article.thesis} lang={lang} /></p></div>
          {asset && <figure className={'reading-figure ' + (asset.width < asset.height ? 'reading-portrait ' : '') + (imageExpanded ? 'expanded' : '')}>
            <button className="reading-image" onClick={() => setImageExpanded(value => !value)} aria-expanded={imageExpanded} aria-label={tx('切换图片观察尺寸', '画像の表示サイズを切り替える')}><img src={asset.src} width={asset.width} height={asset.height} alt={t(asset.alt)} /><span>{imageExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{imageExpanded ? tx('收起图像', '小さく表示') : tx('展开观察', '大きく見る')}</span></button>
            <figcaption><span className="reading-image-type">{tx('相关实物与地点', '関連する資料と場所')}</span><Bilingual value={asset.caption} lang={lang} /><Credit asset={asset} lang={lang} /></figcaption>
          </figure>}
          <EventLearningVisual eventId={event.id} lang={lang}/>
          {article.sections.map((section, index) => <section className={'reading-section'+(illustrations[index]?' reading-illustrated-section':'')} key={section.id} data-reading-section={section.id}>
            <div className="reading-section-number">{String(index + 1).padStart(2, '0')}</div>
            <h2 tabIndex={-1}><Bilingual value={section.title} lang={lang} /></h2>
            {illustrations[index]?<div className="reading-section-content"><MuseumFigure key={illustrations[index].id} asset={illustrations[index]} lang={lang} className="reading-inset-artwork"/><div>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}><Bilingual value={paragraph} lang={lang} /></p>)}</div></div>:section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}><Bilingual value={paragraph} lang={lang} /></p>)}
            <div className="reading-section-sources"><span>{tx('依据', '出典')}</span>{citations(section.sourceIds)}</div>
          </section>)}
          <section className="reading-section reading-evidence" data-reading-section="evidence">

            <h2 tabIndex={-1}>{tx('读材料，辨证据', '史料と証拠を読む')}</h2>
            {article.evidence.map((evidence, index) => <div className="evidence-reading" key={index}>
              <h3><Bilingual value={evidence.title} lang={lang} />{citations(evidence.sourceIds)}</h3>
              <div><span className="evidence-label">{tx('这份材料帮助我们看到', 'この資料から分かること')}</span><p><Bilingual value={evidence.reading} lang={lang} /></p></div>
              <div className="evidence-limit"><span className="evidence-label">{tx('使用时需要留意', '読むときに注意したいこと')}</span><p><Bilingual value={evidence.limits} lang={lang} /></p></div>
            </div>)}
          </section>
          <section className="reading-section reading-discussion" data-reading-section="discussion">

            <h2 tabIndex={-1}><Bilingual value={article.discussion.title} lang={lang} /></h2>
            <p><Bilingual value={article.discussion.body} lang={lang} /></p>
          </section>
          <section className="reading-section reading-terms" data-reading-section="terms">
            <h2 tabIndex={-1}>{tx('概念与术语', '概念と用語')}</h2>
            <dl>{article.terms.map((term, index) => <div key={index}><dt><Bilingual value={term.term} lang={lang} /></dt><dd><Bilingual value={term.definition} lang={lang} /></dd></div>)}</dl>
          </section>
          <EventEraContext event={event} lang={lang} onNavigate={onNavigate}/>
          <section className="reading-section reading-bibliography" data-reading-section="references">

            <h2 tabIndex={-1}>{tx('回到参考资料', '参考資料に戻る')}</h2>
            
            <p className="reading-source-note">{tx('正文是一份导读。每项资料都标明用途；机构介绍、原始记录与研究文章的证据性质各不相同。引用时请核对原文与版本。', '本文は学習の手引きです。各資料の用途を示しています。機関の解説、原記録、研究論文では証拠の性格が異なります。引用する際は原文と版を確認してください。')}</p>
            <ol>{bibliography.map((source, index) => <li key={source.id} data-reading-section={`source-${index}`}><span className="bibliography-index">{index + 1}</span><div><h3 tabIndex={-1}><a href={source.url} target="_blank" rel="noreferrer"><Bilingual value={source.title} lang={lang} /><ArrowUpRight size={15} /></a></h3><span className="source-type">{t(source.kind)} · {source.language === 'ja' ? tx('日文', '日本語') : source.language === 'zh' ? tx('中文', '中国語') : source.language === 'en' ? tx('英文', '英語') : source.language}</span><p><Bilingual value={source.claim} lang={lang} /></p><small className="source-domain">{new URL(source.url).hostname}</small></div></li>)}</ol>
            {meta && <small className="reading-review-date">{tx('内容校核日期', '内容確認日')}：{meta.reviewedAt}</small>}
          </section>
          <section className="reading-practice" data-reading-section="practice">

            <h2 tabIndex={-1}>{tx('留一个有依据的判断', '根拠のある判断を残す')}</h2>
            <p><Bilingual value={event.question} lang={lang} /></p>
            <div className="reading-practice-steps"><span>01 {tx('指出一份材料', '資料を一つ選ぶ')}</span><span>02 {tx('说明它支持什么', '何を示すか考える')}</span><span>03 {tx('写出判断的边界', '判断の限界を書く')}</span></div>
            <button className="button primary" onClick={takeQuestion}><NotebookPen size={16} />{tx('把问题与资料带到摘记', '問いと資料をノートへ')}</button>
          </section>
          {(lesson || related.length > 0 || atlasEntry || isFarewellPoem) && <section className="reading-connections"><h2>{tx('把这一篇，放进更大的图景', '学びを広い背景につなぐ')}</h2>{isFarewellPoem && <a href={'#poetry/'+farewellPoem}><BookOpen size={18}/><span>{tx('打开原文与日文逐词注','原文と日本語の語注を開く')}</span><ArrowUpRight size={15}/></a>}{atlasEntry && <a href={cityAtlasPath(lang,'event/'+atlasEntry.event)}><MapPin size={18} /><span><small>{tx('北京与西安','北京と西安')}</small><strong>{tx('在城市专题中继续阅读','都市特集で続きを読む')}</strong></span><ArrowRight size={17} /></a>}{lesson && <button onClick={() => onOpenLesson(lesson.id)}><BookOpen size={18} /><span><small>{tx('相关短课与图像观察', '関連レッスンと画像観察')}</small><strong>{t(lesson.title)}</strong></span><ArrowRight size={17} /></button>}{related.map(item => <button key={item.id} onClick={() => onNavigate(item)}><FileText size={18} /><span><small>{t(item.date)} · {tx('另一条时间线的时代参照', 'もう一つの年表の時代参照')}</small><strong>{t(item.title)}</strong></span><ArrowRight size={17} /></button>)}</section>}
          <nav className="reading-pagination" aria-label={tx('相邻年代的专题', '近い年代の記事')}>{previous ? <button onClick={() => onNavigate(previous)}><small><ArrowLeft size={13} />{tx('前一个节点', '前の出来事')}</small><strong>{t(previous.date)} · {t(previous.title)}</strong></button> : <span />}{next && <button onClick={() => onNavigate(next)}><small>{tx('后一个节点', '次の出来事')}<ArrowRight size={13} /></small><strong>{t(next.date)} · {t(next.title)}</strong></button>}</nav>
        </>}
      </div>
    </div>
  </article>;
}
