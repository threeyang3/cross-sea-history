"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import type { Lang } from "../content-types";
import { Bilingual, choose } from "../learning-ui";
import { MuseumFigure, poemMuseumAssets } from "../museum-images";
import { formGroups, periods, poemById, poems, searchPoems, textOf, themes } from "./data";
import type { FormGroup, Period, Poem, Theme, Token } from "./types";

type ReadableToken = Token & { line: number; index: number; note: string };

function glosses(line: Token[], lineIndex: number) {
  return line.flatMap((token, index): ReadableToken[] =>
    token.note ? [{ ...token, note: token.note, line: lineIndex, index }] : [],
  );
}

function PoemReader({ poem, lang }: { poem: Poem; lang: Lang }) {
  const tx = (zh: string, ja: string) => lang === "ja" ? ja : zh;
  const [selected, setSelected] = useState<ReadableToken>();
  const activeGloss = useRef<HTMLDivElement>(null);
  const inlineGloss = poem.lines.length >= 10;
  const current = selected ?? glosses(poem.lines[0], 0)[0];
  const stanzas = poem.breakAt
    ? [poem.lines.slice(0, poem.breakAt), poem.lines.slice(poem.breakAt)]
    : [poem.lines];
  const period = periods.find(group => group.id === poem.period)!;
  const illustrations = poemMuseumAssets(poem.id);
  const otherPoems = poems.filter(item => item.period === poem.period);
  const index = otherPoems.findIndex(item => item.id === poem.id);
  const previous = otherPoems[index - 1];
  const next = otherPoems[index + 1];

  useEffect(() => {
    if (selected && (inlineGloss || window.matchMedia("(max-width: 760px)").matches)) {
      activeGloss.current?.scrollIntoView({ block: "nearest" });
    }
  }, [inlineGloss, selected]);

  const glossPanel = <div className="poem-active-gloss" id="poem-active-gloss" ref={activeGloss} role="status">
    <div className="poem-gloss-key"><span lang="ja">語注</span><strong lang="zh-CN">{current.text}</strong></div>
    <p lang="ja">{current.note}</p>
  </div>;

  return <article className="poem-reader" aria-labelledby="poem-title">
    <header className="poem-title">
      <p>{choose(period.name, lang)} <span aria-hidden="true">·</span> {choose(poem.form, lang)} <span aria-hidden="true">·</span> {choose(themes[poem.theme], lang)}</p>
      <h2 id="poem-title" tabIndex={-1} lang="zh-CN">{poem.title}</h2>
      <p lang={lang === "ja" ? "ja" : "zh-CN"}>{lang === "ja" ? poem.authorJa : poem.author}</p>
    </header>
    <div className={"poem-visual-spread"+(illustrations.length?" illustrated":"")}>
    {illustrations[0]&&<MuseumFigure key={illustrations[0].id} asset={illustrations[0]} lang={lang} className="poem-artwork"/>}
    <div className="poem-paper">
      {poem.preface && <details className="poem-preface">
        <summary>{tx("原文小序", "序文（原文）")}</summary>
        <p lang="zh-CN">{poem.preface}</p>
      </details>}
      <div className="poem-stanzas">
        {stanzas.map((stanza, stanzaIndex) => <section key={stanzaIndex} className="poem-stanza" lang="zh-CN"
          aria-label={stanzas.length === 1 ? tx("诗词原文", "詩詞の原文") : stanzaIndex === 0 ? "上片" : "下片"}>
          {stanzas.length > 1 && <h3 lang={lang === "ja" ? "ja" : "zh-CN"}>{stanzaIndex === 0 ? "上片" : "下片"}</h3>}
          {stanza.map((line, lineIndex) => {
            const fullLine = lineIndex + (stanzaIndex === 0 ? 0 : (poem.breakAt ?? 0));
            const lineActive = current.line === fullLine;
            return <div key={fullLine} className={inlineGloss ? "poem-inline-gloss" : undefined}>
              <div className="poem-line">
                {line.map((token, tokenIndex) => token.note
                  ? <button key={tokenIndex} type="button" aria-controls={inlineGloss && !lineActive ? undefined : "poem-active-gloss"}
                      aria-pressed={lineActive && current.index === tokenIndex}
                      onClick={() => setSelected({ ...token, note: token.note!, line: fullLine, index: tokenIndex })}>{token.text}</button>
                  : <span key={tokenIndex}>{token.text}</span>)}
              </div>
              {inlineGloss && lineActive && glossPanel}
            </div>;
          })}
        </section>)}
      </div>
      {!inlineGloss && glossPanel}
      <details className="poem-all-glosses">
        <summary>{tx("查看全部日文逐词注", "すべての語注を読む")}</summary>
        <div className="poem-gloss-lines">
          {poem.lines.map((line, lineIndex) => <div key={lineIndex} className="poem-gloss-line">
            <h3 lang="zh-CN">{textOf(line)}</h3>
            <dl>{glosses(line, lineIndex).map(token =>
              <div key={token.index}><dt lang="zh-CN">{token.text}</dt><dd lang="ja">{token.note}</dd></div>,
            )}</dl>
          </div>)}
        </div>
      </details>
    </div>
    </div>
    <section className="poem-commentary" aria-labelledby="poem-commentary-title">
      <h3 id="poem-commentary-title">{tx("赏析", "鑑賞")}</h3>
      <p><Bilingual value={poem.commentary} lang={lang}/></p>
      {illustrations.slice(1).map(asset=><MuseumFigure key={asset.id} asset={asset} lang={lang} className="poem-related-artwork"/> )}
    </section>
    <section className="poem-references" aria-label={tx("原文出处", "原文の出典")}>
      {poem.edition && <p><Bilingual value={poem.edition} lang={lang}/></p>}
      <div>
        <a href={poem.source.url} target="_blank" rel="noreferrer">{poem.source.name}<ArrowUpRight size={14} aria-hidden="true"/></a>
        {poem.related && <a href={poem.related.href} {...(poem.related.href.startsWith("https://") ? { target: "_blank", rel: "noreferrer" } : {})}>
          {choose(poem.related.title, lang)}<ArrowUpRight size={14} aria-hidden="true"/>
        </a>}
      </div>
    </section>
    <nav className="poem-neighbors" aria-label={tx("同朝代选篇", "同じ時代の作品")}>
      {previous && <a href={"#poetry/" + previous.id}><ArrowLeft size={16} aria-hidden="true"/><span lang="zh-CN">{previous.title}</span></a>}
      {next && <a href={"#poetry/" + next.id}><span lang="zh-CN">{next.title}</span><ArrowRight size={16} aria-hidden="true"/></a>}
    </nav>
  </article>;
}

