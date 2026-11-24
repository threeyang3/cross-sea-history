"use client";
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { Asset, Lang, Pair, Question } from './content-types';
import { sources } from './content';

export const choose = (value: Pair, lang: Lang) => lang === 'ja' ? value.ja : value.zh;
export function Bilingual({ value, lang, className = '' }: { value: Pair; lang: Lang; className?: string }) {
  return <span className={'bilingual ' + className}><span lang={lang === 'ja' ? 'ja' : 'zh-CN'}>{choose(value,lang)}</span>{lang === 'bi' && <span className="translation" lang="ja">{value.ja}</span>}</span>;
}
export function SourceLinks({ ids, lang }: { ids: string[]; lang: Lang }) {
  return <div className="ref-links">{[...new Set(ids)].map(id => { const source=sources.find(s=>s.id===id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{choose(source.title,lang)}<ArrowUpRight size={13}/></a> : null; })}</div>;
}
export function Credit({ asset, lang, full = false }: { asset: Asset; lang: Lang; full?: boolean }) {
  return <div className={'photo-credit ' + (full ? 'full-credit' : '')}><a href={asset.sourcePage} target="_blank" rel="noreferrer">{asset.author || (lang==='ja'?'所蔵機関':'收藏机构')}</a><span> · </span><a href={asset.licenseURL || asset.sourcePage} target="_blank" rel="noreferrer">{asset.license}</a>{full && <><span> · </span><span>{lang==='ja'?'撮影・資料情報':'摄影与资料信息'}{asset.dateTaken ? ' · '+asset.dateTaken : ''}</span></>}</div>;
}
export function Photo({ asset, lang, onOpen, priority = false, className = '', caption = true }: { asset?: Asset; lang: Lang; onOpen: (id:string)=>void; priority?: boolean; className?: string; caption?: boolean }) {
  if (!asset) return null;
  return <figure className={'photo '+className}><button className="photo-open" onClick={()=>onOpen(asset.id)} aria-label={(lang==='ja'?'画像を拡大：':'放大图片：')+choose(asset.title,lang)}><img src={asset.src} alt={choose(asset.alt,lang)} width={asset.width} height={asset.height} loading={priority?'eager':'lazy'} decoding="async"/><span className="zoom-hint"><Maximize2 size={15}/>{lang==='ja'?'拡大':'放大观察'}</span></button>{caption && <figcaption><Bilingual value={asset.caption} lang={lang}/><Credit asset={asset} lang={lang}/></figcaption>}</figure>;
}
// Keep the document locked until the last modal closes. Only the top modal
// handles Escape and Tab; a nested overlay must not unlock its parent.
const dialogStack:HTMLElement[]=[];
let savedBodyOverflow='';
const focusable=(root:HTMLElement)=>Array.from(root.querySelectorAll<HTMLElement>('button,a[href],input,textarea,select,summary,[tabindex]')).filter(el=>el.tabIndex>=0&&!el.matches(':disabled')&&!el.closest('[inert]')&&el.getClientRects().length>0);
export function Dialog({ title, children, onClose, className='' }: {title:string; children:React.ReactNode; onClose:()=>void; className?:string}) {
  const box=useRef<HTMLElement>(null); const close=useRef(onClose); const id=useId();
  useEffect(()=>{close.current=onClose;},[onClose]);
  useEffect(()=>{
    const root=box.current;if(!root)return;
    const before=document.activeElement instanceof HTMLElement?document.activeElement:null;
    if(!dialogStack.length){savedBodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
    dialogStack.push(root);
    (focusable(root)[0]??root).focus({preventScroll:true});
    const key=(e:KeyboardEvent)=>{
      if(e.defaultPrevented||dialogStack[dialogStack.length-1]!==root)return;
      if(e.key==='Escape'){e.preventDefault();close.current();return;}
      if(e.key!=='Tab')return;
      const targets=focusable(root);
      if(!targets.length){e.preventDefault();root.focus({preventScroll:true});return;}
      const first=targets[0],last=targets[targets.length-1],active=document.activeElement;
      if(!root.contains(active)){e.preventDefault();(e.shiftKey?last:first).focus();}
      else if(e.shiftKey&&(active===first||active===root)){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&active===last){e.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',key);
    return()=>{
      document.removeEventListener('keydown',key);
      const wasTop=dialogStack[dialogStack.length-1]===root;
      const index=dialogStack.indexOf(root);if(index>=0)dialogStack.splice(index,1);
      if(!dialogStack.length)document.body.style.overflow=savedBodyOverflow;
      if(wasTop&&before?.isConnected)before.focus({preventScroll:true});
    };
  },[]);
  return <div className="modal-backdrop" onClick={onClose}><section ref={box} className={'dialog '+className} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id} onClick={e=>e.stopPropagation()}><button className="dialog-close" aria-label="关闭 / 閉じる" onClick={onClose}><X size={21}/></button><h2 id={id}>{title}</h2>{children}</section></div>;
}
export function ImageViewer({ images, selected, lang, onChange, onClose }: {images:Asset[];selected:string;lang:Lang;onChange:(id:string)=>void;onClose:()=>void}) {
  const index=images.findIndex(i=>i.id===selected);const asset=images[index];
  const [zoomedId,setZoomedId]=useState<string|null>(null);
  const zoom=zoomedId===selected;
  function toggleZoom(){setZoomedId(current=>current===selected?null:selected);}
  function changeImage(id:string){setZoomedId(null);onChange(id);}
  if(!asset)return null;
  return <Dialog title={choose(asset.title,lang)} onClose={onClose} className="image-dialog"><div className={'image-stage '+(zoom?'is-zoomed':'')}><img src={asset.src} alt={choose(asset.alt,lang)} onClick={toggleZoom} width={asset.width} height={asset.height}/></div><div className="image-controls"><button onClick={()=>changeImage(images[(index-1+images.length)%images.length].id)} aria-label={lang==='ja'?'前の画像':'上一张'}><ChevronLeft size={20}/></button><span>{index+1} / {images.length}</span><button className="text-button" onClick={toggleZoom}>{zoom?(lang==='ja'?'全体を表示':'适合窗口'):(lang==='ja'?'原寸で見る':'查看大图')}</button><button onClick={()=>changeImage(images[(index+1)%images.length].id)} aria-label={lang==='ja'?'次の画像':'下一张'}><ChevronRight size={20}/></button></div><p><Bilingual value={asset.caption} lang={lang}/></p><Credit asset={asset} lang={lang} full/><p className="attribution-detail">{asset.attribution}</p><a className="text-button" href={asset.sourcePage} target="_blank" rel="noreferrer">{lang==='ja'?'原資料と利用条件':'查看原图页面与使用许可'}<ArrowUpRight size={15}/></a></Dialog>;
}
export function QuestionCard({ question, lang, answer, onAnswer, number }: {question:Question;lang:Lang;answer?:number;onAnswer:(id:string,value:number)=>void;number?:number}) {
  const correct=answer===question.answer;
  return <section className="quiz-card"><div className="quiz-label">{lang==='ja'?'史料を読んで考える':'读材料，再判断'} {number?String(number).padStart(2,'0'):''}{answer!==undefined&&correct&&<Check size={16}/>}</div><h3><Bilingual value={question.prompt} lang={lang}/></h3><div className="quiz-options">{question.options.map((option,i)=><button key={i} aria-pressed={answer===i} className={answer===i?(correct?'selected correct':'selected reconsider'):''} onClick={()=>onAnswer(question.id,i)}><span className="option-letter">{'ABCD'[i]}</span><Bilingual value={option} lang={lang}/></button>)}</div>{answer!==undefined&&<div className={'quiz-feedback '+(correct?'correct':'reconsider')} role="status"><strong>{correct?(lang==='ja'?'根拠を押さえています':'判断有依据'):(lang==='ja'?'もう一度、資料に戻ってみよう':'回到材料，再想一想')}</strong><p><Bilingual value={question.explanation} lang={lang}/></p><SourceLinks ids={question.sourceIds} lang={lang}/></div>}</section>;
}
