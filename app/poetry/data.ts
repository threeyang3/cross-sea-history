import { pair as p } from "../content-types";
import { mingQing } from "./ming-qing";
import { song } from "./song";
import { tang } from "./tang";
import type { Period, Poem } from "./types";

export const periods = [
  { id: "tang", title: p("唐诗", "唐詩"), name: p("唐代", "唐代") },
  { id: "song", title: p("宋词", "宋詞"), name: p("宋代", "宋代") },
  { id: "ming", title: p("明代诗词", "明代の詩詞"), name: p("明代", "明代") },
  { id: "qing", title: p("清代诗词", "清代の詩詞"), name: p("清代", "清代") },
] satisfies { id: Period; title: ReturnType<typeof p>; name: ReturnType<typeof p> }[];

export const poems = [...tang, ...song, ...mingQing];
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
    poem.form.zh, poem.form.ja, ...poem.lines.map(textOf),
  ].join(" "))] as const;
});

export function searchPoems(query: string, period: Period | "all" = "all") {
  const words = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  return entries.filter(([poem, value]) =>
    (period === "all" || poem.period === period) && words.every(word => value.includes(word)),
  ).map(([poem]) => poem);
}
