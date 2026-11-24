"use client";

import { useRef, useState } from 'react';
import { useHorizontalDrag } from '../hooks/use-horizontal-drag';
import { ArrowRight, ArrowUpRight, Brush, ChevronLeft, ChevronRight, Globe2, History, Landmark, ScrollText, Ship, Shirt, Sparkles } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import { pair as p } from './content-types';
import { getAsset } from './content';
import { museumAsset, MuseumCredit, MuseumImage } from './museum-images';
import { Bilingual, choose, Credit } from './learning-ui';
import { cityAtlasPath } from './city-atlas-path';
import { categoryInfo, formatYear, historicalEvents, yearCoordinate } from './timeline-data';
import type { HistoricalEvent } from './timeline-types';

type Destination = 'tang' | 'places' | 'ming' | 'desk' | 'timeline' | 'poetry' | 'lesson';
type HubProps = { lang:Lang; onNavigate:(view:Destination,id?:string)=>void; onOpenEvent:(id:string)=>void };
const eventById = new Map(historicalEvents.map(event => [event.id,event]));

const shortTitles:Record<string,Pair>={
 'cn-sui-unification':p('隋统一南北','隋の統一'),'cn-sui-grand-canal':p('大运河','大運河'),'cj-ono-sui':p('小野妹子赴隋','小野妹子の遣隋'),
 'cj-pei-shiqing':p('裴世清赴倭','裴世清の来倭'),'cn-tang-foundation':p('唐朝建立','唐の成立'),'cj-first-tang-mission':p('首次遣唐使','最初の遣唐使'),
 'cn-xuanzang-return':p('玄奘归长安','玄奘の帰還'),'cj-dosho-xuanzang':p('道昭入唐','道昭の入唐'),'cj-baekgang':p('白江口之战','白村江の戦い'),
 'cn-wuzhou':p('武周建立','武周の成立'),'cj-landmark-heijokyo':p('平城京','平城京'),'cj-nakamaro-kibi-genbo':p('仲麻吕等留唐','仲麻呂らの留学'),
 'cj-ganjin-invitation':p('鉴真受邀','鑑真への招請'),'cj-ganjin-arrival':p('鉴真抵日','鑑真の来日'),'cn-an-lushan-rebellion':p('安史之乱','安史の乱'),
 'cj-toshodaiji-foundation':p('唐招提寺','唐招提寺'),'cn-two-tax-law':p('两税法','両税法'),'cj-landmark-heiankyo':p('平安京','平安京'),
 'cj-kukai-saicho-tang':p('空海、最澄入唐','空海・最澄の入唐'),'cj-landmark-qinglong-kukai':p('青龙寺受法','青龍寺での受法'),
 'cj-landmark-toji-kukai':p('空海与东寺','空海と東寺'),'cj-last-tang-voyage':p('遣唐使最后出航','遣唐使の最終航海'),'cn-diamond-sutra-print':p('雕版《金刚经》','版刻の金剛経'),
 'cj-894-suspension':p('停派当次遣唐使','遣唐使派遣の停止'),'cn-five-dynasties':p('唐亡与五代','唐の滅亡・五代'),
 'cn-ming-founded':p('明朝建立','明の成立'),'cj-tally-trade':p('勘合贸易','勘合貿易'),'cn-zhenghe-voyages':p('郑和航海','鄭和の航海'),'cn-forbidden-city':p('紫禁城营建','紫禁城の造営'),
 'cj-ningbo-incident':p('宁波争贡','寧波の争貢'),'cn-yuegang-opening':p('隆庆开海','隆慶の開海'),'cn-zhang-juzheng':p('张居正改革','張居正の改革'),'cn-bencao-publication':p('《本草纲目》','本草綱目'),
 'cj-hideyoshi-korea':p('秀吉侵朝','秀吉の朝鮮侵略'),'cn-ricci-worldmap':p('《坤舆万国全图》','坤輿万国全図'),'cn-tianxue-collection':p('《天学初函》','天学初函'),
 'cj-nagasaki-restrictions':p('唐船集中长崎','唐船の長崎集約'),'cn-ming-qing-transition':p('明清之际','明清交替'),'cj-yinyuan-arrival':p('隐元赴日','隠元の来日'),
 'cn-qing-sea-opening':p('康熙开海','康熙の開海'),'cj-tojin-yashiki':p('唐人屋敷','唐人屋敷'),'cj-books-1720':p('部分书禁放宽','洋書禁令の緩和'),
 'cn-grand-council':p('军机处定名','軍機処の定名'),'cn-qingming-scroll1736':p('清院本清明长卷','清院本の絵巻'),'cn-canton-trade1757':p('广州一口通商','広州一港での貿易'),
 'cn-siku-compilation':p('《四库全书》','四庫全書'),'cn-first-opium-war':p('鸦片战争','アヘン戦争'),'cn-jiangnan-arsenal':p('江南制造局','江南製造局'),
 'cj-treaty-1871':p('中日修好条规','日清修好条規'),'cj-sino-japanese-war':p('甲午战争','日清戦争'),'cn-hundred-days':p('戊戌变法','戊戌の変法'),
 'cn-xinhai-republic':p('辛亥与共和','辛亥革命と共和'),'cj-tongmenghui':p('东京同盟会','東京の同盟会'),'cj-normalization-1972':p('邦交正常化','国交正常化'),
 'cj-peace-treaty-1978':p('和平友好条约','平和友好条約'),'cn-reform-opening':p('改革开放','改革開放'),'cn-wto-accession':p('加入WTO','WTO加盟')
};

