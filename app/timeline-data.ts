import raw from './data/timeline.json';
import { pair as p } from './content-types';
import type { TimelineCategory, TimelineData, TimelinePeriod, TimelineTrack } from './timeline-types';

export const timelineData = raw as unknown as TimelineData;
export const historicalEvents = [...timelineData.events].sort((a,b)=>a.start-b.start || a.id.localeCompare(b.id));
export const timelineSources = timelineData.sources;
export const categoryOrder: TimelineCategory[] = ['politics','religion','culture','economy','technology','conflict'];
export const categoryInfo = {
  politics: { title:p('政治与外交','政治・外交'), color:'#91b9b0', dark:'#356d61' },
  religion: { title:p('宗教与求学','宗教・学び'), color:'#c5b1db', dark:'#76528d' },
  culture: { title:p('文化与书籍','文化・書物'), color:'#e6bd79', dark:'#96702e' },
  economy: { title:p('贸易与社会','交易・社会'), color:'#9fcb8c', dark:'#547b40' },
  technology: { title:p('技术与知识','技術・知識'), color:'#8bbfda', dark:'#337394' },
  conflict: { title:p('战争与冲突','戦争・紛争'), color:'#e6a091', dark:'#a45140' },
};
export const timelinePeriods: Record<TimelineTrack,TimelinePeriod[]> = {
 exchange: [
  {id:'all',title:p('全景','全体'),start:1,end:2008,note:p('从早期使节与物品往来，到近现代战争、外交与民间交流。','初期の使節と文物の往来から、近現代の戦争・外交・民間交流へ。')},
  {id:'early',title:p('早期往来','初期の往来'),start:1,end:580,note:p('从金印与使节记载开始，认识早期东亚关系中的材料与解释。','金印や使節の記録から、初期東アジアの関係を史料とともに読む。')},
  {id:'tang',title:p('隋唐交流','隋唐の交流'),start:581,end:907,note:p('使节、僧人、学者与书籍，连接长安、奈良和平安京。','使節・僧侶・学者・書物が、長安・奈良・平安京を結ぶ。')},
  {id:'song-yuan',title:p('宋元往来','宋元の往来'),start:908,end:1367,note:p('观察官方使节以外的商船、僧侣网络，以及战争造成的变化。','公式の使節以外にも、商船と僧侶のネットワーク、戦争による変化を見る。')},
  {id:'ming',title:p('明代与室町','明と室町'),start:1368,end:1599,note:p('勘合贸易、海上秩序与朝鲜半岛战争，共同构成这一时期。','勘合貿易、海上の秩序、朝鮮半島での戦争を同じ時代の中で考える。')},
  {id:'edo',title:p('明清与江户','明清と江戸'),start:1600,end:1867,note:p('从长崎、唐船与汉籍，看见贸易和知识流通的具体渠道。','長崎・唐船・漢籍から、交易と知識の具体的な流通経路を知る。')},
  {id:'modern',title:p('近代转折','近代の転換'),start:1868,end:1945,note:p('留学与思想交流、不平等条约、侵略和战争，需要放在一起理解。','留学と思想交流、不平等条約、侵略と戦争を合わせて理解する。')},
  {id:'postwar',title:p('战后往来','戦後の往来'),start:1945,end:2008,note:p('关注邦交正常化、条约、民间交流及其历史背景。','国交正常化、条約、民間交流とその歴史的背景をたどる。')},
 ],
 china: [
  {id:'all',title:p('全景','全体'),start:-3500,end:2008,note:p('从考古遗址到现代社会，用事件连接政治、经济、文化与技术。','考古遺跡から現代社会まで、出来事を通じて政治・経済・文化・技術を結ぶ。')},
  {id:'early',title:p('文明与先秦','文明と先秦'),start:-3500,end:-222,note:p('考古年代、传世文献与后世解释，共同帮助我们认识早期历史。','考古学的年代、伝世文献、後世の解釈から初期の歴史を学ぶ。')},
  {id:'qin-han',title:p('秦汉','秦漢'),start:-221,end:220,note:p('帝国制度、跨区域交通、知识整理与社会变动。','帝国の制度、地域間交通、知識の編纂、社会の変動。')},
  {id:'division',title:p('魏晋南北朝','魏晋南北朝'),start:221,end:580,note:p('在政权并存、人口迁徙与文化交融中，观察长期变化。','政権の並存、人口移動、文化の交わりから長期的な変化を見る。')},
  {id:'tang',title:p('隋唐','隋唐'),start:581,end:907,note:p('都城、运河、制度、宗教与印刷，也是中日交流的时代背景。','都城・運河・制度・宗教・印刷は、日中交流の時代背景でもある。')},
  {id:'song-yuan',title:p('五代宋辽金元','五代・宋遼金元'),start:907,end:1367,note:p('并行政权、城市经济与知识传播；朝代名称并非一条简单接力线。','並存する政権、都市経済、知識の伝播。王朝名は単純な一本の交代線ではない。')},
  {id:'ming-qing',title:p('明清','明清'),start:1368,end:1912,note:p('重点观察国家治理、城市生活、海外联系与书籍文化。','国家の統治、都市生活、海外との関係、書物の文化に注目する。')},
  {id:'modern',title:p('近现代','近現代'),start:1840,end:2008,note:p('战争、改革、革命与社会建设；从多类材料理解变化和代价。','戦争・改革・革命・社会建設を、多様な資料から変化と代償の両面で読む。')},
 ],
};

// Historical year numbering has no year zero; chart arithmetic uses a continuous coordinate.
export const yearCoordinate = (year:number) => year>0 ? year-1 : year;
export const coordinateYear = (coordinate:number) => { const n=Math.round(coordinate);return n>=0?n+1:n; };
export const formatYear = (year:number,ja=false) => year<0?(ja?'前':'前')+Math.abs(year):String(year);
