"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Compass, Download, Landmark, MapPin, NotebookPen, X } from "lucide-react";
import AtlasArt from "./atlas-art";

type Lang = "zh" | "ja" | "bi";
type Section = "home" | "tang" | "places" | "ming" | "desk";
type Pair = { zh: string; ja: string };
const p = (zh: string, ja: string): Pair => ({ zh, ja });

const sources = [
  { id: "qinglong", title: p("西安市文物局 · 青龙寺遗址", "西安市文物局・青龍寺遺跡"), url: "https://wwj.xa.gov.cn/xwzx/tzgg/1902288108237918209.html", type: p("遗址介绍 · 中文", "遺跡の解説・中国語"), use: p("青龙寺遗址、空海与现代纪念建筑", "青龍寺遺跡・空海・近現代の記念建築") },
  { id: "kukai", title: p("东寺 · 弘法大师空海", "東寺・弘法大師空海"), url: "https://toji.or.jp/smp/kukai/", type: p("寺院历史介绍 · 日文", "寺院による歴史解説・日本語"), use: p("804年赴唐、806年归国与823年东寺", "804年の入唐・806年の帰国・823年の東寺") },
  { id: "grid", title: p("京都市 · 条坊制", "京都市・条坊制"), url: "https://www2.city.kyoto.lg.jp/somu/rekishi/fm/nenpyou/htmlsheet/toshi03", type: p("城市历史资料 · 日文", "都市史資料・日本語"), use: p("平安京的街区、朱雀大路与规划差异", "平安京の区画・朱雀大路・都市計画の違い") },
  { id: "heian", title: p("京都市 · 京都的历史", "京都市・みてみよう歴史"), url: "https://www.city.kyoto.lg.jp/sogo/page/0000097185.html?furigana=on", type: p("城市历史导读 · 日文", "歴史の入門解説・日本語"), use: p("794年平安京与长安的关联", "794年の平安京と長安との関わり") },
  { id: "pagoda", title: p("东寺 · 五重塔", "東寺・五重塔"), url: "https://toji.or.jp/smp/guide/gojunoto/", type: p("建筑介绍 · 日文", "建築の解説・日本語"), use: p("现存五重塔于1644年重建", "現存する五重塔の1644年の再建") },
  { id: "kiyomizu", title: p("清水寺 · 历史", "清水寺・歴史"), url: "https://www.kiyomizudera.or.jp/history.php", type: p("寺院历史介绍 · 日文", "寺院による歴史解説・日本語"), use: p("开创传统与现存伽蓝的年代", "開創の伝承と現存する伽藍の年代") },
  { id: "wangbo", title: p("e国宝 · 王勃集卷第二十九、三十（纸背）", "e国宝・王勃集巻第二十九・三十（紙背）"), url: "https://emuseum.nich.go.jp/detail?content_base_id=100228&content_part_id=002&content_pict_id=0&langId=", type: p("馆藏记录 · 中日文可切换", "所蔵品の解説・日中言語切替あり"), use: p("唐代抄本、纸背书写与推定的流传过程", "唐代の写本・紙背の書写・推定される伝来") },
  { id: "institutions", title: p("故宫博物院 · 宫廷典制", "故宮博物院・宮廷の制度"), url: "https://www.dpm.org.cn/court/systems.html", type: p("博物馆专题 · 中文", "博物館の特集・中国語"), use: p("明清中央机构与宫廷制度", "明清の中央機構と宮廷制度") },
  { id: "scroll", title: p("台北故宫 · 清院本清明上河图", "台北・故宮博物院・清院本清明上河図"), url: "https://theme.npm.edu.tw/selection/Article.aspx?sNo=04000988", type: p("馆藏解说 · 中文", "所蔵品の解説・中国語"), use: p("1736年清院本与画中的城市生活", "1736年の清院本と描かれた都市生活") },
  { id: "trade", title: p("中国国家博物馆 · 浮槎万里", "中国国家博物館・浮槎万里"), url: "https://www.chnmuseum.cn/zl/gbxz/202212/t20221230_257927.shtml", type: p("陶瓷海上贸易展 · 中文", "陶磁器の海上交易展・中国語"), use: p("明清外销瓷、生产与海外市场", "明清の輸出陶磁器・生産・海外市場") },
];

