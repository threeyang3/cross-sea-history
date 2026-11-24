"use client";

import { useId, useState, type CSSProperties } from 'react';
import { ArrowUpRight, BookOpen, Building2, Coins, FileCheck2, FileText, GraduationCap, Landmark, Layers3, MapPin, Network, Palette, ScrollText, Search, Ship, Shirt, Stamp, Waves } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import visualData from './data/learning-visuals.json';
import extraVisualData from './data/learning-visuals-extra.json';
import { GeographicDiagram, ProcessDiagram, ComparisonDiagram } from './historical-diagrams';
import type { DiagramNode, DiagramEdge, DiagramMatrix } from './historical-diagrams';
import './learning-visuals.css';

type Visual = { id: string; eventIds: string[]; kind: string; title: Pair; subtitle: Pair; caution: Pair; nodes: DiagramNode[]; edges?: DiagramEdge[]; matrix?: DiagramMatrix; sources: { title: Pair; url: string }[] };
const visuals:Visual[] = [...(visualData as Visual[]),...(extraVisualData as unknown as Visual[])];
const tones = ['#b34f3b', '#3f6484', '#357c70', '#a77b2d'];
const fills = ['#fae4dc', '#e4edf5', '#e0f0e8', '#f6edcf'];
const icons = { book: BookOpen, temple: Landmark, place: MapPin, ship: Ship, paper: FileText, stamp: Stamp, study: GraduationCap, coins: Coins, layers: Layers3, search: Search, palette: Palette, scroll: ScrollText, building: Building2, clothes: Shirt, check: FileCheck2, network: Network, wave: Waves };
const text = (v: Pair, lang: Lang) => lang === 'ja' ? v.ja : v.zh;
function Dual({ value, lang }: { value: Pair; lang: Lang }) { return <>{lang !== 'ja' && <span lang="zh-Hans">{value.zh}</span>}{lang === 'ja' && <span lang="ja">{value.ja}</span>}{lang === 'bi' && <span className="lv-ja" lang="ja">{value.ja}</span>}</>; }
function Icon({ name, size = 23 }: { name?: string; size?: number }) { const Component = icons[(name || 'paper') as keyof typeof icons] || FileText; return <Component width={size} height={size} strokeWidth={1.65} />; }

