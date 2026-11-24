"use client";
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Lang, Pair } from './content-types';
import { Bilingual, choose } from './learning-ui';
import records from './data/museum-images.json';
import local from './data/museum-local.json';

export type MuseumAsset = {id:string;objectId:number;accession:string;date:string;title:Pair;author:string;caption:Pair;alt:Pair;width:number;height:number;sourcePage:string;originalFileURL:string;license:string;licenseURL:string;verifiedAt:string;localFile:string};
export const museumAssets = records as MuseumAsset[];
const localFiles = local as Record<string,{src:string;width:number;height:number;sha256:string}>;
export const museumAsset = (id:string) => museumAssets.find(asset=>asset.id===id);
const poemLinks:Record<string,string[]> = {
 'jiang-jin-jiu':['met-li-bai-cup','met-li-bai-flask'],
 'jing-ye-si':['met-moon-landscape'],
 'jiang-xue':['met-river-hamlet'],
 'huang-he-lou':['met-willow-boat'],
 'feng-qiao-ye-bo':['met-river-hamlet'],
 'ru-meng-ling-stream':['met-willow-boat'],
 'shui-diao-ge-tou':['met-moon-landscape']
};
const eventLinks:Record<string,string[]> = {
 'cn-tang-poetry-farewell':['met-willow-boat'],
 'cj-sinan-shipwreck':['met-longquan-bowl'],
 'cj-nagasaki-restrictions':['met-nagasaki-ships','met-nagasaki-1859'],
 'cj-tojin-yashiki':['met-nagasaki-1859']
};
const resolve=(ids:string[]|undefined)=>(ids??[]).map(museumAsset).filter((a):a is MuseumAsset=>!!a);
export const poemMuseumAssets=(id:string)=>resolve(poemLinks[id]);
export const eventMuseumAssets=(id:string)=>resolve(eventLinks[id]);

export function MuseumImage({asset,lang,className=''}:{asset:MuseumAsset;lang:Lang;className?:string}){
 const [failed,setFailed]=useState(false);
 const cached=localFiles[asset.id];
 return failed?<div className={'museum-image-unavailable '+className} role="img" aria-label={choose(asset.alt,lang)}>{choose(asset.title,lang)}</div>:<img className={className} src={cached?.src??asset.originalFileURL} width={cached?.width??asset.width} height={cached?.height??asset.height} alt={choose(asset.alt,lang)} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>;
}
export function MuseumCredit({asset,lang}:{asset:MuseumAsset;lang:Lang}){
 return <div className="museum-credit"><a href={asset.sourcePage} target="_blank" rel="noreferrer">{lang==='ja'?'メトロポリタン美術館':'大都会艺术博物馆'} · {asset.accession}<ArrowUpRight size={12}/></a><a href={asset.licenseURL} target="_blank" rel="noreferrer">{asset.license}</a></div>;
}
export function MuseumFigure({asset,lang,className=''}:{asset:MuseumAsset;lang:Lang;className?:string}){
 return <figure className={'museum-figure '+className}><a className="museum-figure-link" href={asset.sourcePage} target="_blank" rel="noreferrer" aria-label={(lang==='ja'?'作品の詳細：':'馆藏详情：')+choose(asset.title,lang)}><MuseumImage key={asset.id} asset={asset} lang={lang}/></a><figcaption><strong><Bilingual value={asset.title} lang={lang}/></strong><small>{asset.date}</small><p><Bilingual value={asset.caption} lang={lang}/></p><MuseumCredit asset={asset} lang={lang}/></figcaption></figure>;
}
