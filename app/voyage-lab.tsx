"use client";

import { useId, useState } from 'react';
import { NotebookPen, Route } from 'lucide-react';
import { type Lang, type Pair, pair } from './content-types';
import { Bilingual, SourceLinks, choose } from './learning-ui';

type JourneyNode = {
  date: Pair;
  label: Pair;
  inferred?: boolean;
};

type Journey = {
  id: string;
  title: Pair;
  nodes: [JourneyNode, JourneyNode, JourneyNode, JourneyNode];
  explanation: Pair;
  question: Pair;
  sourceIds: string[];
  uncertainLinks?: boolean;
};

const journeys: Journey[] = [
  {
    id: 'kukai',
    title: pair('空海求学', '空海の学び'),
    nodes: [
      { date: pair('804年', '804年'), label: pair('日本出发', '日本を出発') },
      { date: pair('805年', '805年'), label: pair('长安 · 青龙寺', '長安・青龍寺') },
      { date: pair('806年', '806年'), label: pair('回到日本', '日本へ帰国') },
      { date: pair('823年', '823年'), label: pair('京都 · 东寺', '京都・東寺') },
    ],
    explanation: pair(
      '空海804年入唐，805年在长安青龙寺师从惠果，806年归国并呈交记录经论、图像与法具的《请来目录》。823年，东寺才被交给空海。求学、携回资料与建立教学场所，是发生在不同时间的联系；794年平安京的建立还在这次旅行之前。',
      '空海は804年に唐へ渡り、805年に長安の青龍寺で恵果に学びました。806年の帰国後、経論・図像・法具などを記した『請来目録』を提出します。東寺を託されたのは823年です。修学、資料の持ち帰り、教えを伝える場の整備には時間の隔たりがあります。794年の平安京造営は、この旅より前のことです。',
    ),
    question: pair(
      '青龙寺的求学、806年的归国与823年的东寺活动分别说明了什么？为什么不能把它们合并成同一年发生的故事？',
      '青龍寺での修学、806年の帰国、823年の東寺での活動は、それぞれ何を示すでしょう。なぜ同じ年の出来事としてまとめられないのでしょうか？',
    ),
    sourceIds: ['qinglong', 'kukai'],
  },
  {
    id: 'ganjin',
    title: pair('鉴真东渡', '鑑真の渡日'),
    nodes: [
      { date: pair('688年 · 出生', '688年・誕生'), label: pair('扬州', '揚州') },
      { date: pair('753年', '753年'), label: pair('抵达日本', '日本に到着') },
      { date: pair('抵日之后', '渡日後'), label: pair('奈良 · 东大寺', '奈良・東大寺') },
      { date: pair('759年', '759年'), label: pair('奈良 · 唐招提寺', '奈良・唐招提寺') },
    ],
    explanation: pair(
      '鉴真出生于唐代扬州。应日本留学僧之请，他经历多次渡海尝试，于753年抵日，随后在东大寺活动。759年，他开设学习戒律的道场，成为唐招提寺的起点。抵达日本与建立道场相隔数年：知识的传播也需要弟子、教学场所与持续的实践。',
      '鑑真は唐の揚州に生まれました。日本の留学僧の招きに応じ、何度も渡海を試みた末、753年に日本へ到着し、その後は東大寺で活動しました。759年には戒律を学ぶ道場を開き、これが唐招提寺の始まりとなります。渡日と道場開設の間には数年があります。教えを伝えるには、弟子や学ぶ場所、継続的な実践も必要だったのです。',
    ),
    question: pair(
      '753年抵日与759年开设道场，是两种怎样不同的历史事件？要理解教导如何延续，还应寻找哪些人的活动？',
      '753年の渡日と759年の道場開設は、どのように異なる出来事でしょう。教えの継承を理解するには、さらに誰の活動を調べたいですか？',
    ),
    sourceIds: ['toshodaiji-ganjin', 'toshodaiji-about'],
  },
  {
    id: 'books',
    title: pair('书籍流传', '書物の伝来'),
    nodes: [
      { date: pair('早于690年', '690年より前'), label: pair('唐代抄本', '唐代の写本'), inferred: true },
      { date: pair('奈良时代', '奈良時代'), label: pair('日本 · 兴福寺', '日本・興福寺'), inferred: true },
      { date: pair('平安时代末期', '平安時代末期'), label: pair('纸背再利用', '紙背の再利用') },
      { date: pair('现藏', '現在の所蔵'), label: pair('东京国立博物馆', '東京国立博物館') },
    ],
    explanation: pair(
      '这条线索指向东京国立博物馆所藏《王勃集》卷二十九、三十。馆方根据书风等线索，推定其抄写早于690年；奈良时代传入日本、与兴福寺有关的流传也属于推定。纸背另有平安时代末期抄写的佛教戒律。虚线连接材料的不同阶段，并不补全未知的传递过程；现有说明没有确认携带者或船只，也不能把抄本当成王勃亲笔。',
      'ここで扱うのは、東京国立博物館所蔵の『王勃集』巻二十九・三十です。博物館は書風などから690年より前の書写と推定しています。奈良時代の日本への伝来や興福寺との関係も推定です。紙背には平安時代末期に写された仏教の戒律があります。破線は資料の異なる段階を結ぶもので、未知の伝来過程を埋めるものではありません。解説から運んだ人物や船は特定できず、写本を王勃の自筆とすることもできません。',
    ),
    question: pair(
      '关于这件《王勃集》，哪些判断来自图像观察，哪些依赖馆方推定？要确认携带者或航线，还缺少什么证据？',
      'この『王勃集』について、画像から観察できることと博物館による推定を分けてみましょう。運んだ人物や航路の特定には、さらにどんな証拠が必要ですか？',
    ),
    sourceIds: ['wangbo'],
    uncertainLinks: true,
  },
];