type AtlasPeriod = { id:string; title:Pair; bins:{ label:Pair; from:number; to:number }[]; ids:string[] };
const atlasPeriods:AtlasPeriod[]=[
 {id:'tang',title:p('隋唐 · 相遇','隋唐・出会い'),bins:[{label:p('隋代','隋'),from:581,to:617},{label:p('初唐','初唐'),from:618,to:689},{label:p('七世纪末至盛唐','7世紀末〜盛唐'),from:690,to:741},{label:p('鉴真的时代','鑑真の時代'),from:742,to:779},{label:p('长安与平安京','長安と平安京'),from:780,to:837},{label:p('晚唐及其后','晩唐とその後'),from:838,to:907}],ids:['cn-sui-unification','cn-sui-grand-canal','cj-ono-sui','cj-pei-shiqing','cn-tang-foundation','cj-first-tang-mission','cn-xuanzang-return','cj-dosho-xuanzang','cj-baekgang','cn-wuzhou','cj-landmark-heijokyo','cj-nakamaro-kibi-genbo','cj-ganjin-invitation','cj-ganjin-arrival','cn-an-lushan-rebellion','cj-toshodaiji-foundation','cn-two-tax-law','cj-landmark-heiankyo','cj-kukai-saicho-tang','cj-landmark-qinglong-kukai','cj-landmark-toji-kukai','cj-last-tang-voyage','cn-diamond-sutra-print','cj-894-suspension','cn-five-dynasties']},
 {id:'ming',title:p('明清 · 流动','明清・往来'),bins:[{label:p('明初','明初'),from:1368,to:1499},{label:p('海贸与改革','交易と改革'),from:1500,to:1599},{label:p('知识与港口','知識と港'),from:1600,to:1643},{label:p('明清之际','明清交替'),from:1644,to:1719},{label:p('清代书籍与制度','清の書物と制度'),from:1720,to:1799},{label:p('近代转折','近代への転換'),from:1800,to:1912}],ids:['cn-ming-founded','cj-tally-trade','cn-zhenghe-voyages','cn-forbidden-city','cj-ningbo-incident','cn-yuegang-opening','cn-zhang-juzheng','cn-bencao-publication','cj-hideyoshi-korea','cn-ricci-worldmap','cn-tianxue-collection','cj-nagasaki-restrictions','cn-ming-qing-transition','cj-yinyuan-arrival','cn-qing-sea-opening','cj-tojin-yashiki','cj-books-1720','cn-grand-council','cn-qingming-scroll1736','cn-canton-trade1757','cn-siku-compilation','cn-first-opium-war','cn-jiangnan-arsenal','cj-treaty-1871','cj-sino-japanese-war','cn-hundred-days','cn-xinhai-republic','cj-tongmenghui']},
 {id:'all',title:p('全景 · 年代','全体・年代'),bins:[{label:p('文明与先秦','文明と先秦'),from:-3500,to:-222},{label:p('秦汉至隋前','秦漢〜隋以前'),from:-221,to:580},{label:p('隋唐','隋唐'),from:581,to:907},{label:p('宋元','宋元'),from:908,to:1367},{label:p('明清','明清'),from:1368,to:1839},{label:p('近现代','近現代'),from:1840,to:2008}],ids:[]}
];

