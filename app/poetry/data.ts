import { pair as p } from "../content-types";
import { mingQing } from "./ming-qing";
import { song } from "./song";
import { tang } from "./tang";
import { mingQingExpansion } from "./ming-qing-expansion";
import { songExpansion, yuan } from "./song-yuan-expansion";
import { tangExpansion } from "./tang-expansion";
import type { FormGroup, Period, Poem, Theme } from "./types";

export const periods = [
  { id: "tang", title: p("唐诗", "唐詩"), name: p("唐代", "唐代") },
  { id: "song", title: p("宋代诗词", "宋代の詩詞"), name: p("宋代", "宋代") },
  { id: "yuan", title: p("元曲", "元曲"), name: p("元代", "元代") },
  { id: "ming", title: p("明代诗词", "明代の詩詞"), name: p("明代", "明代") },
  { id: "qing", title: p("清代诗词", "清代の詩詞"), name: p("清代", "清代") },
] satisfies { id: Period; title: ReturnType<typeof p>; name: ReturnType<typeof p> }[];

export const formGroups: Record<FormGroup, ReturnType<typeof p>> = {
  jueju: p("绝句", "絶句"),
  regulated: p("律诗", "律詩"),
  song: p("乐府与歌行", "楽府・歌行"),
  ci: p("词", "詞"),
  qu: p("散曲", "散曲"),
};

export const themes: Record<Theme, ReturnType<typeof p>> = {
  landscape: p("山水与四时", "山水と四季"),
  journey: p("羁旅与乡愁", "旅と望郷"),
  relationships: p("亲情、友情与相思", "家族・友情・恋慕"),
  frontier: p("边塞与征战", "辺境と戦"),
  history: p("怀古与时局", "懐古と時局"),
  daily: p("日常与风俗", "日常と風習"),
  integrity: p("咏物与自况", "物に託す心"),
  wine: p("饮酒与人生", "酒と人生"),
};

export type PoetryFilters = {
  period?: Period | "all";
  form?: FormGroup | "all";
  theme?: Theme | "all";
};

export const poems = [
  ...tang, ...tangExpansion, ...song, ...songExpansion, ...yuan,
  ...mingQing.filter(poem => poem.period === "ming"),
  ...mingQingExpansion.filter(poem => poem.period === "ming"),
  ...mingQing.filter(poem => poem.period === "qing"),
  ...mingQingExpansion.filter(poem => poem.period === "qing"),
];
export const poemById = new Map(poems.map(poem => [poem.id, poem]));
export const farewellPoem = "huang-he-lou";

export function textOf(line: Poem["lines"][number]) {
  return line.map(token => token.text).join("");
}

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\s\p{P}]/gu, "");
}

const entries = poems.map(poem => {
  const sourceTitle = decodeURI(new URL(poem.source.url).pathname);
  const period = periods.find(group => group.id === poem.period);
  return [poem, normalize([
    poem.title, poem.author, poem.authorJa, sourceTitle, period?.title.zh, period?.title.ja,
    poem.form.zh, poem.form.ja, formGroups[poem.form.group].zh, formGroups[poem.form.group].ja,
    themes[poem.theme].zh, themes[poem.theme].ja, ...poem.lines.map(textOf),
  ].join(" "))] as const;
});

export function searchPoems(query: string, { period = "all", form = "all", theme = "all" }: PoetryFilters = {}) {
  const words = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  return entries.filter(([poem, value]) =>
    (period === "all" || poem.period === period)
    && (form === "all" || poem.form.group === form)
    && (theme === "all" || poem.theme === theme)
    && words.every(word => value.includes(word)),
  ).map(([poem]) => poem);
}