const modules: { id: Exclude<Section, "home">; title: Pair; desc: Pair; small: Pair; icon: typeof Compass }[] = [
  { id: "tang", title: p("唐代主线", "唐代の交流"), desc: p("从长安与空海，读懂跨海求学。", "長安と空海から、海を越える学びへ。"), small: p("人物 · 年代 · 知识", "人物・年代・知識"), icon: Compass },
  { id: "places", title: p("地标漫游", "史跡をめぐる"), desc: p("在长安、青龙寺与京都之间，寻找联系。", "長安・青龍寺・京都のつながりを探す。"), small: p("城市 · 寺院 · 历史层次", "都市・寺院・歴史の重なり"), icon: MapPin },
  { id: "ming", title: p("明清书房", "明清の書斎"), desc: p("走进明清的制度、城市与海上生活。", "明清の制度・都市・海上交易を読む。"), small: p("独立的中国史入口", "中国史を学ぶ独立した入口"), icon: BookOpen },
  { id: "desk", title: p("史料与摘记", "史料とノート"), desc: p("对照资料、查看出处，留下一点理解。", "資料と出典を確かめ、自分の言葉を残す。"), small: p("双语 · 来源 · 我的问题", "二言語・出典・自分の問い"), icon: NotebookPen },
];

const timeline = [
  { year: "794", title: p("平安京", "平安京"), body: p("平安京建立。京都市的历史导读将其规划与唐代长安联系起来。", "平安京が造営されます。京都市の歴史解説は、その都市計画と唐の長安との関わりを紹介しています。"), source: ["heian", "grid"] },
  { year: "804", title: p("渡海入唐", "海を渡って唐へ"), body: p("空海乘遣唐使船赴唐。旅途中的求学，成为这条人物线索的起点。", "空海が遣唐使船で唐へ渡ります。異国での学びをたどる人物の物語は、ここから始まります。"), source: ["kukai"] },
  { year: "805", title: p("青龙寺求学", "青龍寺で学ぶ"), body: p("空海在长安青龙寺师从惠果学习密教。城市中的一座寺院，连接起具体的师承与知识传递。", "空海は長安の青龍寺で恵果から密教を学びます。一つの寺院が、師弟関係と知識の伝達を結びます。"), source: ["qinglong", "kukai"] },
  { year: "806", title: p("返回日本", "日本へ帰る"), body: p("空海返回日本。接下来可以追问：学到的知识，怎样进入新的社会与寺院？", "空海が日本へ帰ります。学んだ知識は、新たな社会や寺院にどのように根づいたのでしょうか。"), source: ["kukai"] },
  { year: "823", title: p("京都东寺", "京都の東寺"), body: p("嵯峨天皇将东寺交给空海。东寺成为观察其归国后活动的重要地点。", "嵯峨天皇から東寺が空海に託されます。東寺は、帰国後の活動を知る重要な場所となります。"), source: ["kukai"] },
];