function CityDrawing({ mode, selected, onSelect, uid }: { mode: string; selected: number; onSelect: (i: number) => void; uid:string }) {
  const heian = mode === 'city-heian';
  return <svg viewBox="0 0 720 270" className="lv-svg lv-city-svg" aria-hidden="true">
    <defs><pattern id={`lv-grid-${uid}`} width="32" height="30" patternUnits="userSpaceOnUse"><path d="M32 0H0V30" fill="none" stroke="#c6d2cc" strokeWidth="1.5"/></pattern></defs>
    <path d="M682 42V17m-5 8 5-8 5 8" stroke="#71877b" fill="none" strokeWidth="1.5"/><text x="677" y="13" fontSize="10" fill="#71877b">N</text>
    {heian ? <>
      <path d="M100 241C90 171 102 73 129 39C147 11 242 14 271 45" fill="none" stroke="#cbd8be" strokeWidth="15"/>
      <path d="M515 20C569 40 575 90 547 135S549 210 590 249" fill="none" stroke="#c7dce4" strokeWidth="15"/>
      <rect x="178" y="39" width="364" height="192" rx="2" fill="#f6f5ea" stroke="#80988b" strokeWidth="2"/>
      <rect x="178" y="39" width="364" height="192" fill={`url(#lv-grid-${uid})`}/>
      <path d="M358 68V232" stroke="#bd6650" strokeWidth="9" opacity=".72"/>
      <g onClick={()=>onSelect(0)} className="lv-svg-action"><rect x="299" y="25" width="122" height="49" rx="4" fill={selected===0?'#b34f3b':'#c98570'}/><path d="M306 35H414M320 28V65M346 28V65M374 28V65M400 28V65" stroke="#fff4e9" opacity=".55"/><circle cx="360" cy="48" r="13" fill="#fffaf0"/><text x="357" y="52" fontSize="12" fill="#a74832">1</text></g>
      <g onClick={()=>onSelect(1)} className="lv-svg-action"><path d="M185 90Q222 77 273 109T331 184V226H184Z" fill={selected===1?'#a9cfdb':'#cbe0e4'} opacity=".85"/><path d="M197 116q18-12 36 0t36 0m-64 30q18-12 36 0t36 0m-49 32q18-12 36 0t36 0" fill="none" stroke="#7daaba" strokeWidth="2"/><circle cx="247" cy="143" r="15" fill="#fffaf0"/><text x="243" y="148" fontSize="12" fill="#416d82">2</text></g>
      <g onClick={()=>onSelect(2)} className="lv-svg-action"><rect x="380" y="88" width="141" height="134" rx="4" fill={selected===2?'#abcdb6':'#d3e3ce'} opacity=".75"/><path d="M390 115H513M390 146H513M390 177H513M419 94V214M452 94V214M485 94V214" stroke="#7eab8b" opacity=".6"/><circle cx="452" cy="145" r="15" fill="#fffaf0"/><text x="448" y="150" fontSize="12" fill="#357c70">3</text></g>
      <g onClick={()=>onSelect(3)} className="lv-svg-action"><rect x="301" y="201" width="27" height="23" fill="#b4944f"/><rect x="389" y="201" width="27" height="23" fill="#b4944f"/><path d="M327 219L359 247L391 219" stroke="#b4944f" fill="none" strokeDasharray="4 4"/><circle cx="359" cy="247" r="13" fill="#f3e3b7" stroke="#a77b2d"/><text x="355" y="251" fontSize="12" fill="#806026">4</text></g>
    </> : <>
      {[0,1,2].map((i)=><g key={i} className="lv-svg-action" onClick={()=>onSelect(i)} transform={`translate(${42+i*230},25)`}>
        <rect x="0" y="0" width="180" height="212" rx="4" fill={selected===i?fills[i]:'#f4f4e9'} stroke={selected===i?tones[i]:'#bdcbbf'} strokeWidth={selected===i?2.5:1.5}/>
        <rect x="13" y="47" width="154" height="151" fill={`url(#lv-grid-${uid})`}/>
        <rect x="53" y="12" width="74" height="39" rx="2" fill={tones[i]} opacity=".72"/>
        <path d="M90 51V200" stroke={tones[i]} strokeWidth="6" opacity=".7"/>
        {i===1&&<path d="M181 67H204V158H181" fill="#dae5e9" stroke="#6d94a7" strokeWidth="2"/>}
        {i===2&&<path d="M17 65q36 9 39 65t-39 65" fill="#c5dfe2" opacity=".8"/>}
        <circle cx="91" cy="31" r="13" fill="#fffcf3"/><text x="87" y="35" fontSize="12" fill={tones[i]}>{i+1}</text>
      </g>)}
    </>}
  </svg>;
}

function AttireDrawing({ selected, onSelect }: { selected: number; onSelect: (i:number)=>void }) {
  const items=[<path key="shirt" d="M-25-40-59-15-45 12-28 0-27 51H27L28 0 45 12 59-15 25-40 0-26Z"/>,<path key="skirt" d="M-28-45H28L56 50Q0 65-56 50Z M-15-44-32 52M0-44V56M15-44 32 52"/>,<path key="hanpi" d="M-25-36-53-17-42 7-25-3-25 44H25L25-3 42 7 53-17 25-36 0-21Z M0-21V44"/>,<path key="ribbon" d="M-58-28Q-20-51 7-21T51 34L39 55Q7 42-3 2T-53-6Z"/>];
  return <svg viewBox="0 0 720 230" className="lv-svg lv-attire-svg" aria-hidden="true">
    {items.map((item,i)=><g key={i} transform={`translate(${90+i*180},108)`} className="lv-svg-action" onClick={()=>onSelect(i)}>
      <circle r="73" fill={selected===i?fills[i]:'#f4f1e8'} stroke={selected===i?tones[i]:'#e0ddd1'} strokeWidth="2"/>
      <g fill={fills[i]} stroke={tones[i]} strokeWidth="2.5" strokeLinejoin="round">{item}</g>
      <circle cy="83" r="12" fill={tones[i]}/><text y="87" textAnchor="middle" fontSize="11" fill="white">{i+1}</text>
    </g>)}
  </svg>;
}