function EventSymbol({event}:{event:HistoricalEvent}){
 const Icon=event.category==='religion'?Landmark:event.category==='culture'?Brush:event.category==='technology'?Sparkles:event.category==='economy'?Ship:event.category==='conflict'?History:ScrollText;
 return <Icon size={14} aria-hidden="true"/>;
}

export function HomeAtlas({lang,onNavigate,onOpenEvent}:HubProps){
 const [period,setPeriod]=useState('tang');
 const rail=useRef<HTMLDivElement>(null);
 const railDrag=useHorizontalDrag<HTMLDivElement>(event=>{
  const element=event.currentTarget;
  if(event.pointerType==='touch'||element.scrollWidth<=element.clientWidth)return;
  const start=element.scrollLeft;
  return distance=>{element.scrollLeft=start-distance;};
 });
 const tx=(zh:string,ja:string)=>lang==='ja'?ja:zh;
 const current=atlasPeriods.find(item=>item.id===period)!;
 const eraWidth=(bin:AtlasPeriod['bins'][number])=>yearCoordinate(bin.to)-yearCoordinate(bin.from)+1;
 const selected=current.ids.length?current.ids.map(id=>eventById.get(id)).filter((event):event is HistoricalEvent=>!!event):current.bins.flatMap(bin=>['china','exchange'].flatMap(track=>{
   const pool=historicalEvents.filter(e=>e.track===track&&e.start>=bin.from&&e.start<=bin.to);
   const starred=pool.filter(e=>e.featured);
   const chosen=(starred.length>=2?starred:pool);
   return chosen.length>3?[chosen[0],chosen[Math.floor(chosen.length/2)],chosen[chosen.length-1]]:chosen;
 }));
 function changePeriod(id:string){setPeriod(id);rail.current?.scrollTo({left:0,behavior:'instant'});}
 return <section className="home-atlas content-width" aria-labelledby="home-atlas-title">
   <header className="hub-section-heading"><div><span className="hub-section-index"><History size={15}/>{tx('时间图谱','時代の図譜')}</span><h2 id="home-atlas-title">{tx('中国史与中日交流','中国史と日中交流')}</h2></div><div className="atlas-tabs" aria-label={tx('图谱时期','図譜の時代')}>{atlasPeriods.map(item=><button key={item.id} aria-pressed={period===item.id} onClick={()=>changePeriod(item.id)}>{choose(item.title,lang)}</button>)}</div></header>
   <div className="atlas-key"><span><i className="atlas-key-china"/>{tx('中国史','中国史')}</span><span><i className="atlas-key-exchange"/>{tx('中日交流','日中交流')}</span><small>{selected.length}{tx(' 个节点','件')}</small><div className="atlas-scroll-controls"><button onClick={()=>rail.current?.scrollBy({left:-500,behavior:'smooth'})} aria-label={tx('图谱向前浏览','前の範囲へ')}><ChevronLeft size={16}/></button><button onClick={()=>rail.current?.scrollBy({left:500,behavior:'smooth'})} aria-label={tx('图谱向后浏览','次の範囲へ')}><ChevronRight size={16}/></button></div></div>
   <div className="atlas-proportion" aria-label={tx('分期年代比例尺','年代の比例尺')}><div className="atlas-proportion-bar">{current.bins.map((bin,i)=><button key={bin.from} style={{flexGrow:eraWidth(bin),background:i%2===0?'var(--jade)':'var(--indigo)'}} aria-label={choose(bin.label,lang)+' '+formatYear(bin.from)+'–'+formatYear(bin.to)} title={choose(bin.label,lang)+' '+formatYear(bin.from)+'–'+formatYear(bin.to)} onClick={()=>{const el=rail.current;const cell=el?.querySelector<HTMLElement>('[data-era="'+bin.from+'"]');if(el&&cell)el.scrollTo({left:cell.offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>{eraWidth(bin)/current.bins.reduce((sum,item)=>sum+eraWidth(item),0)>.16&&<span>{formatYear(bin.from)}</span>}</button>)}</div><div className="atlas-proportion-label"><span>{formatYear(current.bins[0].from)}</span><span>{tx('年代比例尺','年代の比例尺')}</span><span>{formatYear(current.bins[current.bins.length-1].to)}</span></div></div>
   <div className="atlas-index-label">{tx('分期事件索引','時代別の出来事索引')}</div>
   <div className={"atlas-scroll drag-scroll"+(railDrag.isDragging?" is-dragging":"")} {...railDrag.handlers} ref={rail} tabIndex={0} aria-label={tx('历史分期图谱。按住拖动或横向滚动，点选事件可展开。','歴史図譜。ドラッグか横スクロールで移動し、項目を押して開きます。')}>
    <div className="atlas-grid">{current.bins.map((bin,index)=><div className="atlas-era" key={bin.from} data-era={bin.from}>
      <div className="atlas-era-heading"><span>{choose(bin.label,lang)}</span><small>{formatYear(bin.from)}—{formatYear(bin.to)}</small></div>
      {(['china','exchange'] as const).map(track=><div key={track} className={'atlas-lane atlas-lane-'+track}>{index===0&&<span className="atlas-lane-label">{track==='china'?tx('中国','中国'):tx('交流','交流')}</span>}{selected.filter(event=>event.track===track&&event.start>=bin.from&&event.start<=bin.to).sort((a,b)=>a.start-b.start).map(event=><button key={event.id} onClick={()=>onOpenEvent(event.id)} title={`${choose(event.date,lang)} · ${choose(event.title,lang)}`} aria-label={`${choose(event.date,lang)} ${choose(event.title,lang)}`}><span className="atlas-event-dot" style={{color:categoryInfo[event.category].dark}}><EventSymbol event={event}/></span><span><small>{formatYear(event.start)}</small><strong>{choose(shortTitles[event.id]||event.title,lang)}</strong></span><ArrowUpRight size={11}/></button>)}</div>)}
    </div>)}</div>
   </div>
   <footer className="atlas-footer"><div><button onClick={()=>onNavigate('timeline','exchange')}>{tx('中日交流全图','日中交流の全図')}<ArrowUpRight size={14}/></button><button onClick={()=>onNavigate('timeline','china')}>{tx('中国历史全图','中国史の全図')}<ArrowUpRight size={14}/></button></div></footer>
 </section>;
}

export function TangCultureModules({lang,onOpenEvent}:{lang:Lang;onOpenEvent:(id:string)=>void}){
 const tx=(zh:string,ja:string)=>lang==='ja'?ja:zh;
 const cards=[
  {id:'cn-tang-attire',title:p('读一件唐代衣装','唐代の衣装を読む'),sub:p('俑像 · 层次 · 材料','俑・重なり・史料'),image:'tang-attire-figurine',icon:Shirt,tone:'cinnabar'},
  {id:'cj-tang-robes',title:p('袍服与跨地域交流','袍と地域を越えた交流'),sub:p('服式 · 身份 · 借鉴','服式・身分・受容'),image:'tang-attire-brocade',icon:Globe2,tone:'jade'},
  {id:'cn-tang-poetry-farewell',title:p('在四句诗里远行','四句の詩を旅する'),sub:p('逐句观察 · 意象与视点','一行ずつ・イメージと視点'),image:'wangbo-manuscript',icon:Brush,tone:'ochre'},
  {id:'cj-bai-manuscript1107',title:p('白居易，怎样被阅读','白居易はどう読まれたか'),sub:p('抄写 · 训点 · 传授','書写・訓点・伝授'),image:'wangbo-manuscript',icon:ScrollText,tone:'indigo'}
 ];
 return <section className="culture-modules" aria-labelledby="culture-module-title"><header className="hub-section-heading"><div><span className="hub-section-index"><Sparkles size={15}/>{tx('唐代文化专题','唐の文化を読む')}</span><h2 id="culture-module-title">{tx('从衣装到诗行。','装いから、詩の一行へ。')}</h2></div></header><div className="culture-card-grid">{cards.map(card=>{const asset=getAsset(card.image);return <button key={card.id} className={'culture-card tone-'+card.tone} onClick={()=>onOpenEvent(card.id)}><div className={'culture-card-art '+(card.id.includes('poetry')?'poetry-art':'')}>
 {card.id.includes('poetry')?<><Brush size={38}/><span>孤帆远影<br/>碧空尽</span></>:card.id.includes('bai')?<><ScrollText size={38}/><span>白氏文集<br/><small>1107 → 1113</small></span></>:asset?<img src={asset.src} alt={choose(asset.alt,lang)} width={asset.width} height={asset.height} loading="lazy"/>:<card.icon size={58}/>}
 <span className="culture-art-icon"><card.icon size={19}/></span></div><div className="culture-card-copy"><h3>{choose(card.title,lang)}</h3><p>{choose(card.sub,lang)}</p><span>{tx('图解与深读','図と本文へ')}<ArrowRight size={16}/></span></div></button>;})}</div><div className="culture-credits">{['tang-attire-figurine','tang-attire-brocade'].map(id=>{const image=getAsset(id);return image?<Credit key={id} asset={image} lang={lang}/>:null;})}</div></section>;
}

export function HomeHub({lang,onNavigate,onOpenEvent}:HubProps){
 const tx=(zh:string,ja:string)=>lang==='ja'?ja:zh;
 const hero=getAsset('qinglong')!;
 const eras=[
  {id:'tang',title:p('隋唐','隋唐'),years:'581–907',image:'met-tang-camel',view:'tang' as const},
  {id:'song',title:p('宋元与海上交流','宋元と海上交流'),years:'908–1367',image:'met-longquan-bowl',view:'timeline' as const},
  {id:'ming',title:p('明清','明清'),years:'1368–1912',image:'met-nagasaki-ships',view:'ming' as const}
 ];
 const cities=[
  {id:'xian',title:p('西安','西安'),image:'wild-goose-pagoda'},
  {id:'beijing',title:p('北京','北京'),image:'forbidden-city'},
  {id:'kyoto',title:p('京都','京都'),image:'kiyomizu'}
 ];
 const imageIds=Array.from(new Set([hero.id,...eras.map(e=>e.image),...cities.map(c=>c.image),'met-willow-boat']));
 return <div className="home-hub editorial-home">
  <section className="hub-hero content-width">
   <div className="hub-hero-copy">
    <h1><Bilingual value={p('跨海的历史','海をわたる歴史')} lang={lang}/></h1>
    <p><Bilingual value={p('从长安到京都，循着人物、寺院、书籍与器物，阅读中日交流的历史。','長安から京都へ。人、寺院、書物、器物を通して日中交流の歴史を読む。')} lang={lang}/></p>
    <div className="hub-hero-actions"><button className="hub-primary" onClick={()=>onNavigate('lesson','tang-kukai-network')}>{tx('从青龙寺开始','青龍寺から始める')}<ArrowRight size={17}/></button></div>
   </div>
   <figure className="editorial-hero-image"><img src={hero.src} width={hero.width} height={hero.height} alt={choose(hero.alt,lang)} fetchPriority="high"/><figcaption><Bilingual value={hero.title} lang={lang}/><span className="editorial-caption"><Bilingual value={hero.caption} lang={lang}/></span><Credit asset={hero} lang={lang}/></figcaption></figure>
  </section>
  <section className="editorial-gallery content-width" aria-labelledby="era-gallery-title">
   <header className="hub-section-heading"><h2 id="era-gallery-title">{tx('时代画廊','時代をめぐる')}</h2><button className="text-button" onClick={()=>onNavigate('timeline')}>{tx('完整时间线','すべての年表')}<ArrowRight size={16}/></button></header>
   <div className="editorial-grid">{eras.map(era=>{const museum=museumAsset(era.image);const asset=getAsset(era.image);return <button key={era.id} className="editorial-tile" data-image={era.image} onClick={()=>era.id==='song'?onNavigate('timeline','exchange/period-song-yuan'):onNavigate(era.view)}>{museum?<MuseumImage key={museum.id} asset={museum} lang={lang}/>:asset&&<img src={asset.src} width={asset.width} height={asset.height} alt={choose(asset.alt,lang)} loading="lazy"/>}<div><small>{era.years}</small><h3><Bilingual value={era.title} lang={lang}/></h3><span className="editorial-caption">{choose((museum??asset)!.title,lang)}</span><ArrowUpRight size={18}/></div></button>;})}</div>
  </section>
  <section className="editorial-gallery content-width" aria-labelledby="city-gallery-title">
   <header className="hub-section-heading"><h2 id="city-gallery-title">{tx('城市与诗词','都市と詩詞')}</h2><a className="text-button" href={cityAtlasPath(lang)}>{tx('城市探索','都市探索')}<ArrowRight size={16}/></a></header>
   <div className="editorial-grid editorial-city-grid">{cities.map(city=>{const asset=getAsset(city.image)!;const body=<><img src={asset.src} width={asset.width} height={asset.height} alt={choose(asset.alt,lang)} loading="lazy"/><div><h3><Bilingual value={city.title} lang={lang}/></h3><ArrowUpRight size={18}/></div></>;return city.id==='kyoto'?<button key={city.id} className="editorial-tile" data-image={city.image} onClick={()=>onNavigate('places','kyoto')}>{body}</button>:<a key={city.id} className="editorial-tile" data-image={city.image} href={cityAtlasPath(lang,'city/'+city.id)}>{body}</a>;})}
   <button className="editorial-tile" data-image="met-willow-boat" onClick={()=>onNavigate('poetry')}><MuseumImage asset={museumAsset('met-willow-boat')!} lang={lang}/><div><h3>{tx('古诗词','中国の詩詞')}</h3><ArrowUpRight size={18}/></div></button></div>
  </section>
  <details className="editorial-atlas content-width"><summary>{tx('历史时间图谱','歴史図譜')}</summary><HomeAtlas lang={lang} onNavigate={onNavigate} onOpenEvent={onOpenEvent}/></details>
  <div className="hub-bottom content-width"><details className="hub-image-credits"><summary>{tx('图像来源','画像の出典')}</summary><div>{imageIds.map(id=>{const asset=getAsset(id);const museum=museumAsset(id);return asset?<div key={id}><strong>{choose(asset.title,lang)}</strong><Credit asset={asset} lang={lang}/></div>:museum?<div key={id}><strong>{choose(museum.title,lang)}</strong><MuseumCredit asset={museum} lang={lang}/></div>:null;})}</div></details></div>
 </div>;
}
