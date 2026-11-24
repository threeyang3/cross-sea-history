// Geometry-only helpers so reader navigation can be tested without a browser.
/** @param {number} value @param {number} max */
const clamp=(value,max)=>Math.min(Math.max(0,value),Math.max(0,max));

/**
 * @param {{scrollTop:number,scrollHeight:number,clientHeight:number,marker:number,sections:{id:string,top:number}[]}} input
 */
export function readingPosition({scrollTop,scrollHeight,clientHeight,marker,sections}){
 const max=Math.max(0,scrollHeight-clientHeight);
 const position=clamp(scrollTop,max);
 const progress=max?Math.round(position/max*100):0;
 let activeId=sections[0]?.id??'overview';
 for(const section of sections){
  if(section.top<=marker)activeId=section.id;
  else break;
 }
 if(max>0&&position>=max-2&&sections.length)activeId=sections[sections.length-1].id;
 return {activeId,progress};
}

/** @param {{scrollTop:number,targetTop:number,scrollerTop:number,toolbarHeight:number,scrollHeight:number,clientHeight:number}} input */
export function readingTarget({scrollTop,targetTop,scrollerTop,toolbarHeight,scrollHeight,clientHeight}){
 return clamp(scrollTop+targetTop-scrollerTop-toolbarHeight-12,scrollHeight-clientHeight);
}