const places = [
  { name: p("长安", "長安"), sub: p("一座都城，许多相遇", "都に集う、人と知識"), location: p("唐代都城 · 今西安一带", "唐の都・現在の西安周辺"), variant: "city" as const, source: ["qinglong", "kukai"], facts: [
    { tag: p("时代背景", "時代の背景"), text: p("从都城生活与寺院网络进入唐代。青龙寺遗址是隋大兴、唐长安城遗址的一部分。", "都の暮らしと寺院のつながりから唐代を学びます。青龍寺遺跡は、隋の大興城・唐の長安城の遺跡の一部です。") },
    { tag: p("城市中的一个点", "都の中の一地点"), text: p("空海在长安求学的经历，让宏大的城市史与一个人的学习相遇。", "長安で学んだ空海を通じて、都市の歴史を一人の学びから考えます。") }
  ], question: p("如果从一座寺院观察长安，你还想了解谁在这里生活、学习？", "一つの寺院から長安を見るとき、そこで暮らし、学んだ誰に会ってみたいですか？") },
  { name: p("青龙寺", "青龍寺"), sub: p("把求学的故事，放回真实地点", "学びの物語を、実際の場所へ"), location: p("长安城内的交流史迹", "長安城内にあった交流の史跡"), variant: "temple" as const, source: ["qinglong", "kukai"], facts: [
    { tag: p("唐代的联系", "唐代のつながり"), text: p("805年，空海在青龙寺师从惠果学习密教。这里是人物、知识与地点相互连接的节点。", "805年、空海は青龍寺で恵果から密教を学びました。人・知識・場所が交わる地点です。") },
    { tag: p("今天看到什么", "現在見られるもの"), text: p("今日景区包含古代遗址与现代纪念建筑。惠果空海纪念堂于1984年完成，应与唐代原建筑区分。", "現在は古代の遺跡と近現代の記念建築を見られます。恵果・空海記念堂は1984年の完成で、唐代の建物とは区別します。") }
  ], question: p("一处地方的历史，可以怎样保存在遗址、建筑和纪念活动中？", "一つの場所の歴史は、遺跡・建築・記念の営みの中にどう残るのでしょう？") },
  { name: p("京都", "京都"), sub: p("在熟悉的街巷里，辨认历史层次", "見慣れた街に、歴史の重なりを探す"), location: p("平安京 · 东寺 · 清水寺", "平安京・東寺・清水寺"), variant: "kyoto" as const, source: ["grid", "heian", "kukai", "pagoda", "kiyomizu"], facts: [
    { tag: p("都城规划", "都の計画"), text: p("平安京参考中国都城制度，条坊与中轴提供了比较入口；它的街区安排也有自己的特点。", "平安京は中国の都の制度を参考にしました。条坊や中軸を比べるとともに、独自の区画のあり方にも注目します。") },
    { tag: p("东寺 · 人物的联系", "東寺・人物のつながり"), text: p("823年东寺交给空海；今天的五重塔则重建于1644年。历史传承与现存建筑年代，需要分别阅读。", "823年に東寺は空海に託されました。現存する五重塔は1644年の再建です。歴史の継承と建物の年代を分けて読みます。") },
    { tag: p("清水寺 · 观察的入口", "清水寺・観察の入口"), text: p("清水寺的开创传统追溯至778年，现存伽蓝大多重建于1633年。它帮助我们观察京都的历史层次。", "清水寺は778年の開創と伝えられ、現存する伽藍の多くは1633年の再建です。京都の歴史の重なりを考える入口です。") }
  ], question: p("看见一座古寺时，怎样区分创建年代、传承历史和眼前建筑？", "古い寺院を見るとき、創建・歴史的な継承・現在の建物をどう区別しますか？") }
];