function PoemDrawing({ selected, onSelect }: { selected: number; onSelect: (i:number)=>void }) {
  return <svg viewBox="0 0 720 248" className="lv-svg lv-poem-svg" aria-hidden="true">
    <defs><linearGradient id="lv-poem-sky" x2="0" y2="1"><stop stopColor="#f7edd5"/><stop offset="1" stopColor="#eef4ee"/></linearGradient></defs>
    <rect width="720" height="248" rx="4" fill="url(#lv-poem-sky)"/>
    <circle cx="558" cy="57" r="27" fill="#d9bb72" opacity=".55"/>
    <path d="M0 153Q71 126 142 151T285 150Q366 105 435 131T579 121T720 94V248H0Z" fill="#d1dfd4"/>
    <path d="M0 203Q106 156 238 187T455 174Q594 131 720 141V248H0Z" fill="#7fa6b5" opacity=".6"/>
    <path d="M105 225Q259 198 393 211T697 161M272 232Q443 213 585 191M453 182Q564 165 669 153" fill="none" stroke="#f7faf2" strokeWidth="2" opacity=".8"/>
    <g transform="translate(92 133)" onClick={()=>onSelect(0)} className="lv-svg-action" opacity={selected===0?1:.75}><path d="M-43 4H43L28-7H-28ZM-31-15H31L21-26H-21ZM-20-35H20L0-53Z" fill="#9e5842"/><path d="M-24 4V36M0 4V36M24 4V36M-17-15V-1M17-15V-1M-10-35V-20M10-35V-20" stroke="#7f513e" strokeWidth="4"/><path d="M-33 36H33" stroke="#7f513e" strokeWidth="5"/><circle cy="64" r="13" fill="#fff9ed" stroke="#b34f3b"/><text y="68" textAnchor="middle" fontSize="11" fill="#b34f3b">1</text></g>
    <g transform="translate(246 137)" onClick={()=>onSelect(1)} className="lv-svg-action"><path d="M-22 20Q-11-12-30-33M-11 2Q16-17 24-35M-3 28Q27 3 39 4" stroke="#98a77a" fill="none" strokeWidth="2"/>{[-28,-11,20,35].map((x,i)=><circle key={x} cx={x} cy={[-27,3,-30,5][i]} r={selected===1?10:7} fill={i%2?'#d88d74':'#d9aa87'} opacity=".8"/>)}<circle cy="64" r="13" fill="#fff9ed" stroke="#a77b2d"/><text y="68" textAnchor="middle" fontSize="11" fill="#a77b2d">2</text></g>
    <g opacity={selected === 3 ? .12 : selected === 2 ? 1 : .6} transform={`translate(${selected===2?462:490},142)`} onClick={()=>onSelect(2)} className="lv-svg-action"><path d="M-17 15H22L12 24H-7Z" fill="#506b75"/><path d="M2 14V-29M0-28-19 10H0ZM5-23 23 9H5Z" fill="#fff9e9" stroke="#627f87" strokeWidth="1.5"/><circle cy="61" r="13" fill="#fff9ed" stroke="#3f6484"/><text y="65" textAnchor="middle" fontSize="11" fill="#3f6484">3</text></g>
    <g onClick={()=>onSelect(3)} className="lv-svg-action"><path d="M566 146Q618 129 686 128" stroke={selected===3?'#357c70':'#92b5b2'} fill="none" strokeWidth="3"/><circle cx="645" cy="201" r="13" fill="#fff9ed" stroke="#357c70"/><text x="645" y="205" textAnchor="middle" fontSize="11" fill="#357c70">4</text></g>
  </svg>;
}

