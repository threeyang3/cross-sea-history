"use client";

import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Brush, Building2, ChevronLeft, ChevronRight, Compass, FileText, Globe2, History, Image as ImageIcon, Landmark, MapPin, NotebookPen, ScrollText, Ship, Shirt, Sparkles } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import { pair as p } from './content-types';
import { getAsset } from './content';
import { Bilingual, choose, Credit } from './learning-ui';
import { cityAtlasPath } from './city-atlas-path';
import { categoryInfo, formatYear, historicalEvents } from './timeline-data';
import type { HistoricalEvent } from './timeline-types';

type Destination = 'tang' | 'places' | 'ming' | 'desk' | 'timeline' | 'poetry';
type HubProps = { lang:Lang; onNavigate:(view:Destination,id?:string)=>void; onOpenEvent:(id:string)=>void };
const eventById = new Map(historicalEvents.map(event => [event.id,event]));
const topics = [
  { id:'attire', title:p('衣冠与日常','装いと日常'), sub:p('读懂一件唐代衣装','唐代の衣装を読む'), icon:Shirt, tone:'cinnabar', image:'tang-attire-figurine', event:'cn-tang-attire' },
  { id:'poetry', title:p('古诗词选读','中国の詩詞を読む'), sub:p('唐诗、宋词、明清诗词','唐詩・宋詞・明清の詩詞'), icon:Brush, tone:'ochre', image:'wangbo-manuscript', view:'poetry' as Destination },
  { id:'voyages', title:p('渡海与求学','渡海と学び'), sub:p('使节、僧侣与书籍','使節・僧侶・書物'), icon:Ship, tone:'indigo', image:'toshodaiji', event:'cj-first-tang-mission' },
  { id:'cities', title:p('城市与寺院','都市と寺院'), sub:p('长安 · 青龙寺 · 京都','長安・青龍寺・京都'), icon:Landmark, tone:'jade', image:'qinglong', view:'places' as Destination },
  { id:'ming', title:p('明清书房','明清の書斎'), sub:p('制度、海贸与生活','制度・交易・暮らし'), icon:BookOpen, tone:'plum', image:'qingming-detail', view:'ming' as Destination },
  { id:'desk', title:p('史料与摘记','史料とノート'), sub:p('观察 · 查证 · 留下想法','観察・確認・自分の言葉'), icon:NotebookPen, tone:'slate', image:'toban-cargo-ledger', view:'desk' as Destination }
];

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
 const tx=(zh:string,ja:string)=>lang==='ja'?ja:zh;
 const current=atlasPeriods.find(item=>item.id===period)!;
 const selected=current.ids.length?current.ids.map(id=>eventById.get(id)).filter((event):event is HistoricalEvent=>!!event):current.bins.flatMap(bin=>['china','exchange'].flatMap(track=>{
   const pool=historicalEvents.filter(e=>e.track===track&&e.start>=bin.from&&e.start<=bin.to);
   const starred=pool.filter(e=>e.featured);
   const chosen=(starred.length>=2?starred:pool);
   return chosen.length>3?[chosen[0],chosen[Math.floor(chosen.length/2)],chosen[chosen.length-1]]:chosen;
 }));
 function changePeriod(id:string){setPeriod(id);rail.current?.scrollTo({left:0,behavior:'instant'});}
 return <section className="home-atlas content-width" aria-labelledby="home-atlas-title">
   <header className="hub-section-heading"><div><span className="hub-section-index"><History size={15}/>02 · {tx('时间图谱','時代の図譜')}</span><h2 id="home-atlas-title">{tx('两条历史，一眼相连。','二つの歴史を、ひと目で。')}</h2></div><div className="atlas-tabs" aria-label={tx('图谱时期','図譜の時代')}>{atlasPeriods.map(item=><button key={item.id} aria-pressed={period===item.id} onClick={()=>changePeriod(item.id)}>{choose(item.title,lang)}</button>)}</div></header>
   <div className="atlas-key"><span><i className="atlas-key-china"/>{tx('中国史','中国史')}</span><span><i className="atlas-key-exchange"/>{tx('中日交流','日中交流')}</span><small>{selected.length}{tx(' 个精选节点 · 点选展开','の出来事・押して詳しく')}</small><div className="atlas-scroll-controls"><button onClick={()=>rail.current?.scrollBy({left:-500,behavior:'smooth'})} aria-label={tx('图谱向前浏览','前の範囲へ')}><ChevronLeft size={16}/></button><button onClick={()=>rail.current?.scrollBy({left:500,behavior:'smooth'})} aria-label={tx('图谱向后浏览','次の範囲へ')}><ChevronRight size={16}/></button></div></div>
   <div className="atlas-scroll" ref={rail} tabIndex={0} aria-label={tx('可横向浏览的历史分期图谱','横にスクロールできる歴史図譜')}>
    <div className="atlas-grid">{current.bins.map((bin,index)=><div className="atlas-era" key={bin.from}>
      <div className="atlas-era-heading"><span>{choose(bin.label,lang)}</span><small>{formatYear(bin.from)}—{formatYear(bin.to)}</small></div>
      {(['china','exchange'] as const).map(track=><div key={track} className={'atlas-lane atlas-lane-'+track}>{index===0&&<span className="atlas-lane-label">{track==='china'?tx('中国','中国'):tx('交流','交流')}</span>}{selected.filter(event=>event.track===track&&event.start>=bin.from&&event.start<=bin.to).sort((a,b)=>a.start-b.start).map(event=><button key={event.id} onClick={()=>onOpenEvent(event.id)} title={`${choose(event.date,lang)} · ${choose(event.title,lang)}`} aria-label={`${choose(event.date,lang)} ${choose(event.title,lang)}`}><span className="atlas-event-dot" style={{color:categoryInfo[event.category].dark}}><EventSymbol event={event}/></span><span><small>{formatYear(event.start)}</small><strong>{choose(shortTitles[event.id]||event.title,lang)}</strong></span><ArrowUpRight size={11}/></button>)}</div>)}
    </div>)}</div>
   </div>
   <footer className="atlas-footer"><p>{tx('分期示意；栏宽不代表年代长度。','時代区分の図。列幅は年数を表しません。')}</p><div><button onClick={()=>onNavigate('timeline','exchange')}>{tx('中日交流全图','日中交流の全図')}<ArrowUpRight size={14}/></button><button onClick={()=>onNavigate('timeline','china')}>{tx('中国历史全图','中国史の全図')}<ArrowUpRight size={14}/></button></div></footer>
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
 const temple=getAsset('kiyomizu')!;
 const attire=getAsset('tang-attire-figurine');
 const manuscript=getAsset('wangbo-manuscript')!;
 const imageIds=Array.from(new Set(['kiyomizu','tang-attire-figurine',...topics.map(item=>item.image),'daming','qinglong','toji','forbidden-city']));
 return <div className="home-hub">
  <section className="hub-hero content-width">
   <div className="hub-hero-copy"><div className="hub-kicker"><span>中</span><i/><span>日</span><small>{tx('双语历史学习馆','二言語で学ぶ歴史')}</small></div><h1>{tx('从长安，','長安から、')}<br/>{tx('看见更大的世界。','広がる世界へ。')}</h1><p>{tx('选一个主题，让图像、诗句与史料带路。','テーマを選び、画像・詩・史料をたどる。')}</p><div className="hub-hero-actions"><button className="hub-primary" onClick={()=>onNavigate('tang')}>{tx('探索唐代','唐代をめぐる')}<ArrowRight size={17}/></button><button className="hub-secondary" onClick={()=>document.getElementById('home-atlas-title')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}><History size={17}/>{tx('打开时间图谱','時代の図譜へ')}</button></div><div className="hub-stats"><span><History size={16}/><b>2</b>{tx('条时间线','つの年表')}</span><span><BookOpen size={16}/><b>{historicalEvents.length}</b>{tx('篇专题','の記事')}</span><span><ImageIcon size={16}/>{tx('图像 × 史料','図像 × 史料')}</span></div></div>
   <div className="hub-hero-art" aria-label={tx('衣装、寺院与书籍的主题拼贴','衣装・寺院・書物のテーマコラージュ')}>
    <div className="hub-art-circle"/><svg className="hub-art-route" viewBox="0 0 600 440" fill="none" aria-hidden="true"><path d="M70 350C180 350 155 105 300 150S455 355 540 105" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7"/><circle cx="70" cy="350" r="5" fill="currentColor"/><circle cx="540" cy="105" r="5" fill="currentColor"/></svg>
    <figure className="hub-photo-main"><img src={temple.src} width={temple.width} height={temple.height} alt={choose(temple.alt,lang)} fetchPriority="high"/><figcaption><MapPin size={13}/>{tx('京都 · 清水寺','京都・清水寺')}</figcaption></figure>
    <button className="hub-float-art hub-float-attire" onClick={()=>onOpenEvent('cn-tang-attire')} aria-label={tx('进入唐代服饰专题','唐代衣装のテーマへ')}>{attire?<img src={attire.src} width={attire.width} height={attire.height} alt={choose(attire.alt,lang)}/>:<Shirt size={66}/>}<span><Shirt size={12}/>{tx('衣冠','装い')}<ArrowUpRight size={12}/></span></button>
    <button className="hub-float-art hub-float-poem" onClick={()=>onOpenEvent('cn-tang-poetry-farewell')} aria-label={tx('进入唐诗意象专题','唐詩のイメージのテーマへ')}><small>唐 詩</small><strong>惟见长江<br/>天际流</strong><span><Brush size={13}/>{tx('读诗，看远方','詩から遠くへ')}<ArrowUpRight size={12}/></span></button>
    <div className="hub-art-badge"><Ship size={21}/><span>{tx('长安','長安')}<i>↔</i>{tx('京都','京都')}</span></div>
   </div>
  </section>
  <section className="hub-topics content-width" aria-labelledby="hub-topics-title"><header className="hub-compact-heading"><h2 id="hub-topics-title">{tx('今天，从哪里开始？','今日は、どこから？')}</h2><span>{tx('选一个入口','入口を選ぶ')}<Compass size={14}/></span></header><div className="hub-topic-grid">{topics.map(topic=>{const asset=getAsset(topic.image);return <button className={'hub-topic tone-'+topic.tone} key={topic.id} onClick={()=>topic.event?onOpenEvent(topic.event):onNavigate(topic.view!)}><div className="hub-topic-visual">{asset&&<img src={asset.src} width={asset.width} height={asset.height} alt="" loading="lazy"/>}<topic.icon size={25}/></div><div className="hub-topic-copy"><h3>{choose(topic.title,lang)}</h3><span>{choose(topic.sub,lang)}</span></div><ArrowUpRight size={15}/></button>;})}</div></section>
  <section className="hub-cities content-width" aria-labelledby="hub-cities-title">
   <header className="hub-compact-heading">
    <h2 id="hub-cities-title">{tx('城市探索','都市をめぐる')}</h2>
   </header>
   <div className="hub-city-grid">
    {[
      {id:'xian', title:p('西安','西安'), summary:p('长安、青龙寺与求法之路','長安・青龍寺・求法の道'), image:'qinglong', tone:'jade'},
      {id:'beijing', title:p('北京','北京'), summary:p('古都空间、战争记忆与战后交流','古都の空間・戦争の記憶・戦後交流'), image:'forbidden-city', tone:'cinnabar'}
    ].map(city=>{
      const asset=getAsset(city.image)!;
      return <a key={city.id} className={'hub-path tone-'+city.tone} href={cityAtlasPath(lang,'city/'+city.id)}>
       <img src={asset.src} alt="" width={asset.width} height={asset.height} loading="lazy"/>
       <div><MapPin size={21}/><h3>{choose(city.title,lang)}</h3><Bilingual value={city.summary} lang={lang}/><ArrowUpRight size={19}/></div>
      </a>;
    })}
   </div>
  </section>
  <HomeAtlas lang={lang} onNavigate={onNavigate} onOpenEvent={onOpenEvent}/>
  <section className="hub-paths content-width" aria-labelledby="hub-path-title"><header className="hub-section-heading"><div><span className="hub-section-index"><Compass size={15}/>03 · {tx('学习路线','学びのルート')}</span><h2 id="hub-path-title">{tx('沿着一个线索走。','一つの手がかりをたどる。')}</h2></div></header><div className="hub-path-grid">
   <button className="hub-path tone-jade" onClick={()=>onNavigate('places')}><img src={getAsset('qinglong')!.src} alt="" loading="lazy"/><div><MapPin size={23}/><h3>{tx('城市与寺院','都市と寺院')}</h3><span>{tx('长安 → 青龙寺 → 京都','長安 → 青龍寺 → 京都')}</span><ArrowUpRight size={19}/></div></button>
   <button className="hub-path tone-ochre" onClick={()=>onOpenEvent('cj-bai-manuscript1107')}><img src={manuscript.src} alt="" loading="lazy"/><div><ScrollText size={23}/><h3>{tx('书籍的跨海旅行','書物の海を越える旅')}</h3><span>{tx('写作 → 抄写 → 阅读','執筆 → 書写 → 読解')}</span><ArrowUpRight size={19}/></div></button>
   <button className="hub-path tone-plum" onClick={()=>onNavigate('ming')}><img src={getAsset('forbidden-city')!.src} alt="" loading="lazy"/><div><BookOpen size={23}/><h3>{tx('明清，另一扇窗','明清への、もう一つの窓')}</h3><span>{tx('制度 → 城市 → 海贸','制度 → 都市 → 海上交易')}</span><ArrowUpRight size={19}/></div></button>
  </div></section>
  <div className="hub-bottom content-width"><span><NotebookPen size={16}/>{tx('看见 → 查证 → 写下理解','見る → 確かめる → 言葉にする')}</span><button onClick={()=>onNavigate('desk')}>{tx('去我的学习桌','学習ノートへ')}<ArrowRight size={15}/></button><details className="hub-image-credits"><summary>{tx('图像来源','画像の出典')}</summary><div>{imageIds.map(id=>{const asset=getAsset(id);return asset?<div key={id}><strong>{choose(asset.title,lang)}</strong><Credit asset={asset} lang={lang}/></div>:null;})}</div></details></div>
 </div>;
}
