"use client";
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import { Bilingual, choose } from './learning-ui';
import records from './data/museum-images.json';
import local from './data/museum-local.json';
import links from './data/museum-links.json';

export type MuseumAsset = {id:string;objectId:number;accession:string;date:string;title:Pair;author:string;caption:Pair;alt:Pair;width:number;height:number;sourcePage:string;originalFileURL:string;license:string;licenseURL:string;verifiedAt:string;localFile:string};
export const museumAssets = records as MuseumAsset[];
const localFiles = local as Record<string,{src:string;width:number;height:number;sha256:string}>;
export const museumAsset = (id:string) => museumAssets.find(asset=>asset.id===id);
const poemLinks:Record<string,string[]> = links.poems;
const eventLinks:Record<string,string[]> = links.events;
const topicLinks:Record<string,string[]> = links.topics;
const resolve=(ids:string[]|undefined)=>(ids??[]).map(museumAsset).filter((a):a is MuseumAsset=>!!a);
export const poemMuseumAssets=(id:string)=>resolve(poemLinks[id]);
export const eventMuseumAssets=(id:string)=>resolve(eventLinks[id]);
export const topicMuseumAssets=(id:string)=>resolve(topicLinks[id]);

export function MuseumImage({asset,lang,className=''}:{asset:MuseumAsset;lang:Lang;className?:string}){
 const [failedSource,setFailedSource]=useState<string>();
 const cached=localFiles[asset.id];
 const src=cached&&failedSource!==cached.src?cached.src:asset.originalFileURL;
 if(failedSource===asset.originalFileURL)return <span className={'museum-image-unavailable '+className} role="img" aria-label={choose(asset.alt,lang)}>{choose(asset.title,lang)}</span>;
 const size=src===cached?.src?cached:asset;
 return <img key={src} className={className} src={src} width={size.width} height={size.height} alt={choose(asset.alt,lang)} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailedSource(src)}/>;
}
export function MuseumCredit({asset,lang}:{asset:MuseumAsset;lang:Lang}){
 return <div className="museum-credit"><a href={asset.sourcePage} target="_blank" rel="noreferrer">{lang==='ja'?'メトロポリタン美術館':'大都会艺术博物馆'} · {asset.accession}<ArrowUpRight size={12}/></a><a href={asset.licenseURL} target="_blank" rel="noreferrer">{asset.license}</a></div>;
}
export function MuseumFigure({asset,lang,className=''}:{asset:MuseumAsset;lang:Lang;className?:string}){
 return <figure className={'museum-figure '+className}><a className="museum-figure-link" href={asset.sourcePage} target="_blank" rel="noreferrer" aria-label={(lang==='ja'?'作品の詳細：':'馆藏详情：')+choose(asset.title,lang)}><MuseumImage key={asset.id} asset={asset} lang={lang}/></a><figcaption><strong><Bilingual value={asset.title} lang={lang}/></strong><small>{asset.date} · {asset.author==='佚名'?(lang==='ja'?'作者不詳':'佚名'):asset.author}</small><p><Bilingual value={asset.caption} lang={lang}/></p><MuseumCredit asset={asset} lang={lang}/></figcaption></figure>;
}