function Diagram({ visual, lang, selected, onSelect, uid }: { visual: Visual; lang: Lang; selected: number; onSelect: (i:number)=>void; uid: string }) {
  if(visual.kind.startsWith('city-')) return <CityDrawing mode={visual.kind} selected={selected} onSelect={onSelect} uid={uid}/>;
  if(visual.kind==='geo-map') return <GeographicDiagram nodes={visual.nodes} edges={visual.edges??[]} lang={lang} selected={selected} onSelect={onSelect}/>;
  if(visual.kind==='process') return <ProcessDiagram nodes={visual.nodes} lang={lang} selected={selected} onSelect={onSelect}/>;
  if(visual.kind==='matrix'&&visual.matrix) return <ComparisonDiagram nodes={visual.nodes} matrix={visual.matrix} lang={lang} selected={selected} onSelect={onSelect}/>;
  if(visual.kind==='attire') return <AttireDrawing selected={selected} onSelect={onSelect}/>;
  if(visual.kind==='poem') return <PoemDrawing selected={selected} onSelect={onSelect}/>;
  const positions=visual.nodes.map((node,i)=>({x:node.x??(80+i*(560/Math.max(1,visual.nodes.length-1))),y:node.y??128}));
  const edges: { from: number; to: number; dashed?: boolean }[]=visual.edges??visual.nodes.slice(1).map((_,i)=>({from:i,to:i+1}));
  const layered=visual.kind==='layers';
  return <svg viewBox="0 0 720 300" className={'lv-svg lv-'+visual.kind+'-svg'} aria-hidden="true">
    <defs><marker id={uid} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="m1 1 7 4-7 4" fill="none" stroke="#9daaa2" strokeWidth="1.7"/></marker></defs>
    {visual.kind==='journey'&&<><path d="M0 199Q90 172 180 199T360 199T540 199T720 199V275H0Z" fill="#deebec"/><path d="M12 217q45-18 90 0t90 0t90 0t90 0t90 0t90 0t90 0" fill="none" stroke="#b9d1d9"/><path d="M16 236q45-18 90 0t90 0t90 0t90 0t90 0t90 0t90 0" fill="none" stroke="#c5d9df"/></>}
    {visual.kind==='dual'&&<><rect x="20" y="29" width="680" height="100" rx="8" fill="#f7e9e1"/><rect x="20" y="166" width="680" height="100" rx="8" fill="#e6efef"/></>}
    {visual.kind==='comparison'&&<><rect x="18" y="19" width="320" height="262" rx="8" fill="#faebe1"/><rect x="382" y="19" width="320" height="262" rx="8" fill="#e6edf2"/><path d="M360 38V263" stroke="#bfc9c3" strokeDasharray="3 6"/></>}
    {visual.kind==='dimensions'&&<><path d="M226 90L310 133M494 90L410 133M226 210L310 167M494 210L410 167" stroke="#bac6bc" strokeWidth="1.5" strokeDasharray="4 5"/>{Array.from({length:7},(_,i)=><g key={i}><path d={`M${319+i*13} 112V190`} stroke={i%2?'#aebfc9':'#c48c69'} strokeWidth="7"/><path d={`M317 ${114+i*12}H404`} stroke={i%2?'#d5bb7c':'#7da396'} strokeWidth="5" opacity=".65"/></g>)}</>}
    {layered&&visual.nodes.map((node,i)=><path key={node.id} d={`M50 ${i*59+35}H668l-16 30H34Z`} fill={fills[i%4]} opacity=".55"/>)}
    {edges.map((edge,i)=>{const a=positions[edge.from],b=positions[edge.to];if(!a||!b)return null;const dx=b.x-a.x,dy=b.y-a.y;const horizontal=Math.abs(dx)>Math.abs(dy);const sx=a.x+(horizontal?Math.sign(dx)*64:0),sy=a.y+(!horizontal?Math.sign(dy)*33:0),ex=b.x-(horizontal?Math.sign(dx)*72:0),ey=b.y-(!horizontal?Math.sign(dy)*40:0);return <path key={i} d={horizontal?`M${sx} ${sy}C${(sx+ex)/2} ${sy},${(sx+ex)/2} ${ey},${ex} ${ey}`:`M${sx} ${sy}C${sx} ${(sy+ey)/2},${ex} ${(sy+ey)/2},${ex} ${ey}`} fill="none" stroke="#a9b6ac" strokeWidth="1.8" strokeDasharray={edge.dashed?'5 5':undefined} markerEnd={visual.kind==='network'?undefined:`url(#${uid})`}/>;})}
    {visual.nodes.map((node,i)=>{const pos=positions[i],tone=node.tone??i%4,label=text(node.label,lang),chars=Array.from(label),labelLines=chars.length>7?[chars.slice(0,6).join(''),chars.slice(6).join('')]:[label];return <g key={node.id} transform={`translate(${pos.x},${pos.y})`} className="lv-svg-action" onClick={()=>onSelect(i)}>
      <rect x="-64" y="-32" width="128" height="64" rx="7" fill={selected===i?fills[tone]:'#fffdf7'} stroke={selected===i?tones[tone]:'#d5dbcf'} strokeWidth={selected===i?2.3:1.2}/>
      <g transform="translate(-52 -11)" color={tones[tone]}><Icon name={node.icon} size={22}/></g>
      <text x="-21" y={labelLines.length>1?-8:node.tag?-3:5} fontSize={labelLines.length>1?10.5:12} fontWeight="500" fill="#3d5147">{labelLines.map((line,j)=><tspan key={j} x="-21" dy={j?13:0}>{line}</tspan>)}</text>
      {node.tag&&<text x="-21" y={labelLines.length>1?23:16} fontSize="9" fill={tones[tone]}>{text(node.tag,lang)}</text>}
      <circle cx="53" cy="-26" r="9" fill={tones[tone]}/><text x="53" y="-23" textAnchor="middle" fontSize="8.5" fill="white">{i+1}</text>
    </g>;})}
  </svg>;
}

