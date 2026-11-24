"use client";

import type { CSSProperties } from 'react';
import type { Lang, Pair } from './content-types';
import { Bilingual, choose } from './learning-ui';

export type DiagramNode = { id:string;label:Pair;detail:Pair;icon?:string;quote?:string;tag?:Pair;x?:number;y?:number;tone?:number;geo?:{lon:number;lat:number;dx?:number;dy?:number;anchor?:'start'|'end'|'middle';area?:boolean} };
export type DiagramEdge = {from:number;to:number;dashed?:boolean};
export type DiagramMatrix = {columns:Pair[];rows:{label:Pair;cells:number[]}[]};
type Props = {nodes:DiagramNode[];lang:Lang;selected:number;onSelect:(i:number)=>void};
const tones=['#b34f3b','#3f6484','#357c70','#a77b2d'];
const fills=['#fae4dc','#e4edf5','#e0f0e8','#f6edcf'];
const toneStyle=(node:DiagramNode,i:number)=>({'--diagram-tone':tones[node.tone??i%4],'--diagram-fill':fills[node.tone??i%4]} as CSSProperties);

function DiagramButton({node,index,lang,selected,onSelect,number=false}:{node:DiagramNode;index:number;lang:Lang;selected:number;onSelect:(i:number)=>void;number?:boolean}){
 return <button type="button" className="hd-cell" aria-pressed={index===selected} style={toneStyle(node,index)} onClick={()=>onSelect(index)}>
 {number&&<span className="hd-index" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>}
 {node.tag&&<small><Bilingual value={node.tag} lang={lang}/></small>}
 <strong><Bilingual value={node.label} lang={lang}/></strong>
 </button>;
}
export function ProcessDiagram({nodes,lang,selected,onSelect}:Props){
 return <ol className="hd-process" style={{'--diagram-count':nodes.length} as CSSProperties}>
 {nodes.map((node,index)=><li key={node.id}><DiagramButton node={node} index={index} lang={lang} selected={selected} onSelect={onSelect} number/>{index<nodes.length-1&&<span className="hd-arrow" aria-hidden="true">→</span>}</li>)}
 </ol>;
}
export function ComparisonDiagram({nodes,matrix,lang,selected,onSelect}:Props&{matrix:DiagramMatrix}){
 return <table className="hd-matrix"><thead><tr><th scope="col"><span className="hd-visually-hidden">{lang==='ja'?'比較項目':'比较项目'}</span></th>{matrix.columns.map((column,i)=><th scope="col" key={i}><Bilingual value={column} lang={lang}/></th>)}</tr></thead><tbody>
 {matrix.rows.map((row,i)=><tr key={i}><th scope="row"><Bilingual value={row.label} lang={lang}/></th>{row.cells.map(index=><td key={index}><DiagramButton node={nodes[index]} index={index} lang={lang} selected={selected} onSelect={onSelect}/></td>)}</tr>)}
 </tbody></table>;
}

// Modern land outline: Natural Earth low-resolution public-domain polygons,
// dissolved to remove modern borders, clipped to 116–143 E / 23–40 N,
// simplified and projected to the fixed coordinate frame below.
// This is only a geographic reference, not a historical reconstruction.
const eastAsiaLand='M312,35L308,46L332,58L353,81L359,117L350,128L308,140L286,142L288,116L277,95L295,92L279,75L267,71L257,77L243,68L255,57L258,39L232,31L154,52L167,43L161,35L169,30L322,30ZM123,30L104,45L80,46L67,55L80,69L100,72L101,81L121,87L148,73L185,81L189,91L155,97L143,108L120,118L107,132L133,143L143,162L174,196L174,211L159,216L165,227L179,233L175,250L169,265L155,267L95,339L30,370L30,30ZM158,370L132,370L130,359L164,324L175,330ZM430,170L430,161L444,149L458,151L468,143L486,147L489,154L475,166L465,160L452,164L446,176ZM496,138L454,142L425,152L396,152L421,167L405,201L389,209L377,202L383,184L368,178L358,164L381,158L436,121L485,115L511,119L537,84L553,93L603,66L618,41L616,30L663,30L663,46L640,67L641,87L631,103L636,113L623,127L592,137L549,138L514,161L497,153Z';
const project=(lon:number,lat:number)=>({x:30+(lon-116)*660/27,y:30+(40-lat)*340/17});
export function GeographicDiagram({nodes,edges,lang,selected,onSelect}:Props&{edges:DiagramEdge[]}){
 const points=nodes.map(n=>n.geo?project(n.geo.lon,n.geo.lat):null);
 return <div className="hd-map"><svg className="lv-svg hd-map-svg" viewBox="0 0 720 400" aria-hidden="true">
 <rect x="30" y="30" width="660" height="340" rx="4" fill="#e4eff0"/>
 <path d={eastAsiaLand} fill="#e5e4d6" stroke="#a8b7a9" strokeWidth="1.3" strokeLinejoin="round"/>
 {[120,125,130,135,140].map(lon=>{const {x}=project(lon,40);return <g key={lon}><path d={`M${x} 30V370`} stroke="#829da2" strokeDasharray="2 7" opacity=".45"/><text x={x} y="386" textAnchor="middle" fontSize="10" fill="#62797c">{lon}°E</text></g>})}
 {[25,30,35,40].map(lat=>{const {y}=project(116,lat);return <g key={lat}><path d={`M30 ${y}H690`} stroke="#829da2" strokeDasharray="2 7" opacity=".45"/><text x="26" y={y+4} textAnchor="end" fontSize="10" fill="#62797c">{lat}°N</text></g>})}
 <text x="672" y="50" fontSize="13" textAnchor="middle" fill="#647a72">N ↑</text>
 {edges.map((edge,i)=>{const a=points[edge.from],b=points[edge.to];if(!a||!b)return null;return <path key={i} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} stroke="#547d91" strokeDasharray="7 6" strokeWidth="2" fill="none"/>})}
 {nodes.map((node,i)=>{const pt=points[i],geo=node.geo;if(!pt||!geo)return null;const active=selected===i,c=tones[node.tone??i%4];return <g key={node.id} className="lv-svg-action" onClick={()=>onSelect(i)}>
 {geo.area&&<circle cx={pt.x} cy={pt.y} r="17" fill={c} fillOpacity=".13" stroke={c} strokeDasharray="4 4"/>}
 <circle cx={pt.x} cy={pt.y} r={active?9:6.5} fill={active?c:'#fffdf7'} stroke={c} strokeWidth="2.3"/>
 <text x={pt.x+(geo.dx??12)} y={pt.y+(geo.dy??-12)} textAnchor={geo.anchor??'start'} fill="#344e43" stroke="#f9f9ef" strokeWidth="3" paintOrder="stroke" fontSize="13" fontWeight={active?700:500}>{i+1}. {choose(node.label,lang)}</text>
 </g>})}
 </svg><div className="hd-map-legend"><span><i className="hd-map-point"/>{lang==='ja'?'参照地点':'参考地点'}</span><span><i className="hd-map-link"/>{lang==='ja'?'地点の関係（航跡ではない）':'地点关联（非航迹）'}</span>{nodes.some(node=>node.geo?.area)&&<span><i className="hd-map-area"/>{lang==='ja'?'概略海域':'大致海域'}</span>}<a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth · Public Domain</a></div></div>;
}
