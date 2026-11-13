import type { Pair } from "../content-types";

export type Period = "tang" | "song" | "yuan" | "ming" | "qing";

export type Theme = "landscape" | "journey" | "relationships" | "frontier" | "history" | "daily" | "integrity" | "wine";
export type FormGroup = "jueju" | "regulated" | "song" | "ci" | "qu";
export type PoemForm = Pair & { group: FormGroup };

export type Token = { text: string; note?: string };

export type Poem = {
  id: string;
  period: Period;
  title: string;
  author: string;
  authorJa: string;
  form: PoemForm;
  theme: Theme;
  lines: Token[][];
  breakAt?: number;
  preface?: string;
  commentary: Pair;
  edition?: Pair;
  source: { name: string; url: string };
  related?: { title: Pair; href: string };
};

export const forms = {
  five: { zh: "五言绝句", ja: "五言絶句", group: "jueju" },
  seven: { zh: "七言绝句", ja: "七言絶句", group: "jueju" },
  regulated: { zh: "五言律诗", ja: "五言律詩", group: "regulated" },
  sevenRegulated: { zh: "七言律诗", ja: "七言律詩", group: "regulated" },
  yuefu: { zh: "乐府歌行", ja: "楽府の歌行", group: "song" },
  newYuefu: { zh: "新乐府", ja: "新楽府", group: "song" },
  ci: { zh: "词", ja: "詞", group: "ci" },
  longCi: { zh: "长调", ja: "長調の詞", group: "ci" },
  qu: { zh: "散曲·小令", ja: "散曲・小令", group: "qu" },
} satisfies Record<string, PoemForm>;

export function verse(text: string, ...notes: string[]): Token[] {
  const words = text.split("|");
  if (words.length !== notes.length) throw new Error("Missing gloss for " + text);
  return words.flatMap((word, index) => {
    const match = word.match(/^(.+?)([，。？！、；：]+)$/u);
    return match
      ? [{ text: match[1], note: notes[index] }, { text: match[2] }]
      : [{ text: word, note: notes[index] }];
  });
}

export function wikisource(title: string, name = "维基文库 / ウィキソース") {
  return { name, url: "https://zh.wikisource.org/wiki/" + encodeURI(title) };
}