const positions = [
  { x: 20, y: 22 },
  { x: 280, y: 22 },
  { x: 20, y: 230 },
  { x: 280, y: 230 },
];

const disclaimer = pair(
  '这是按阅读顺序组织的关系图。节点位置、间距与连线不代表地理比例、实际航线或连续完整的流传记录；“推定”保留了研究结论的证据边界。',
  '読む順序に沿って構成した関係図です。位置・間隔・線は地理的な縮尺、実際の航路、途切れのない伝来記録を示しません。「推定」は、根拠から判断できる範囲を表しています。',
);

export function VoyageLab({ lang, onQuestion }: { lang: Lang; onQuestion: (q: Pair) => void }) {
  const [selected, setSelected] = useState('kukai');
  const uniqueId = useId().replace(/:/g, '');
  const journey = journeys.find(item => item.id === selected) ?? journeys[0];
  const titleId = `voyage-title-${uniqueId}`;
  const diagramId = `voyage-diagram-${uniqueId}`;
  const descriptionId = `voyage-description-${uniqueId}`;
  const arrowId = `voyage-arrow-${uniqueId}`;
  const accessibleDescription = journey.nodes
    .map((node, index) => `${index + 1}. ${choose(node.date, lang)} ${choose(node.label, lang)}${node.inferred ? (lang === 'ja' ? '、推定' : '，推定') : ''}`)
    .join(' → ');

  return (
    <section className="visual-lab voyage-lab">
      <div className="lab-heading">
        <div>
          <span className="eyebrow"><Bilingual value={pair('人 · 书 · 学习场所', '人・書物・学びの場')} lang={lang} /></span>
          <h2><Bilingual value={pair('跨越海洋，联系如何发生？', '海を越え、つながりはどう生まれる？')} lang={lang} /></h2>
        </div>
        <Route size={26} aria-hidden="true" />
      </div>

      <p className="lab-intro"><Bilingual value={pair('切换一个主题，沿着编号观察年代、地点与证据的变化。', 'テーマを切り替え、番号をたどって年代・場所・根拠の変化を見てみよう。')} lang={lang} /></p>

      <div className="segmented" role="group" aria-label={choose(pair('选择交流主题', '交流のテーマを選ぶ'), lang)}>
        {journeys.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            aria-pressed={selected === item.id}
            aria-controls={diagramId}
          >
            {choose(item.title, lang)}
          </button>
        ))}
      </div>

      <svg
        id={diagramId}
        viewBox="0 0 520 396"
        width="100%"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <title id={titleId}>{choose(journey.title, lang)}</title>
        <desc id={descriptionId}>{accessibleDescription}. {choose(disclaimer, lang)}</desc>
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill="#9b6047" />
          </marker>
        </defs>
        <rect width="520" height="396" rx="12" fill="#f7f4e9" />
        <g fill="none" stroke="#9b6047" strokeWidth="2" strokeDasharray={journey.uncertainLinks ? '6 5' : undefined} markerEnd={`url(#${arrowId})`}>
          <path d="M 240 93 H 269" />
          <path d="M 390 165 V 194 H 130 V 219" />
          <path d="M 240 301 H 269" />
        </g>
        {journey.nodes.map((node, index) => {
          const { x, y } = positions[index];
          const isLast = index === journey.nodes.length - 1;
          return (
            <g key={`${journey.id}-${index}`} transform={`translate(${x} ${y})`}>
              <rect width="220" height="142" rx="9" fill={isLast ? '#ece2cf' : '#e3e9dd'} stroke={isLast ? '#c9b08b' : '#bdc9b1'} />
              <text x="201" y="23" textAnchor="end" fill="#7b8873" fontSize="12" fontWeight="600">{String(index + 1).padStart(2, '0')}</text>
              <text x="16" y="36" fill="#8a4c35" fontSize="16" fontWeight="600" lang={lang === 'ja' ? 'ja' : 'zh-CN'}>{choose(node.date, lang)}</text>
              <text x="16" y={lang === 'bi' ? 71 : 83} fill="#2d453a" fontSize="20" fontWeight="600" lang={lang === 'ja' ? 'ja' : 'zh-CN'}>{choose(node.label, lang)}</text>
              {lang === 'bi' && <text x="16" y="97" fill="#556b5d" fontSize="17" lang="ja">{node.label.ja}</text>}
              {node.inferred && <text x="16" y="125" fill="#835b3f" fontSize="13">{choose(pair('推定', '推定'), lang)}</text>}
            </g>
          );
        })}
      </svg>

      <p className="lab-explanation" aria-live="polite"><Bilingual value={journey.explanation} lang={lang} /></p>
      <p className="diagram-disclaimer"><Bilingual value={disclaimer} lang={lang} /></p>
      <SourceLinks ids={journey.sourceIds} lang={lang} />
      <p><Bilingual value={journey.question} lang={lang} /></p>
      <button className="text-button" type="button" onClick={() => onQuestion(journey.question)}>
        <NotebookPen size={16} aria-hidden="true" />
        <Bilingual value={pair('带着这个问题做摘记', 'この問いをノートへ')} lang={lang} />
      </button>
    </section>
  );
}