const mingTopics = [
  { title: p("国家的制度", "国家のしくみ"), subtitle: p("谁在处理政务？", "政務を担うのは誰？"), body: p("从内阁与军机处等机构进入明清政治史，比较不同阶段怎样处理政务。", "内閣や軍機処などを入口に、明清の政治史を読み、時期ごとの政務の仕組みを比べます。"), note: p("按朝代与具体时期辨认机构，避免把它们拼成一张不分年代的组织图。", "王朝と時期を確かめ、異なる時代の機構を一枚の組織図に混ぜないようにします。"), source: "institutions", tags: p("制度 · 官员 · 文书", "制度・官僚・文書") },
  { title: p("城市的日常", "都市の日常"), subtitle: p("一幅画里，藏着怎样的生活？", "一枚の絵に、どんな暮らしが見える？"), body: p("从1736年的清院本《清明上河图》观察商铺、交通与表演，认识清代画家描绘的城市生活。", "1736年の清院本『清明上河図』に描かれた店・交通・見世物から、清代の画家が表した都市生活を眺めます。"), note: p("这幅清院本与北宋张择端本不同；画中的城市需要结合创作背景来理解。", "清院本は北宋の張択端本とは異なります。描かれた都市を、制作の背景とともに考えます。"), source: "scroll", tags: p("画卷 · 商业 · 生活", "絵巻・商業・暮らし") },
  { title: p("海上的往来", "海を行き交うもの"), subtitle: p("一件瓷器，如何连接世界？", "一つの器が、世界をどう結ぶ？"), body: p("以外销瓷为线索，连接明清中国的窑场、港口与海外市场，观察生产、运输和消费。", "輸出陶磁器を手がかりに、明清中国の窯・港・海外市場を結び、生産・輸送・消費を考えます。"), note: p("贸易网络呈现更广阔的海外联系。具体器物的航程，仍需逐件寻找证据。", "交易網から、より広い海外との関係が見えます。個々の器の航路には、それぞれの証拠が必要です。"), source: "trade", tags: p("瓷器 · 港口 · 市场", "陶磁器・港・市場") },
];

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const [section, setSection] = useState<Section>("home");
  const [place, setPlace] = useState(0);
  const [event, setEvent] = useState(2);
  const [ming, setMing] = useState(0);
  const [guide, setGuide] = useState(false);
  const [note, setNote] = useState("");
  const [question, setQuestion] = useState("");
  const [saved, setSaved] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [storage, setStorage] = useState(true);
  const t = (value: Pair) => lang === "ja" ? value.ja : value.zh;
  const tx = (zh: string, ja: string) => t(p(zh, ja));
  const text = (value: Pair, cls = "") => <span className={"bilingual " + cls}><span lang={lang === "ja" ? "ja" : "zh-CN"}>{t(value)}</span>{lang === "bi" && <span className="translation" lang="ja">{value.ja}</span>}</span>;
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cross-sea-notes-v1") || "{}");
      setNote(typeof stored.note === "string" ? stored.note : "");
      setQuestion(typeof stored.question === "string" ? stored.question : "");
      const l = localStorage.getItem("cross-sea-lang");
      if (l === "zh" || l === "ja" || l === "bi") setLang(l);
    } catch { setStorage(false); }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "ja" ? "ja" : "zh-CN";
  }, [lang]);
  useEffect(() => {
    if (!guide) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setGuide(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [guide]);
  function changeLang(value: Lang) {
    setLang(value);
    try { localStorage.setItem("cross-sea-lang", value); } catch { /* Language switching remains available. */ }
  }
  function go(value: Section) { setSection(value); setGuide(false); window.scrollTo({ top: 0, behavior: "instant" }); }
  function saveNote() {
    try { localStorage.setItem("cross-sea-notes-v1", JSON.stringify({ note, question })); setSaved(true); setStorage(true); }
    catch { setStorage(false); setSaved(false); }
  }
  function exportNote() {
    const data = ["# 跨海的历史 / 海をわたる歴史", "", "## 我的理解 / 自分の理解", note, "", "## 还想知道 / 次に考えたい問い", question, "", "## 参考资料 / 参考資料", ...sources.map(s => "- " + s.title.zh + " / " + s.title.ja + ": " + s.url)].join("\n");
    const url = URL.createObjectURL(new Blob([data], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "cross-sea-history-notes.md"; a.click(); URL.revokeObjectURL(url);
  }
  const refLinks = (ids: string[]) => <div className="ref-links">{ids.map(id => { const s = sources.find(x => x.id === id)!; return <a href={s.url} key={id} target="_blank" rel="noreferrer">{t(s.title)}<ArrowUpRight size={13}/></a>; })}</div>;
  const heading = (num: string, label: string, title: Pair, desc: Pair) => <div className="page-heading"><div className="eyebrow">{num} / {label}</div><h1>{text(title)}</h1><p>{text(desc)}</p></div>;
  const artCaption = <figcaption>{tx("原创意象插图 · 非建筑或地理复原", "オリジナルのイメージ図・建築や地理の復元図ではありません")}</figcaption>;

  return <div className={"site " + (lang === "bi" ? "dual" : "")}>
    <a className="skip-link" href="#main">{tx("跳至内容", "本文へ")}</a>
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => go("home")} aria-label={tx("返回首页", "ホームへ")}><span className="brand-seal">渡</span><span><strong>{tx("跨海的历史", "海をわたる歴史")}</strong><small>HISTORY ACROSS THE SEA</small></span></button>
        <nav aria-label={tx("主导航", "メインナビゲーション")}>{modules.map(m => <button className={section === m.id ? "active" : ""} key={m.id} onClick={() => go(m.id)} aria-current={section === m.id ? "page" : undefined}>{t(m.title)}</button>)}</nav>
        <div className="header-tools"><button className="guide-button" onClick={() => setGuide(true)} aria-label={tx("网站导览", "サイトガイド")} title={tx("网站导览", "サイトガイド")}><Compass size={19}/></button><div className="languages" aria-label={tx("阅读语言", "表示言語")}>{(["zh", "ja", "bi"] as Lang[]).map(l => <button key={l} onClick={() => changeLang(l)} aria-pressed={lang === l} className={lang === l ? "selected" : ""}>{l === "zh" ? "中" : l === "ja" ? "日本語" : "中 / 日"}</button>)}</div></div>
      </div>
    </header>
    <main id="main">
      {section === "home" && <>
        <section className="hero content-width">
          <div className="hero-copy"><div className="eyebrow"><span className="tiny-dot"/>{tx("唐代中日交流 · 双语学习馆", "唐代の日中交流・二言語で学ぶ")}</div><h1>{tx("从长安出发，", "長安から、")}<br/><em>{tx("读懂跨海的回响。", "海をわたる歴史へ。")}</em></h1><p>{text(p("沿着城市、寺院与书籍，认识唐代中日交流。也为明清中国史，留一间安静的书房。", "都市・寺院・書物をたどり、唐代の日中交流を知る。明清の中国史にも、静かに読める書斎を。"))}</p><div className="hero-actions"><button className="button primary" onClick={() => go("tang")}>{tx("开始唐代之旅", "唐代の交流をたどる")}<ArrowRight size={17}/></button><button className="text-button" onClick={() => setGuide(true)}>{tx("先看网站导览", "サイトの歩き方")}<ArrowUpRight size={15}/></button></div><div className="hero-footnote"><span>CHANG’AN</span><i/><span>QINGLONG TEMPLE</span><i/><span>KYOTO</span></div></div>
          <figure className="hero-art"><AtlasArt/><div className="art-stamp"><span>{tx("城市与人的相遇", "都市と人の出会い")}</span><b>往 来</b></div>{artCaption}</figure>
        </section>
        <section className="module-strip content-width"><div className="section-label">{tx("四个入口，连接你的学习", "四つの入口から、歴史へ")}</div><div className="module-grid">{modules.map((m,i) => <button key={m.id} className="module-card" onClick={() => go(m.id)}><div className="module-top"><span>0{i+1}</span><m.icon size={20}/></div><h2>{t(m.title)}<ArrowUpRight size={18}/></h2><p>{text(m.desc)}</p><small>{t(m.small)}</small></button>)}</div></section>
        <section className="content-width home-places"><div className="section-heading"><div><div className="eyebrow">A SENSE OF PLACE</div><h2>{tx("从熟悉的地标开始", "身近な史跡から始める")}</h2></div><button className="text-button" onClick={() => go("places")}>{tx("查看全部地标", "史跡をめぐる")}<ArrowRight size={16}/></button></div><div className="place-cards">{places.map((v,i) => <button className="place-card" key={i} onClick={() => { setPlace(i); go("places"); }}><div className="place-visual"><AtlasArt variant={v.variant}/><span>0{i+1}</span></div><div className="place-caption"><div><h3>{t(v.name)}</h3><p>{t(v.sub)}</p></div><ArrowUpRight size={20}/></div></button>)}</div></section>
        <section className="content-width ming-invite"><div className="ming-invite-icon"><BookOpen size={31}/></div><div><div className="eyebrow">ANOTHER CHAPTER</div><h2>{tx("唐风之外，还有明清。", "唐の先に、明清の時代へ。")}</h2><p>{text(p("一个独立的中国史入口，配合课程阅读，也容纳新的兴趣。", "授業とともに読める、中国史の独立した入口。新たな関心にも開かれています。"))}</p></div><button className="button pale" onClick={() => go("ming")}>{tx("进入明清书房", "明清の書斎へ")}<ArrowRight size={17}/></button></section>
      </>}

      {section === "tang" && <section className="content-width page-section">
        {heading("01","TANG CONNECTIONS",p("一次渡海，留下怎样的回响？","海を越えた学びは、何を残した？"),p("先把人物与年代放在一起，再走进他们相遇的城市。","人物と年代を確かめてから、出会いのあった都市へ進みます。"))}
        <div className="timeline" aria-label={tx("年代选择", "年代を選ぶ")}>{timeline.map((v,i) => <button key={v.year} className={event === i ? "active" : ""} onClick={() => setEvent(i)} aria-pressed={event === i}><strong>{v.year}</strong><span className="timeline-dot"/><span>{t(v.title)}</span></button>)}</div>
        <div className="timeline-detail"><div className="big-year">{timeline[event].year}<small>CE</small></div><div><span className="tag">{tx("人物与知识的联系", "人物と知識のつながり")}</span><h2>{t(timeline[event].title)}</h2><p>{text(timeline[event].body)}</p>{refLinks(timeline[event].source)}</div></div>
        <p className="quiet-note">{tx("年代提示：平安京建立于794年，早于空海804年赴唐；都城规划与空海求学是两条相关但不同的线索。","年代の確認：平安京の造営は794年で、空海の入唐より前です。都市計画と空海の学びは、関連しながらも異なる手がかりです。")}</p>
        <div className="two-column story-links"><button className="story-card" onClick={() => {setPlace(1);go("places");}}><span className="eyebrow">PLACE & PERSON</span><h3>{tx("青龙寺，一次真实的相遇", "青龍寺、実際にあった出会い")}</h3><p>{text(p("从惠果与空海，认识师承、寺院和知识传递。", "恵果と空海から、師弟関係・寺院・知識の伝達を考えます。"))}</p><span className="link-label">{tx("走进地标", "史跡へ進む")}<ArrowRight size={16}/></span></button><button className="story-card" onClick={() => go("desk")}><span className="eyebrow">OBJECT & EVIDENCE</span><h3>{tx("一卷书的两次生命", "一巻の書物、二つの時間")}</h3><p>{text(p("以《王勃集》纸背为线索，试着区分实物信息与流传推断。", "『王勃集』の紙背から、実物の情報と伝来の推定を読み分けます。"))}</p><span className="link-label">{tx("试读一份材料", "資料を読んでみる")}<ArrowRight size={16}/></span></button></div>
      </section>}

      {section === "places" && <section className="content-width page-section">
        {heading("02","PLACES & MEMORY",p("让历史，有一个可以走近的地方。","歴史に、訪ねられる場所を。"),p("长安提供时代背景，青龙寺连接人物，京都让我们观察历史的延续与变化。","長安から時代を知り、青龍寺で人物を結び、京都で継承と変化を見つめます。"))}
        <div className="place-tabs" role="group" aria-label={tx("地标选择", "史跡を選ぶ")}>{places.map((v,i) => <button key={i} className={place === i ? "active" : ""} onClick={() => setPlace(i)} aria-pressed={place === i}><span>0{i+1}</span>{t(v.name)}</button>)}</div>
        <div className="landmark-panel"><figure><AtlasArt variant={places[place].variant}/>{artCaption}<div className="figure-location"><MapPin size={16}/>{t(places[place].location)}</div></figure><div className="landmark-copy"><h2>{t(places[place].name)}</h2><p className="landmark-subtitle">{t(places[place].sub)}</p>{places[place].facts.map((f,i) => <div className="fact" key={i}><span className="tag">{t(f.tag)}</span><p>{text(f.text)}</p></div>)}{refLinks(places[place].source)}</div></div>
        <div className="question-box"><span className="eyebrow">{tx("带着一个问题看", "問いを持って眺める")}</span><h3>{text(places[place].question)}</h3><button className="text-button" onClick={() => {setQuestion(previous => previous ? previous + "\n\n" + t(places[place].question) : t(places[place].question));setSaved(false);go("desk");}}>{tx("带到我的摘记", "ノートに持っていく")}<ArrowRight size={16}/></button></div>
        <div className="connection-note"><Landmark size={23}/><p>{text(p("这里是一条学习路径：城市背景 → 人物与知识 → 后世的文化地标。连接表示历史关联，实际旅途需要另据史料复原。", "ここでたどるのは学習の道筋です。都市の背景 → 人物と知識 → 後世の史跡。つながりは歴史的な関連を示し、実際の旅程には別の史料が必要です。"))}</p></div>
      </section>}

      {section === "ming" && <section className="content-width page-section">
        {heading("03","THE MING–QING READING ROOM",p("明清书房","明清の書斎"),p("从制度、城市与海上往来，建立明清中国史的阅读线索。可以直接从这里开始。","制度・都市・海上交易から、明清中国史を読む手がかりをつくります。ここから学び始めることもできます。"))}
        <div className="ming-layout"><aside className="reading-shelf">{mingTopics.map((v,i) => <button key={i} className={ming === i ? "active" : ""} onClick={() => setMing(i)} aria-pressed={ming === i}><span>0{i+1}</span><div><strong>{t(v.title)}</strong><small>{t(v.tags)}</small></div><ArrowRight size={17}/></button>)}<div className="shelf-caption">{tx("独立于唐代主线，配合明清课程与个人阅读。","唐代の主線と独立した、明清の授業や読書のための入口。")}</div></aside><article className="ming-article"><div className="ming-art"><AtlasArt variant="ming"/></div><span className="tag">{t(mingTopics[ming].title)}</span><h2>{text(mingTopics[ming].subtitle)}</h2><p className="article-lead">{text(mingTopics[ming].body)}</p><div className="reading-note"><BookOpen size={18}/><p>{text(mingTopics[ming].note)}</p></div>{refLinks([mingTopics[ming].source])}<button className="text-button" onClick={() => {setQuestion(previous => previous ? previous + "\n\n" + t(mingTopics[ming].subtitle) : t(mingTopics[ming].subtitle));setSaved(false);go("desk");}}>{tx("记下我的问题", "問いをノートに残す")}<ArrowRight size={16}/></button></article></div>
      </section>}

      {section === "desk" && <section className="content-width page-section">
        {heading("04","SOURCES & NOTES",p("让每一点理解，都有来处。","理解の一つひとつに、出典を。"),p("先读一份材料，再留下自己的判断。下方可以查看本预览使用的全部来源。","資料を読み、自分の言葉を残します。このプレビューで使った出典も、下で確認できます。"))}
        <div className="two-column desk-grid"><article className="reading-sample"><span className="tag">{tx("资料导读 · 本站释义", "資料案内・当サイトによる要約")}</span><h2>{tx("一卷书的两次生命", "一巻の書物、二つの時間")}</h2><p>{text(p("e国宝介绍的《王勃集》抄本，正面保存唐代诗文，纸背有平安时代末期抄写的佛教戒律。", "e国宝で紹介される『王勃集』の写本は、表に唐代の詩文、紙背に平安時代末期に書写された仏教の戒律を残しています。"))}</p><p>{text(p("馆方对它在奈良时代传入、流传于兴福寺的过程采用推定表述。阅读时，应保留这种判断的边界。", "奈良時代の伝来と興福寺への伝承について、館側は推定として説明しています。読むときも、その留保を大切にします。"))}</p>{refLinks(["wangbo"])}<div className="evidence-check"><strong>{tx("哪种表达更符合这份材料？", "資料に即しているのはどちら？")}</strong>{[p("这卷书一定由空海亲手带回日本。","この巻物は必ず空海自身が日本へ持ち帰った。"),p("馆方对部分流传过程作了推定，携带者仍需其他证据。","伝来の一部は館側の推定で、運んだ人物には別の証拠が必要。")].map((v,i) => <button key={i} className={answer === i ? "chosen" : ""} onClick={() => setAnswer(i)}><span>{i === 0 ? "A" : "B"}</span>{text(v)}</button>)}{answer !== null && <p className={"feedback " + (answer === 1 ? "correct" : "")} role="status">{answer === 1 ? tx("是的。保留“推定”，并避免补出材料没有说明的携带者。","その通りです。「推定」を残し、資料が示さない運搬者を補わずに読みます。") : tx("这份馆藏介绍没有提供“空海亲手携带”的证据。再留意导读中的“推定”。","この所蔵品解説は、空海自身が運んだという証拠を示していません。「推定」に注目してみてください。")}</p>}</div></article>
        <article className="note-card"><NotebookPen size={25}/><h2>{tx("留下一点自己的理解", "自分の言葉を少し残す")}</h2><label htmlFor="understanding">{tx("我的理解", "自分の理解")}</label><textarea id="understanding" value={note} onChange={e=>{setNote(e.target.value);setSaved(false);}} placeholder={tx("我目前认为……依据是……", "今はこう考える。その根拠は……")}/><label htmlFor="question">{tx("还想知道", "次に考えたい問い")}</label><textarea id="question" value={question} onChange={e=>{setQuestion(e.target.value);setSaved(false);}} placeholder={tx("还有哪个问题值得继续找材料？", "どんな問いのために、さらに資料を探したい？")}/><div className="note-actions"><button className="button primary" onClick={saveNote}>{saved ? <Check size={16}/> : <NotebookPen size={16}/>}{saved ? tx("已保存", "保存しました") : tx("保存摘记", "ノートを保存")}</button><button className="button secondary" onClick={exportNote}><Download size={16}/>{tx("导出", "書き出す")}</button></div><p className="storage-note" role="status">{storage ? tx("仅保存在当前浏览器；不会跨设备同步。重要记录请导出保存。","このブラウザーだけに保存されます。端末間の同期はありません。大切な記録は書き出してください。") : tx("当前浏览器无法保存，请使用导出功能保留记录。","このブラウザーでは保存できません。書き出し機能をご利用ください。")}</p></article></div>
        <section className="source-section"><div className="section-heading"><div><div className="eyebrow">READ FURTHER</div><h2>{tx("来源与延伸阅读", "出典と、次の読書へ")}</h2></div><span className="source-count">{sources.length} {tx("份资料", "件の資料")}</span></div><p className="sources-intro">{text(p("以下是本预览的资料入口。正文采用简短释义；外部页面保留原语言。馆方或寺院介绍也有其编写背景，进一步研究需结合原始文献与学术研究。", "以下がプレビューの出典です。本文は短い要約で、リンク先は原言語です。館や寺院の解説にも編纂の背景があり、研究には原史料や学術研究との照合が必要です。"))}</p><div className="source-list">{sources.map((s,i) => <a key={s.id} href={s.url} target="_blank" rel="noreferrer"><span className="source-index">{String(i+1).padStart(2,"0")}</span><div><strong>{t(s.title)}</strong><p>{t(s.use)}</p></div><span className="source-type">{t(s.type)}</span><ArrowUpRight size={18}/></a>)}</div></section>
      </section>}
    </main>
    <footer className="site-footer content-width"><div><strong>{tx("跨海的历史", "海をわたる歴史")}</strong><span>{tx("从熟悉的地方，走进有依据的历史。","身近な場所から、史料のある歴史へ。")}</span></div><div><span className="preview-badge">{tx("设计预览 · 01", "デザインプレビュー・01")}</span><button onClick={() => setGuide(true)}>{tx("网站导览", "サイトガイド")}</button><button onClick={() => go("desk")}>{tx("查看来源", "出典を見る")}</button></div></footer>
    {guide && <div className="modal-backdrop" onClick={() => setGuide(false)}><section className="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={e=>e.stopPropagation()}><button className="close-button" onClick={()=>setGuide(false)} aria-label={tx("关闭导览", "ガイドを閉じる")} autoFocus><X size={20}/></button><div className="eyebrow">YOUR READING PATH</div><h2 id="guide-title">{tx("这座学习馆，怎样走？", "この学びの場を、どう歩く？")}</h2><p>{text(p("唐代交流是一条主线；明清书房可以独立进入。地标、史料与摘记把学习连接起来。", "唐代の交流が主線です。明清の書斎には直接入れます。史跡・史料・ノートが学びをつなぎます。"))}</p><div className="guide-grid">{modules.map((m,i)=><button key={m.id} onClick={()=>go(m.id)}><span>0{i+1}</span><strong>{t(m.title)}</strong><p>{t(m.desc)}</p><ArrowUpRight size={18}/></button>)}</div><div className="guide-bottom"><span>{tx("建议先试", "まずはこちら")}</span><p>{tx("805年青龙寺 → 京都地标 → 读一份史料 → 保存一个问题","805年の青龍寺 → 京都の史跡 → 史料を読む → 問いを残す")}</p></div></section></div>}
  </div>;
}