function LearningFigure({visual,lang,anchor}:{visual:Visual;lang:Lang;anchor:string}){
  const [selected,setSelected]=useState(0);
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  const directControls=visual.kind==='process'||(visual.kind==='matrix'&&!!visual.matrix);
  const index=Math.min(selected,visual.nodes.length-1),active=visual.nodes[index];
  return <figure className={'learning-visual lv-kind-'+visual.kind} data-reading-section={anchor} aria-labelledby={'lv-title-'+uid} aria-describedby={'lv-caution-'+uid}>
    <header><span className="lv-section-symbol" aria-hidden="true"><Layers3 size={19}/></span><div><h2 tabIndex={-1} id={'lv-title-'+uid}><Dual value={visual.title} lang={lang}/></h2></div></header>
    <p className="lv-subtitle"><Dual value={visual.subtitle} lang={lang}/></p>
    <div className="lv-canvas"><Diagram visual={visual} lang={lang} selected={index} onSelect={setSelected} uid={'lv-arrow-'+uid}/></div>
    {!directControls&&<div className="lv-controls" role="group" aria-label={lang==='ja'?'図の要素を選ぶ':'选择图中要素'}>{visual.nodes.map((node,i)=><button key={node.id} type="button" className={index===i?'selected':''} aria-pressed={index===i} onClick={()=>setSelected(i)} style={{'--lv-tone':tones[node.tone??i%4],'--lv-fill':fills[node.tone??i%4]} as CSSProperties}><span className="lv-control-number">{String(i+1).padStart(2,'0')}</span><span>{node.quote&&<span className="lv-poem-verse" lang="zh-Hans">{node.quote}</span>}<Dual value={node.label} lang={lang}/>{visual.kind==='geo-map'&&node.tag&&<small className="lv-map-node-tag"><Dual value={node.tag} lang={lang}/></small>}</span></button>)}</div>}
    <div className="lv-detail" aria-live="polite" style={{'--lv-tone':tones[active.tone??index%4]} as CSSProperties}><span className="lv-detail-icon"><Icon name={active.icon}/></span><div><strong><Dual value={active.label} lang={lang}/></strong><p><Dual value={active.detail} lang={lang}/></p></div></div>
    <figcaption><p className="lv-caution" id={'lv-caution-'+uid}><Dual value={visual.caution} lang={lang}/></p><div className="lv-sources"><span>{lang==='ja'?'図の出典':'图解依据'}</span>{visual.sources.map(source=><a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{text(source.title,lang)}<ArrowUpRight size={11}/></a>)}</div></figcaption>
  </figure>;
}

const eventVisuals=(eventId:string)=>visuals.filter(item=>item.eventIds.includes(eventId));
const sectionAnchor=(visual:Visual,index:number)=>index===0?'visual':'visual-'+visual.id;
export const getLearningVisualSections=(eventId:string)=>eventVisuals(eventId).map((visual,index)=>({id:sectionAnchor(visual,index),title:visual.title}));
export const hasLearningVisual=(eventId:string)=>eventVisuals(eventId).length>0;

export function EventLearningVisual({eventId,lang}:{eventId:string;lang:Lang}){
 return <>{eventVisuals(eventId).map((visual,index)=><LearningFigure key={eventId+'-'+visual.id} visual={visual} lang={lang} anchor={sectionAnchor(visual,index)}/>)}</>;
}