export function PoetryShelf({ lang, poemId }: { lang: Lang; poemId: string }) {
  const tx = (zh: string, ja: string) => lang === "ja" ? ja : zh;
  const poem = poemById.get(poemId) ?? poems[0];
  const [period, setPeriod] = useState<Period | "all">(poemId ? poem.period : "all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormGroup | "all">("all");
  const [theme, setTheme] = useState<Theme | "all">("all");
  const reader = useRef<HTMLDivElement>(null);
  const previousId = useRef(poemId);
  useEffect(() => {
    if (poemId && poemId !== previousId.current) {
      const selectedPoem = poemById.get(poemId);
      if (selectedPoem) {
        setPeriod(current => current === "all" || current === selectedPoem.period ? current : selectedPoem.period);
        setQuery(current => searchPoems(current).some(item => item.id === poemId) ? current : "");
        setForm(current => current === selectedPoem.form.group ? current : "all");
        setTheme(current => current === selectedPoem.theme ? current : "all");
      }
      const title = reader.current?.querySelector<HTMLElement>("#poem-title");
      title?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 760px)").matches) {
        title?.scrollIntoView({ block: "start" });
      }
    }
    previousId.current = poemId;
  }, [poemId]);
  const results = searchPoems(query, { period, form, theme });
  const visiblePeriods = periods.filter(group => period === "all" || group.id === period);

  return <section className="poetry-shelf content-width">
    <header className="poetry-heading">

      <h1>{tx("古诗词选读", "中国の詩詞を読む")}</h1>

      {poem.id !== "jiang-jin-jiu" && <a className="poetry-feature" href="#poetry/jiang-jin-jiu">
        <span>{tx("本次选读", "今回の選読")}</span><strong lang="zh-CN">将进酒</strong>
        <ArrowRight size={15} aria-hidden="true"/>
      </a>}
      <button className="poetry-jump" type="button" onClick={() => {
        const catalog = document.getElementById("poetry-catalog-title");
        catalog?.focus({ preventScroll: true });
        catalog?.scrollIntoView({ block: "start" });
      }}>{tx("浏览选篇", "作品一覧へ")} <ArrowRight size={15} aria-hidden="true"/></button>
    </header>
    <div className="poetry-layout">
      <aside className="poetry-catalog" aria-labelledby="poetry-catalog-title">
        <div className="poetry-catalog-heading"><h2 id="poetry-catalog-title" tabIndex={-1}>{tx("选篇", "作品一覧")}</h2><small role="status">{results.length}{tx(" 首", " 編")}</small></div>
        <label className="poetry-search">
          <Search size={17} aria-hidden="true"/>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            aria-label={tx("搜索诗词", "詩詞を検索")}
            placeholder={tx("搜索篇名、作者或诗句", "題名・作者・詩句で検索")}/>
        </label>
        <div className="poetry-filters" aria-label={tx("按朝代筛选", "時代で絞り込む")} role="group">
          <button type="button" aria-pressed={period === "all"} onClick={() => setPeriod("all")}>{tx("全部", "すべて")}</button>
          {periods.map(group => <button type="button" key={group.id} aria-pressed={period === group.id}
            onClick={() => setPeriod(group.id)}>{choose(group.name, lang)}</button>)}
        </div>
        <div className="poetry-selects">
          <label>{tx("体裁", "形式")}<select value={form} onChange={event => setForm(event.target.value as FormGroup | "all")}>
            <option value="all">{tx("所有体裁", "すべての形式")}</option>
            {Object.entries(formGroups).map(([id, label]) => <option value={id} key={id}>{choose(label, lang)}</option>)}
          </select></label>
          <label>{tx("题材", "題材")}<select value={theme} onChange={event => setTheme(event.target.value as Theme | "all")}>
            <option value="all">{tx("所有题材", "すべての題材")}</option>
            {Object.entries(themes).map(([id, label]) => <option value={id} key={id}>{choose(label, lang)}</option>)}
          </select></label>
        </div>
        <div className="poetry-catalog-results">
        {visiblePeriods.map(group => {
          const matches = results.filter(item => item.period === group.id);
          return matches.length > 0 && <section className="poetry-catalog-group" key={group.id}>
            <h3>{choose(group.title, lang)}</h3>
            <ul>{matches.map(item => <li key={item.id}>
              <a href={"#poetry/" + item.id} onClick={() => {
                if (item.id === poemId) {
                  const title = reader.current?.querySelector<HTMLElement>("#poem-title");
                  title?.focus({ preventScroll: true });
                  title?.scrollIntoView({ block: "start" });
                }
              }} aria-current={poem.id === item.id ? "page" : undefined}>
                <span lang="zh-CN">{item.title}</span>
                <small lang={lang === "ja" ? "ja" : "zh-CN"}>{lang === "ja" ? item.authorJa : item.author}</small>
              </a>
            </li>)}</ul>
          </section>;
        })}
        {results.length === 0 && <p className="poetry-empty">{tx("没有找到匹配的作品。", "該当する作品がありません。")}</p>}
        </div>
      </aside>
      <div className="poetry-reader-column" ref={reader}><PoemReader key={poem.id} poem={poem} lang={lang}/></div>
    </div>
  </section>;
}
